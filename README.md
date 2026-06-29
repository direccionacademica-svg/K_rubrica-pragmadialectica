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
5. Ve a **Settings → API** (menú lateral).
   Copia dos valores que necesitarás en el paso 3:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon / public key** (el JWT largo)

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
   y agrega estas tres variables:

| Nombre                    | Valor                                      |
|---------------------------|--------------------------------------------|
| `VITE_SUPABASE_URL`       | La Project URL del paso 1 (ej. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY`  | La anon/public key del paso 1              |
| `VITE_ADMIN_PASSWORD`     | La clave que quieras para el panel (cámbiala) |

5. Clic en **Deploy**. En ~1 minuto tendrás una URL pública tipo:
   `https://rubrica-pragmadialéctica.vercel.app`

---

### PASO 4 — Compartir con los participantes

- Comparte la URL directamente. No requiere cuenta ni instalación.
- Vista **Participante**: llenan la rúbrica y guardan su resultado.
- Vista **Panel administrador**: tú accedes con la clave que configuraste.
  Ve el consolidado en tiempo real, gráficas por regla y lista de respuestas.

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
├── supabase_schema.sql         # SQL para crear la tabla en Supabase
└── src/
    ├── main.jsx                # Montaje de React
    ├── App.jsx                 # Navegación entre vistas
    ├── index.css               # Estilos globales
    ├── lib/
    │   ├── supabase.js         # Cliente de Supabase
    │   └── rules.js            # Datos de las 10 reglas y constantes
    └── components/
        ├── ParticipantView.jsx # Flujo del participante
        └── AdminView.jsx       # Panel del administrador
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
