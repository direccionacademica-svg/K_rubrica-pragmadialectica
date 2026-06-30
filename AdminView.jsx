import { useState, useEffect } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { supabase } from '../lib/supabase.js'
import { RULES, SCORE_COLORS, LEVEL_LABELS, getLevel } from '../lib/rules.js'

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

export default function AdminView() {
  const [unlocked, setUnlocked] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [passError, setPassError] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  function checkPass() {
    if (passInput === ADMIN_PASS) {
      setUnlocked(true)
      loadData()
    } else {
      setPassError(true)
      setTimeout(() => setPassError(false), 2000)
    }
  }

  async function loadData() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('evaluaciones')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setData(rows || [])
    setLoading(false)
  }

  async function deleteRow(id) {
    await supabase.from('evaluaciones').delete().eq('id', id)
    setDeleteConfirm(null)
    loadData()
  }

  if (!unlocked) return (
    <div style={{ maxWidth: 400, margin: '3rem auto' }}>
      <div className="card">
        <h2 style={{ fontSize: 20, marginBottom: '.5rem' }}>Panel de administrador</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.25rem' }}>
          Ingresa la clave para ver el consolidado de evaluaciones.
        </p>
        <input
          type="password"
          placeholder="Clave de acceso"
          value={passInput}
          onChange={e => setPassInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkPass()}
          style={{ marginBottom: 10, borderColor: passError ? '#EF4444' : undefined }}
        />
        {passError && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>Clave incorrecta</p>}
        <button className="btn-primary" onClick={checkPass}>Entrar →</button>
      </div>
    </div>
  )

  const sessions = [...new Set(data.map(d => d.session_name))]
  const filtered = filter === 'all' ? data : data.filter(d => d.session_name === filter)
  const n = filtered.length
  const avgTotal = n > 0 ? (filtered.reduce((a, d) => a + d.total, 0) / n).toFixed(1) : '—'
  const sessions_count = [...new Set(filtered.map(d => d.session_name))].length

  // Averages per rule for chart
  const ruleAvgs = RULES.map((r, i) => ({
    rule: `R${r.num}`,
    fullTitle: r.title,
    promedio: n > 0 ? parseFloat((filtered.reduce((a, d) => a + (d.scores[i] ?? 0), 0) / n).toFixed(2)) : 0,
  }))

  // Radar data
  const radarData = RULES.map((r, i) => ({
    subject: `R${r.num}`,
    promedio: n > 0 ? parseFloat((filtered.reduce((a, d) => a + (d.scores[i] ?? 0), 0) / n).toFixed(2)) : 0,
    fullMark: 3,
  }))

  // Level distribution
  const levelDist = { 'Básico': 0, 'En desarrollo': 0, 'Maduro': 0, 'Excelente': 0 }
  filtered.forEach(d => { levelDist[d.level] = (levelDist[d.level] || 0) + 1 })

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: 'auto', flex: 1, minWidth: 160 }}
        >
          <option value="all">Todas las sesiones</option>
          {sessions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-ghost" style={{ whiteSpace: 'nowrap', padding: '9px 14px' }} onClick={loadData}>
          ↻ Actualizar
        </button>
      </div>

      {loading && <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1rem' }}>Cargando…</p>}

      {/* KPIs */}
      <div className="metrics" style={{ marginBottom: '1.25rem' }}>
        <div className="metric">
          <div className="metric-val">{n}</div>
          <div className="metric-lbl">Evaluaciones</div>
        </div>
        <div className="metric">
          <div className="metric-val">{avgTotal}</div>
          <div className="metric-lbl">Promedio total</div>
        </div>
        <div className="metric">
          <div className="metric-val">{sessions_count}</div>
          <div className="metric-lbl">Sesiones</div>
        </div>
      </div>

      {n === 0 && !loading ? (
        <div className="empty-state">
          <p>Aún no hay evaluaciones en este filtro.</p>
          <p style={{ marginTop: 6, fontSize: 13 }}>Los participantes deben guardar su resultado desde la vista de participante.</p>
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 16, marginBottom: '.25rem' }}>Promedio por regla</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>Escala 0–3</p>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ruleAvgs} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="rule" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v, _) => [v.toFixed(2), 'Promedio']}
                    labelFormatter={(label) => ruleAvgs.find(r => r.rule === label)?.fullTitle || label}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                  <Bar dataKey="promedio" fill="#2E75B6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar chart */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 16, marginBottom: '1rem' }}>Perfil de deliberación</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar
                  name="Promedio"
                  dataKey="promedio"
                  stroke="#2E75B6"
                  fill="#2E75B6"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Level distribution */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 16, marginBottom: '.75rem' }}>Distribución por nivel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {Object.entries(levelDist).map(([lvl, count]) => {
                const meta = LEVEL_LABELS[lvl]
                return (
                  <div key={lvl} style={{ background: meta.bg, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: meta.text }}>{count}</div>
                    <div style={{ fontSize: 11, color: meta.text, opacity: .8, marginTop: 2 }}>{lvl}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Responses list */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: '1rem' }}>Evaluaciones individuales</h3>
            {filtered.map(d => {
              const meta = LEVEL_LABELS[d.level]
              const date = new Date(d.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
              return (
                <div key={d.id} className="resp-item">
                  <div className="resp-head">
                    <div>
                      <div className="resp-name">{d.participant_name}</div>
                      <div className="resp-meta">{d.session_name} · {date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge" style={{ background: meta?.bg, color: meta?.text, fontSize: 12 }}>
                        {d.total}/30 · {d.level}
                      </span>
                      {deleteConfirm === d.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => deleteRow(d.id)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>Confirmar</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(d.id)} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}>✕</button>
                      )}
                    </div>
                  </div>
                  <div className="resp-pills">
                    {(d.scores || []).map((s, i) => (
                      <span key={i} className={`pill pill-${s}`}>R{i + 1}:{s}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
