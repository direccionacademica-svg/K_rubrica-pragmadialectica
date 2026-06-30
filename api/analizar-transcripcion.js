// api/analizar-transcripcion.js
//
// Función serverless de Vercel. Recibe el texto de una transcripción,
// llama a la API de Claude (Anthropic) usando la API key guardada de forma
// segura en las variables de entorno del servidor, y regresa un JSON con
// el score sugerido (0-3) y evidencia citada para cada una de las 10 reglas.
//
// La API key (ANTHROPIC_API_KEY) NUNCA se expone al navegador: vive solo
// en el servidor de Vercel.

const RULES_SUMMARY = `
1. Regla de la libertad: todas las voces pueden entrar y ser escuchadas.
2. Regla de la carga de la prueba: quien afirma, fundamenta.
3. Regla del punto de vista: se ataca la idea, no a la persona.
4. Regla de la relevancia: los argumentos vienen al caso.
5. Explicitación de supuestos: no inventar ni esconder premisas implícitas.
6. Regla del punto de partida: respetar lo ya acordado, no inventar consensos.
7. Esquema argumentativo: usar el tipo de argumento pertinente al contexto (no solo autoridad o tradición).
8. Regla de la validez lógica: la conclusión debe derivarse de las premisas.
9. Regla del cierre: aceptar los resultados del contraste de argumentos.
10. Regla del lenguaje: claridad y buena fe, sin ambigüedad ni eufemismos.
`.trim()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY no está configurada en el servidor.' })
    return
  }

  const { transcript } = req.body || {}
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
    res.status(400).json({ error: 'La transcripción está vacía o es demasiado corta.' })
    return
  }

  // Recorta transcripciones muy largas para mantenernos dentro de límites razonables
  const MAX_CHARS = 60000
  const safeTranscript = transcript.length > MAX_CHARS
    ? transcript.slice(0, MAX_CHARS) + '\n\n[...transcripción truncada por longitud...]'
    : transcript

  const systemPrompt = `Eres un evaluador experto en pragmadialéctica (teoría de van Eemeren y Grootendorst). Tu tarea es leer la transcripción de una reunión de comité o consejo y evaluar qué tan bien se siguieron las 10 reglas de la discusión crítica.

Reglas a evaluar:
${RULES_SUMMARY}

Para cada regla, asigna un puntaje de 0 a 3:
0 = No se observa / se vulnera sistemáticamente
1 = Presente de forma incidental o desigual
2 = Presente de forma consistente, con fallas menores
3 = Integrado en la cultura y reforzado explícitamente

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, sin backticks de markdown, con esta forma exacta:

{
  "scores": [n0, n1, n2, n3, n4, n5, n6, n7, n8, n9],
  "evidencia": [
    "evidencia breve para regla 1 (máx 200 caracteres, parafraseada, sin citas textuales largas)",
    "evidencia breve para regla 2",
    ...
  ]
}

El array "scores" debe tener exactamente 10 enteros entre 0 y 3, en el orden de las reglas listadas arriba.
El array "evidencia" debe tener exactamente 10 strings breves explicando en qué te basaste para cada puntaje, parafraseando lo observado en la transcripción (nunca copies frases largas textuales).
Si la transcripción no da información suficiente para juzgar una regla, usa tu mejor estimación basada en lo disponible y dilo brevemente en la evidencia (ej. "Información insuficiente; se infiere de...").`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Transcripción de la reunión:\n\n${safeTranscript}` }
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      res.status(502).json({ error: 'Error al llamar a la API de Claude: ' + errText })
      return
    }

    const data = await response.json()
    const textBlock = (data.content || []).find(b => b.type === 'text')
    if (!textBlock) {
      res.status(502).json({ error: 'La respuesta de Claude no contenía texto.' })
      return
    }

    let cleaned = textBlock.text.trim()
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '')

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch (e) {
      res.status(502).json({ error: 'No se pudo interpretar la respuesta de Claude como JSON.', raw: cleaned })
      return
    }

    if (!Array.isArray(parsed.scores) || parsed.scores.length !== 10) {
      res.status(502).json({ error: 'La respuesta no tiene el formato esperado (scores).' })
      return
    }

    const scores = parsed.scores.map(s => Math.max(0, Math.min(3, Math.round(Number(s)))))
    const evidencia = Array.isArray(parsed.evidencia) && parsed.evidencia.length === 10
      ? parsed.evidencia
      : new Array(10).fill('')

    res.status(200).json({ scores, evidencia })
  } catch (err) {
    res.status(500).json({ error: 'Error inesperado: ' + err.message })
  }
}
