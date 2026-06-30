import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { RULES, SCORE_COLORS, LEVEL_LABELS, LEVEL_DESCRIPTIONS, getLevel } from '../lib/rules.js'
import TranscriptUpload from './TranscriptUpload.jsx'

const TOTAL_RULES = RULES.length

export default function ParticipantView() {
  const [step, setStep] = useState('info')   // info | transcript | form | result
  const [pName, setPName] = useState('')
  const [programas, setProgramas] = useState([])
  const [sesiones, setSesiones] = useState([])
  const [programaId, setProgramaId] = useState('')
  const [sesionId, setSesionId] = useState('')
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [currentRule, setCurrentRule] = useState(0)
  const [scores, setScores] = useState(new Array(TOTAL_RULES).fill(null))
  const [aiEvidence, setAiEvidence] = useState(new Array(TOTAL_RULES).fill(''))
  const [aiPrefilled, setAiPrefilled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const total = scores.every(s => s !== null) ? scores.reduce((a, b) => a + b, 0) : null
  const level = total !== null ? getLevel(total) : null
  const levelMeta = level ? LEVEL_LABELS[level] : null

  useEffect(() => { loadProgramas() }, [])

  async function loadProgramas() {
    setLoadingOptions(true)
    const { data, error } = await supabase
      .from('programas')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    if (!error) setProgramas(data || [])
    setLoadingOptions(false)
  }

  async function loadSesiones(progId) {
    if (!progId) { setSesiones([]); return }
    const { data, error } = await supabase
      .from('sesiones')
      .select('*')
      .eq('programa_id', progId)
      .eq('activa', true)
      .order('fecha', { ascending: false })
    if (!error) setSesiones(data || [])
  }

  function handleProgramaChange(id) {
    setProgramaId(id)
    setSesionId('')
    loadSesiones(id)
  }

  function validateInfo() {
    if (!pName.trim()) { alert('Ingresa tu nombre para continuar.'); return false }
    if (!programaId) { alert('Selecciona un programa.'); return false }
    if (!sesionId) { alert('Selecciona una sesión.'); return false }
    return true
  }

  function handleStartManual() {
    if (!validateInfo()) return
    setScores(new Array(TOTAL_RULES).fill(null))
    setAiEvidence(new Array(TOTAL_RULES).fill(''))
    setAiPrefilled(false)
    setCurrentRule(0)
    setSaved(false)
    setError(null)
    setStep('form')
  }

  function handleStartAI() {
    if (!validateInfo()) return
    setStep('transcript')
  }

  function handleAIResult(suggestedScores, evidencia) {
    setScores(suggestedScores)
    setAiEvidence(evidencia || new Array(TOTAL_RULES).fill(''))
    setAiPrefilled(true)
    setCurrentRule(0)
    setSaved(false)
    setError(null)
    setStep('form')
  }

  function selectScore(idx, score) {
    const next = [...scores]
    next[idx] = score
    setScores(next)
  }

  function goNext() {
    if (scores[currentRule] === null) {
      alert('Selecciona un nivel antes de continuar.')
      return
    }
    if (currentRule === TOTAL_RULES - 1) {
      setStep('result')
    } else {
      setCurrentRule(r => r + 1)
    }
  }

  function goPrev() {
    if (currentRule > 0) setCurrentRule(r => r - 1)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const programa = programas.find(p => p.id === programaId)
    const sesion = sesiones.find(s => s.id === sesionId)
    const payload = {
      participant_name: pName.trim(),
      session_name: `${programa?.nombre || ''} — ${sesion?.nombre || ''}`,
      programa_id: programaId,
      sesion_id: sesionId,
      scores: scores,
      total: total,
      level: level,
    }
    const { error: err } = await supabase.from('evaluaciones').insert([payload])
    if (err) {
      setError('Error al guardar: ' + err.message)
      setSaving(false)
      return
    }
    setSaved(true)
    setSaving(false)
  }

  function handleRestart() {
    setPName('')
    setProgramaId('')
    setSesionId('')
    setSesiones([])
    setScores(new Array(TOTAL_RULES).fill(null))
    setAiEvidence(new Array(TOTAL_RULES).fill(''))
    setAiPrefilled(false)
    setCurrentRule(0)
    setSaved(false)
    setError(null)
    setStep('info')
  }

  if (step === 'info') return <InfoStep
    pName={pName} setPName={setPName}
    programas={programas}
    sesiones={sesiones}
    programaId={programaId}
    sesionId={sesionId}
    onProgramaChange={handleProgramaChange}
    onSesionChange={setSesionId}
    loadingOptions={loadingOptions}
    onStartManual={handleStartManual}
    onStartAI={handleStartAI}
  />

  if (step === 'transcript') return <TranscriptUpload
    onResult={handleAIResult}
    onCancel={() => setStep('info')}
  />

  if (step === 'form') return <FormStep
    currentRule={currentRule}
    scores={scores}
    aiEvidence={aiEvidence}
    aiPrefilled={aiPrefilled}
    onSelect={selectScore}
    onNext={goNext}
    onPrev={goPrev}
  />

  return <ResultStep
    scores={scores}
    total={total}
    level={level}
    levelMeta={levelMeta}
    saved={saved}
    saving={saving}
    error={error}
    aiPrefilled={aiPrefilled}
    onSave={handleSave}
    onRestart={handleRestart}
    pName={pName}
    programas={programas}
    sesiones={sesiones}
    programaId={programaId}
    sesionId={sesionId}
  />
}

function InfoStep({
  pName, setPName, programas, sesiones, programaId, sesionId,
  onProgramaChange, onSesionChange, loadingOptions, onStartManual, onStartAI
}) {
  const readyForNext = pName.trim() && programaId && sesionId

  return (
    <div className="card" style={{ maxWidth: 520, margin: '2rem auto' }}>
      <h1 style={{ fontSize: 26, marginBottom: '.25rem' }}>Evalúa la sesión</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Responde desde lo que observaste, o sube la transcripción de la reunión para que la IA
        sugiera un primer borrador que tú revisas y ajustas.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 5 }}>Tu nombre</label>
          <input
            type="text"
            placeholder="Ej. Ana López"
            value={pName}
            onChange={e => setPName(e.target.value)}
          />
        </div>

        {loadingOptions ? (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Cargando programas…</p>
        ) : programas.length === 0 ? (
          <p style={{ fontSize: 13, color: '#B45309', background: '#FFFBEB', padding: 10, borderRadius: 8 }}>
            Aún no hay programas configurados. Pide al administrador que los agregue en el panel.
          </p>
        ) : (
          <div className="select-grid">
            <div>
              <label>Programa</label>
              <select value={programaId} onChange={e => onProgramaChange(e.target.value)}>
                <option value="">Selecciona…</option>
                {programas.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Sesión</label>
              <select
                value={sesionId}
                onChange={e => onSesionChange(e.target.value)}
                disabled={!programaId}
              >
                <option value="">{programaId ? 'Selecciona…' : 'Elige un programa primero'}</option>
                {sesiones.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}{s.fecha ? ` · ${new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}` : ''}
                  </option>
                ))}
              </select>
              {programaId && sesiones.length === 0 && (
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  No hay sesiones activas para este programa.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn-primary" onClick={onStartManual} disabled={!readyForNext} style={{ opacity: readyForNext ? 1 : .5 }}>
          Llenar manualmente →
        </button>
        <button
          onClick={onStartAI}
          disabled={!readyForNext}
          style={{
            width: '100%', padding: '11px 24px', borderRadius: 'var(--radius)',
            background: 'var(--sky)', color: 'var(--kg-purple)', fontWeight: 500,
            border: '1px solid #DCD3F5', opacity: readyForNext ? 1 : .5,
          }}
        >
          ✨ Prellenar con transcripción (IA)
        </button>
      </div>
    </div>
  )
}

function FormStep({ currentRule, scores, aiEvidence, aiPrefilled, onSelect, onNext, onPrev }) {
  const rule = RULES[currentRule]
  const progress = ((currentRule + 1) / TOTAL_RULES) * 100
  const evidence = aiEvidence?.[currentRule]

  return (
    <div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: 12, color: 'var(--muted)' }}>
        <span>Regla {currentRule + 1} de {TOTAL_RULES}</span>
        <span>{Math.round(progress)}% completado</span>
      </div>

      <div className="card">
        <div className="rule-eyebrow">
          <span className="rule-num-badge">Regla {rule.num}</span>
          {aiPrefilled && (
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--kg-purple)', background: 'var(--sky)', padding: '3px 10px', borderRadius: 20, border: '1px solid #DCD3F5' }}>
              ✨ Sugerido por IA — revisa y ajusta
            </span>
          )}
        </div>
        <h2 style={{ fontSize: 20, marginBottom: '.25rem' }}>{rule.title}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1rem' }}>{rule.sub}</p>

        {aiPrefilled && evidence && (
          <div style={{ fontSize: 12, color: '#0F6B5F', background: '#ECFDFB', border: '1px solid #B8F0E8', borderRadius: 8, padding: '10px 12px', marginBottom: '1rem', lineHeight: 1.5 }}>
            <strong>Evidencia detectada por la IA:</strong> {evidence}
          </div>
        )}

        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '.5rem' }}>
          Selecciona el nivel que mejor describe lo que observaste:
        </p>

        <div className="levels-grid">
          {rule.levels.map((desc, i) => {
            const selected = scores[currentRule] === i
            return (
              <button
                key={i}
                className={`level-btn ${selected ? `sel-${i}` : ''}`}
                onClick={() => onSelect(currentRule, i)}
              >
                <span className="level-score">{i}</span>
                <span className="level-desc">{desc}</span>
              </button>
            )
          })}
        </div>

        <div className="step-nav">
          {currentRule > 0 && (
            <button className="btn-ghost" style={{ flex: 1 }} onClick={onPrev}>
              ← Anterior
            </button>
          )}
          <button
            className="btn-primary"
            style={{ flex: 2, opacity: scores[currentRule] === null ? .5 : 1 }}
            onClick={onNext}
          >
            {currentRule === TOTAL_RULES - 1 ? 'Ver resultados →' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultStep({
  scores, total, level, levelMeta, saved, saving, error, aiPrefilled, onSave, onRestart,
  pName, programas, sesiones, programaId, sesionId
}) {
  const pct = Math.round((total / 30) * 100)
  const avg = (total / 10).toFixed(1)
  const programaNombre = programas.find(p => p.id === programaId)?.nombre || ''
  const sesionNombre = sesiones.find(s => s.id === sesionId)?.nombre || ''

  return (
    <div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 22, marginBottom: '.25rem' }}>Tu evaluación</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{pName} · {programaNombre} — {sesionNombre}</p>
            {aiPrefilled && (
              <p style={{ fontSize: 11, color: 'var(--kg-purple)', marginTop: 4 }}>✨ Prellenado con IA y revisado manualmente</p>
            )}
          </div>
          <span className="badge" style={{ background: levelMeta?.bg, color: levelMeta?.text }}>
            {level}
          </span>
        </div>

        <div className="metrics">
          <div className="metric">
            <div className="metric-val">{total}<span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 400 }}>/30</span></div>
            <div className="metric-lbl">Puntaje total</div>
          </div>
          <div className="metric">
            <div className="metric-val">{pct}%</div>
            <div className="metric-lbl">Porcentaje</div>
          </div>
          <div className="metric">
            <div className="metric-val">{avg}</div>
            <div className="metric-lbl">Promedio / regla</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.6, borderLeft: '3px solid var(--border)', paddingLeft: 12 }}>
          {LEVEL_DESCRIPTIONS[level]}
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          {RULES.map((r, i) => {
            const s = scores[i]
            const color = SCORE_COLORS[s]
            return (
              <div key={i} className="score-row">
                <span className="score-lbl">R{r.num}. {r.title}</span>
                <div className="score-track">
                  <div className="score-fill" style={{ width: `${(s / 3) * 100}%`, background: color.bar }} />
                </div>
                <span className="score-num" style={{ color: color.text }}>{s}</span>
              </div>
            )
          })}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#DC2626', marginBottom: '.75rem' }}>{error}</p>
        )}

        {saved ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 14, color: '#0F6B5F', textAlign: 'center', padding: '10px', background: '#ECFDFB', borderRadius: 8 }}>
              ✓ Evaluación guardada correctamente
            </p>
            <button className="btn-ghost" onClick={onRestart}>
              Evaluar otra sesión
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={onRestart} style={{ flex: 1 }}>
              Descartar
            </button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={onSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar en el panel →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
