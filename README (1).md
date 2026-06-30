# Rúbrica Pragmadialéctica — App Web

Aplicación React para evaluar la calidad de la discusión crítica en comités y consejos,
basada en las 10 reglas de la pragmadialéctica de van Eemeren y Grootendorst.

---

## Paso a paso: de cero a producción

### PASO 1 — Crear la base de datos en Supabase (gratis, 5 min)

1. Ve a https://supabase.com y crea una cuenta (es gratis).
2. Clic en **"New project"**. Dale un nombre (ej. `rubrica-app`) y elige una contraseña.
   Espera ~2 minutos a que se cree el proyecto.
3. En el menú lateral, ve a **SQL Editor → New query**.
4. Copia y pega todo el contenido del archivo `supabase_schema.sql` y presiona **Run**.
   Verás el mensaje "Success. No rows returned." — eso es correcto.
5. Abre una **nueva query** (botón "+") y pega el contenido de `supabase_schema_v2_programas.sql`.
   Presiona **Run**. Esto agrega las tablas de Programas y Sesiones, y deja dos programas
   de ejemplo ya creados (puedes borrarlos después desde el panel de administrador).
6. Ve a **Settings → API** (menú lateral).
   Copia dos valores que necesitarás en el paso 3:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **Publishable key** (antes llamada "anon key")

---

### PASO 1.5 — Obtener una API key de Anthropic (para el prellenado con IA, 3 min)

Esto habilita el botón "Prellenar con transcripción (IA)".

1. Ve a https://console.anthropic.com y crea una cuenta (si no tienes una).
2. Ve a **API Keys → Create Key**. Dale un nombre (ej. `rubrica-app`) y cópiala
   (empieza con `sk-ant-...`). Guárdala en un lugar seguro, no podrás volver a verla completa.
3. Esta cuenta requiere agregar un método de pago para generar tráfico de la API
   (el uso de esta función es de bajo costo: cada análisis de transcripción cuesta
   centavos de dólar, dependiendo de la longitud).

---

### PASO 2 — Subir el código a GitHub (5 min)

1. Crea una cuenta en https://github.com si no tienes una.
2. Crea un repositorio nuevo: clic en **"New repository"**, nómbralo `rubrica-pragmadialéctica`,
   déjalo **público** (o privado si prefieres — Vercel puede acceder a ambos).
3. En tu computadora, abre una terminal en la carpeta de este proyecto y ejecuta:

```bash
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/rubrica-pragmadialéctica.git
git push -u origin main
```

> Si no tienes Git instalado: https://git-scm.com/downloads

---

### PASO 3 — Deployar en Vercel (gratis, 3 min)

1. Ve a https://vercel.com y crea una cuenta (puedes entrar con tu cuenta de GitHub).
2. Clic en **"Add New Project"**.
3. Importa el repositorio que creaste en el paso 2.
4. Antes de hacer clic en **Deploy**, abre la sección **"Environment Variables"**
   y agrega estas cuatro variables:

| Nombre                    | Valor                                      |
|---------------------------|--------------------------------------------|
| `VITE_SUPABASE_URL`       | La Project URL del paso 1 (ej. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY`  | La Publishable key del paso 1              |
| `VITE_ADMIN_PASSWORD`     | La clave que quieras para el panel (cámbiala) |
| `ANTHROPIC_API_KEY`       | La API key del paso 1.5 (`sk-ant-...`) — **sin** prefijo `VITE_` |

> Importante: `ANTHROPIC_API_KEY` NO debe llevar el prefijo `VITE_`. Esto es intencional:
> las variables con `VITE_` se exponen al navegador, pero esta key debe quedarse solo en
> el servidor. La función en `api/analizar-transcripcion.js` es la única que la usa.

5. Clic en **Deploy**. En ~1 minuto tendrás una URL pública tipo:
   `https://rubrica-pragmadialéctica.vercel.app`

---

### PASO 4 — Compartir con los participantes

- Comparte la URL directamente. No requiere cuenta ni instalación.
- Vista **Participante**: seleccionan Programa → Sesión, y luego eligen:
  - **Llenar manualmente**: el flujo de siempre, regla por regla.
  - **✨ Prellenar con transcripción (IA)**: pegan o suben (.txt/.docx) la transcripción
    de la reunión (ej. exportada de Granola). La IA sugiere un puntaje y evidencia para
    cada regla. El participante revisa cada una, puede ajustar el nivel libremente, y
    solo entonces guarda. Nada se guarda automáticamente sin pasar por esta revisión.
- Vista **Panel administrador**: tú accedes con la clave que configuraste.
  - Pestaña **Dashboard**: consolidado en tiempo real, gráficas por regla, perfil radar y lista de respuestas, filtrable por programa.
  - Pestaña **Programas y sesiones**: aquí creas los programas (ej. "Consejo Directivo") y dentro de cada uno agregas sus sesiones (ej. "Junio 2026"). Solo las sesiones que tú crees aparecerán como opción para los participantes.

---

## Logo de Kingala

El isotipo ya está incluido en `public/kingala-isotipo.png` y se muestra automáticamente
en el encabezado de la app. Si necesitas reemplazarlo por otra versión, sustituye ese
archivo manteniendo el mismo nombre.

---

## Cómo actualizar el código en el futuro

Si necesitas cambiar algo (añadir reglas, ajustar textos, cambiar la clave):

```bash
# Edita los archivos que necesites, luego:
git add .
git commit -m "descripción del cambio"
git push
```

Vercel detecta el push automáticamente y redeploya en ~30 segundos.

---

## Estructura del proyecto

```
rubrica-app/
├── index.html                  # Punto de entrada HTML
├── vite.config.js              # Configuración de Vite
├── package.json                # Dependencias
├── .env.example                # Variables de entorno (copia a .env para desarrollo local)
├── supabase_schema.sql         # SQL: tabla de evaluaciones
├── supabase_schema_v2_programas.sql  # SQL: tablas de programas y sesiones
├── api/
│   └── analizar-transcripcion.js  # Función serverless: llama a la API de Claude
├── public/
│   └── kingala-isotipo.png     # Logo mostrado en el encabezado
└── src/
    ├── main.jsx                # Montaje de React
    ├── App.jsx                 # Navegación entre vistas
    ├── index.css                # Estilos globales (identidad Kingala)
    ├── lib/
    │   ├── supabase.js         # Cliente de Supabase
    │   └── rules.js            # Datos de las 10 reglas y constantes
    └── components/
        ├── ParticipantView.jsx  # Flujo del participante (manual o IA)
        ├── TranscriptUpload.jsx # Pegar/subir transcripción para la IA
        └── AdminView.jsx        # Panel del administrador
```

---

## Desarrollo local (opcional)

Si quieres probar cambios antes de subirlos:

```bash
# 1. Instala Node.js desde https://nodejs.org (versión 18 o superior)

# 2. En la carpeta del proyecto:
npm install

# 3. Copia .env.example a .env y llena tus valores de Supabase
cp .env.example .env
# Edita .env con tu editor de texto

# 4. Inicia el servidor local
npm run dev
# Abre http://localhost:5173
```

---

## Preguntas frecuentes

**¿Los datos son privados?**
Sí, solo tú puedes ver el panel con la clave de administrador. Los datos viven en tu
propia base de datos de Supabase.

**¿Qué pasa si un participante no guarda su evaluación?**
Los datos no se guardan hasta que el participante hace clic en "Guardar en el panel".
Si cierra la ventana antes, la evaluación se pierde. Es intencional.

**¿Puedo exportar los datos?**
Sí: en Supabase → tu proyecto → Table Editor → evaluaciones → Export as CSV.

**¿Cómo cambio la clave de administrador?**
En Vercel → tu proyecto → Settings → Environment Variables → edita `VITE_ADMIN_PASSWORD`
y redeploya.

**¿Cuánto cuesta?**
Supabase: gratis hasta 500 MB de base de datos y 50,000 filas (más que suficiente).
Vercel: gratis para proyectos personales sin límite de páginas vistas.
La API de Anthropic se cobra por uso; analizar una transcripción típica de una reunión
cuesta centavos de dólar.

**¿Es seguro subir transcripciones de reuniones internas?**
El texto se envía a la API de Anthropic solo para el análisis puntual; no se usa para
entrenar modelos por defecto en cuentas de la API comercial. Aun así, evita subir
transcripciones con información extremadamente sensible si tu organización lo restringe.

**¿Qué pasa si la IA se equivoca en un puntaje?**
Por diseño, el participante siempre ve cada regla con su nivel sugerido y puede cambiarlo
antes de guardar — la IA nunca guarda nada directamente.
