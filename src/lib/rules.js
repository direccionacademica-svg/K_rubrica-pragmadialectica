export const RULES = [
  {
    num: '1',
    title: 'Regla de la libertad',
    sub: 'Todas las voces pueden entrar y ser escuchadas',
    levels: [
      'Se interrumpe o desacredita a quienes disienten; algunos consejeros casi no hablan.',
      'La mayoría puede hablar, pero intervenciones minoritarias se cortan o se dejan para otra ocasión.',
      'Se da espacio regular a voces minoritarias; la presidencia corrige interrupciones.',
      'La agenda contempla escuchar perspectivas diversas; la presidencia protege la participación equilibrada e invita a hablar a quienes han permanecido callados.',
    ],
  },
  {
    num: '2',
    title: 'Regla de la carga de la prueba',
    sub: 'Quien afirma, fundamenta',
    levels: [
      'Se aceptan afirmaciones sin evidencia; se decide con base en jerarquía o carisma.',
      'Ocasionalmente se piden datos, pero muchas afirmaciones clave quedan sin sustento.',
      'La mayoría de las propuestas estratégicas se sustentan con información, análisis y escenarios.',
      'Es práctica habitual solicitar y ofrecer respaldo explícito (datos, modelos, precedentes) antes de decidir.',
    ],
  },
  {
    num: '3',
    title: 'Regla del punto de vista',
    sub: 'Se ataca la idea, no a la persona',
    levels: [
      'Abundan ataques personales o desviaciones ("usted siempre…", "su área nunca…").',
      'Se mezclan críticas a la propuesta con juicios personales, aunque no es lo dominante.',
      'La crítica se centra en la propuesta; ataques personales son excepcionales y alguien los modera.',
      'La cultura exige criticar ideas, no personas; la presidencia reconduce cualquier comentario ad hominem de inmediato.',
    ],
  },
  {
    num: '4',
    title: 'Regla de la relevancia',
    sub: 'Los argumentos vienen al caso',
    levels: [
      'La discusión se llena de anécdotas o política interna sin conexión con la decisión.',
      'Hay argumentos pertinentes, pero se diluyen entre muchos comentarios irrelevantes.',
      'La mayor parte del tiempo se dedica a razones ligadas al asunto: riesgos, impacto financiero, cumplimiento.',
      'La moderación reconduce sistemáticamente hacia la relevancia; la agenda está bien acotada.',
    ],
  },
  {
    num: '5',
    title: 'Explicitación de supuestos',
    sub: 'No inventar ni esconder premisas implícitas',
    levels: [
      'Se atribuyen intenciones al otro sin haberlas dicho; nadie explicita sus supuestos.',
      'A veces se clarifican supuestos, pero también se infieren intenciones sin preguntar.',
      'Es común que alguien pregunte "¿qué estás asumiendo aquí?" y se expliciten supuestos clave.',
      'El comité tiene práctica consistente de nombrar y validar supuestos; se evita atribuir motivos ocultos sin evidencia.',
    ],
  },
  {
    num: '6',
    title: 'Regla del punto de partida',
    sub: 'Respetar lo ya acordado y no inventar consensos',
    levels: [
      'Se desconocen políticas o acuerdos previos según convenga al argumento del momento.',
      'A veces se recuerda el marco acordado, pero se reabre sin justificación cuando estorba.',
      'Las discusiones se anclan en documentos y acuerdos marco previamente adoptados.',
      'El comité recuerda explícitamente los puntos de partida y solo los revisa mediante procesos formales.',
    ],
  },
  {
    num: '7',
    title: 'Esquema argumentativo',
    sub: 'Usar el argumento pertinente al contexto',
    levels: [
      'Predominan argumentos de autoridad ("porque lo digo yo/el consultor") o de tradición ("siempre ha funcionado así") sin estructura racional.',
      'Hay intentos de argumentar con causas o consecuencias, pero siguen dominando apelaciones débiles.',
      'Las propuestas se sostienen en esquemas claros: coste-beneficio, riesgo-retorno, precedentes, evidencia empírica.',
      'El comité identifica y refina los esquemas conscientemente y privilegia los más robustos al contexto.',
    ],
  },
  {
    num: '8',
    title: 'Regla de la validez lógica',
    sub: 'La conclusión debe derivarse de las premisas',
    levels: [
      'Se aceptan generalizaciones apresuradas, falsas dicotomías o correlaciones tomadas como causalidad.',
      'A veces se detectan y corrigen fallas lógicas, pero muchas pasan sin revisión.',
      'Varios miembros identifican y cuestionan inferencias dudosas; se corrigen saltos lógicos antes de decidir.',
      'Hay "higiene lógica" institucionalizada: se examinan relaciones causa-efecto, alternativas y análisis de sensibilidad.',
    ],
  },
  {
    num: '9',
    title: 'Regla del cierre',
    sub: 'Aceptar los resultados del contraste de argumentos',
    levels: [
      'Nadie reconoce haber cambiado de opinión; los desacuerdos quedan latentes y reaparecen en cada sesión.',
      'A veces se reconoce un ajuste de postura, pero decisiones quedan "aceptadas a regañadientes" sin cierre claro.',
      'Al concluir un punto, se explicita qué posición se adopta y qué objeciones se consideran resueltas o pendientes.',
      'La cultura normaliza reconocer que se cambia de postura ante mejores argumentos; se documenta el cierre de discrepancias.',
    ],
  },
  {
    num: '10',
    title: 'Regla del lenguaje',
    sub: 'Claridad y buena fe en el lenguaje',
    levels: [
      'Abundan expresiones ambiguas, eufemismos confusos y jergas no explicadas.',
      'A veces se pide aclaración, pero muchos términos quedan vagos ("mejorar", "optimizar", "crecer") sin definición operativa.',
      'Se precisan términos clave, alcances de decisiones, métricas y plazos; se pregunta "¿cómo lo entendemos todos?".',
      'El comité redacta acuerdos claros (quién, qué, cuándo, cómo se medirá) y verifica comprensión compartida antes de cerrar.',
    ],
  },
]

export const SCORE_COLORS = {
  0: { bg: '#FEE2E2', text: '#991B1B', bar: '#EF4444' },
  1: { bg: '#FEF3C7', text: '#92400E', bar: '#F59E0B' },
  2: { bg: '#D1FAE5', text: '#065F46', bar: '#10B981' },
  3: { bg: '#CCFBF3', text: '#0F6B5F', bar: '#2DD9C4' },
}

export const LEVEL_LABELS = {
  'Básico':        { range: '0–9',   bg: '#FEE2E2', text: '#991B1B' },
  'En desarrollo': { range: '10–16', bg: '#FEF3C7', text: '#92400E' },
  'Maduro':        { range: '17–23', bg: '#D1FAE5', text: '#065F46' },
  'Excelente':     { range: '24–30', bg: '#EFE9FB', text: '#2D0A8C' },
}

export function getLevel(total) {
  if (total <= 9)  return 'Básico'
  if (total <= 16) return 'En desarrollo'
  if (total <= 23) return 'Maduro'
  return 'Excelente'
}

export const LEVEL_DESCRIPTIONS = {
  'Básico':        'La dinámica deliberativa presenta fallas graves y recurrentes. Se recomienda intervención formativa.',
  'En desarrollo': 'Hay esfuerzos visibles, pero la calidad argumentativa es irregular. Hay áreas de mejora prioritaria.',
  'Maduro':        'La discusión crítica es la norma. Persisten oportunidades de consolidación en algunas reglas.',
  'Excelente':     'La cultura de deliberación rigurosa está institucionalizada. Es un modelo replicable.',
}
