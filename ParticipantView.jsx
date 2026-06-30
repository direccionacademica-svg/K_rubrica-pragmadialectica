import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { RULES, SCORE_COLORS, LEVEL_LABELS, LEVEL_DESCRIPTIONS, getLevel } from '../lib/rules.js'

const TOTAL_RULES = RULES.length

export default function ParticipantView() {
  const [step, setStep] = useState('info')   // info | form | result
  const [pName, setPName] = useState('')
  const [pSession, setPSession] = useState('')
  const [currentRule, setCurrentRule] = useState(0)
  const [scores, setScores] = useState(new Array(TOTAL_RULES).fill(null))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const total = scores.every(s => s !== null) ? scores.reduce((a, b) => a + b, 0) : null
  const level = total !== null ? getLevel(total) : null
  const levelMeta = level ? LEVEL_LABELS[level] : null

  function handleStart() {
    if (!pName.trim()) { alert('Ingresa tu nombre para continuar.'); return }
    if (!pSession.trim()) { alert('Ingresa el nombre de la sesión.'); return }
    setScores(new Array(TOTAL_RULES).fill(null))
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
    const payload = {
      participant_name: pName.trim(),
      session_name: pSession.trim(),
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
    setPSession('')
    setScores(new Array(TOTAL_RULES).fill(null))
    setCurrentRule(0)
    setSaved(false)
    setError(null)
    setStep('info')
  }

  if (step === 'info') return <InfoStep
    pName={pName} setPName={setPName}
    pSession={pSession} setPSession={setPSession}
    onStart={handleStart}
  />

  if (step === 'form') return <FormStep
    currentRule={currentRule}
    scores={scores}
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
    onSave={handleSave}
    onRestart={handleRestart}
    pName={pName}
    pSession={pSession}
  />
}

function InfoStep({ pName, setPName, pSession, setPSession, onStart }) {
  return (
    <div className="card" style={{ maxWidth: 520, margin: '2rem auto' }}>
      <h1 style={{ fontSize: 26, marginBottom: '.25rem' }}>Evalúa la sesión</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Toma 3–5 minutos. Responde desde lo que observaste durante la sesión que acabas de presenciar.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 5 }}>Tu nombre</label>
          <input
            type="text"
            placeholder="Ej. Ana López"
            value={pName}
            onChange={e => setPName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('session-input').focus()}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 5 }}>Sesión / comité</label>
          <input
            id="session-input"
            type="text"
            placeholder="Ej. Consejo directivo — junio 2026"
            value={pSession}
            onChange={e => setPSession(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onStart()}
          />
        </div>
      </div>
      <button className="btn-primary" onClick={onStart}>
        Comenzar evaluación →
      </button>
    </div>
  )
}

function FormStep({ currentRule, scores, onSelect, onNext, onPrev }) {
  const rule = RULES[currentRule]
  const progress = ((currentRule + 1) / TOTAL_RULES) * 100

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
        </div>
        <h2 style={{ fontSize: 20, marginBottom: '.25rem' }}>{rule.title}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1rem' }}>{rule.sub}</p>

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

function ResultStep({ scores, total, level, levelMeta, saved, saving, error, onSave, onRestart, pName, pSession }) {
  const pct = Math.round((total / 30) * 100)
  const avg = (total / 10).toFixed(1)

  return (
    <div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 22, marginBottom: '.25rem' }}>Tu evaluación</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{pName} · {pSession}</p>
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
            <p style={{ fontSize: 14, color: '#059669', textAlign: 'center', padding: '10px', background: '#ECFDF5', borderRadius: 8 }}>
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
