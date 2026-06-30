import { useState, useRef } from 'react'
import mammoth from 'mammoth'

export default function TranscriptUpload({ onResult, onCancel }) {
  const [mode, setMode] = useState('paste') // paste | file
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setFileName(file.name)

    try {
      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        setText(result.value)
      } else {
        const raw = await file.text()
        setText(raw)
      }
    } catch (err) {
      setError('No se pudo leer el archivo: ' + err.message)
    }
  }

  async function handleAnalyze() {
    if (!text.trim() || text.trim().length < 50) {
      setError('La transcripción es muy corta o está vacía. Pega o sube un texto más completo.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch('/api/analizar-transcripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'Ocurrió un error al analizar la transcripción.')
        setLoading(false)
        return
      }
      onResult(data.scores, data.evidencia)
    } catch (err) {
      setError('Error de conexión: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 560, margin: '1rem auto' }}>
      <h2 style={{ fontSize: 20, marginBottom: '.25rem' }}>Prellenar con transcripción</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        Pega el texto de la transcripción (ej. exportada de Granola u otra herramienta) o sube un archivo.
        La IA sugerirá un puntaje para cada regla, que podrás revisar y ajustar antes de guardar.
      </p>

      <div className="tab-group" style={{ marginBottom: '1rem' }}>
        <button className={`tab-btn ${mode === 'paste' ? 'active' : ''}`} onClick={() => setMode('paste')}>
          Pegar texto
        </button>
        <button className={`tab-btn ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>
          Subir archivo
        </button>
      </div>

      {mode === 'paste' ? (
        <textarea
          placeholder="Pega aquí la transcripción completa de la reunión…"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={10}
          style={{
            width: '100%', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5,
            border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12,
            resize: 'vertical', minHeight: 180,
          }}
        />
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            className="btn-ghost"
            style={{ width: '100%', padding: '24px', borderStyle: 'dashed' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {fileName ? `📄 ${fileName} — clic para cambiar` : '📎 Selecciona un archivo .txt o .docx'}
          </button>
          {text && (
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              {text.length.toLocaleString()} caracteres leídos.
            </p>
          )}
        </div>
      )}

      {error && (
        <p style={{ fontSize: 13, color: '#DC2626', marginTop: 10, background: '#FEF2F2', padding: 10, borderRadius: 8 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button className="btn-primary" style={{ flex: 2 }} onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analizando con IA…' : 'Analizar y prellenar →'}
        </button>
      </div>

      {loading && (
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
          Esto puede tardar 10–30 segundos dependiendo de la longitud del texto.
        </p>
      )}
    </div>
  )
}
