import { useState, useEffect } from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { supabase } from '../lib/supabase.js'
import { RULES, SCORE_COLORS, LEVEL_LABELS } from '../lib/rules.js'

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

export default function AdminView() {
  const [unlocked, setUnlocked] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [passError, setPassError] = useState(false)
  const [tab, setTab] = useState('dashboard') // dashboard | gestionar

  function checkPass() {
    if (passInput === ADMIN_PASS) {
      setUnlocked(true)
    } else {
      setPassError(true)
      setTimeout(() => setPassError(false), 2000)
    }
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

  return (
    <div>
      <div className="tab-group">
        <button className={`tab-btn ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
          Dashboard
        </button>
        <button className={`tab-btn ${tab === 'gestionar' ? 'active' : ''}`} onClick={() => setTab('gestionar')}>
          Programas y sesiones
        </button>
      </div>
      {tab === 'dashboard' ? <Dashboard /> : <GestionarProgramas />}
    </div>
  )
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard() {
  const [data, setData] = useState([])
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterPrograma, setFilterPrograma] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { loadData(); loadProgramas() }, [])

  async function loadProgramas() {
    const { data } = await supabase.from('programas').select('*').order('nombre')
    setProgramas(data || [])
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

  const filtered = filterPrograma === 'all' ? data : data.filter(d => d.programa_id === filterPrograma)
  const n = filtered.length
  const avgTotal = n > 0 ? (filtered.reduce((a, d) => a + d.total, 0) / n).toFixed(1) : '—'
  const sessionsCount = [...new Set(filtered.map(d => d.sesion_id))].length

  const ruleAvgs = RULES.map((r, i) => ({
    rule: `R${r.num}`,
    fullTitle: r.title,
    promedio: n > 0 ? parseFloat((filtered.reduce((a, d) => a + (d.scores[i] ?? 0), 0) / n).toFixed(2)) : 0,
  }))

  const radarData = RULES.map((r, i) => ({
    subject: `R${r.num}`,
    promedio: n > 0 ? parseFloat((filtered.reduce((a, d) => a + (d.scores[i] ?? 0), 0) / n).toFixed(2)) : 0,
  }))

  const levelDist = { 'Básico': 0, 'En desarrollo': 0, 'Maduro': 0, 'Excelente': 0 }
  filtered.forEach(d => { levelDist[d.level] = (levelDist[d.level] || 0) + 1 })

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={filterPrograma}
          onChange={e => setFilterPrograma(e.target.value)}
          style={{ width: 'auto', flex: 1, minWidth: 160 }}
        >
          <option value="all">Todos los programas</option>
          {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <button className="btn-ghost" style={{ whiteSpace: 'nowrap', padding: '9px 14px' }} onClick={loadData}>
          ↻ Actualizar
        </button>
      </div>

      {loading && <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1rem' }}>Cargando…</p>}

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
          <div className="metric-val">{sessionsCount}</div>
          <div className="metric-lbl">Sesiones evaluadas</div>
        </div>
      </div>

      {n === 0 && !loading ? (
        <div className="empty-state">
          <p>Aún no hay evaluaciones en este filtro.</p>
          <p style={{ marginTop: 6, fontSize: 13 }}>Los participantes deben guardar su resultado desde la vista de participante.</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 16, marginBottom: '.25rem' }}>Promedio por regla</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>Escala 0–3</p>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ruleAvgs} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F1FA" />
                  <XAxis dataKey="rule" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [v.toFixed(2), 'Promedio']}
                    labelFormatter={(label) => ruleAvgs.find(r => r.rule === label)?.fullTitle || label}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                  <Bar dataKey="promedio" fill="#2D0A8C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 16, marginBottom: '1rem' }}>Perfil de deliberación</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#E8E4F3" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar
                  name="Promedio"
                  dataKey="promedio"
                  stroke="#2D0A8C"
                  fill="#2DD9C4"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

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

// ============================================================
// GESTIONAR PROGRAMAS Y SESIONES
// ============================================================
function GestionarProgramas() {
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedPrograma, setExpandedPrograma] = useState(null)
  const [sesionesByPrograma, setSesionesByPrograma] = useState({})
  const [newProgramaName, setNewProgramaName] = useState('')
  const [newSesionForms, setNewSesionForms] = useState({}) // { programaId: { nombre, fecha } }

  useEffect(() => { loadProgramas() }, [])

  async function loadProgramas() {
    setLoading(true)
    const { data } = await supabase.from('programas').select('*').order('created_at', { ascending: false })
    setProgramas(data || [])
    setLoading(false)
  }

  async function loadSesiones(programaId) {
    const { data } = await supabase
      .from('sesiones')
      .select('*')
      .eq('programa_id', programaId)
      .order('created_at', { ascending: false })
    setSesionesByPrograma(prev => ({ ...prev, [programaId]: data || [] }))
  }

  function toggleExpand(programaId) {
    if (expandedPrograma === programaId) {
      setExpandedPrograma(null)
    } else {
      setExpandedPrograma(programaId)
      if (!sesionesByPrograma[programaId]) loadSesiones(programaId)
    }
  }

  async function addPrograma() {
    const nombre = newProgramaName.trim()
    if (!nombre) return
    const { error } = await supabase.from('programas').insert([{ nombre }])
    if (error) { alert('Error: ' + error.message); return }
    setNewProgramaName('')
    loadProgramas()
  }

  async function toggleProgramaActivo(p) {
    await supabase.from('programas').update({ activo: !p.activo }).eq('id', p.id)
    loadProgramas()
  }

  async function deletePrograma(id) {
    if (!confirm('¿Eliminar este programa y todas sus sesiones? Las evaluaciones guardadas no se borran.')) return
    await supabase.from('programas').delete().eq('id', id)
    loadProgramas()
  }

  async function addSesion(programaId) {
    const form = newSesionForms[programaId] || {}
    const nombre = (form.nombre || '').trim()
    if (!nombre) return
    const { error } = await supabase.from('sesiones').insert([{
      programa_id: programaId,
      nombre,
      fecha: form.fecha || null,
    }])
    if (error) { alert('Error: ' + error.message); return }
    setNewSesionForms(prev => ({ ...prev, [programaId]: { nombre: '', fecha: '' } }))
    loadSesiones(programaId)
  }

  async function toggleSesionActiva(sesion) {
    await supabase.from('sesiones').update({ activa: !sesion.activa }).eq('id', sesion.id)
    loadSesiones(sesion.programa_id)
  }

  async function deleteSesion(sesion) {
    if (!confirm('¿Eliminar esta sesión? Las evaluaciones guardadas no se borran.')) return
    await supabase.from('sesiones').delete().eq('id', sesion.id)
    loadSesiones(sesion.programa_id)
  }

  function updateSesionForm(programaId, field, value) {
    setNewSesionForms(prev => ({
      ...prev,
      [programaId]: { ...(prev[programaId] || {}), [field]: value }
    }))
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: 16, marginBottom: '.75rem' }}>Nuevo programa</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Ej. Consejo Directivo"
            value={newProgramaName}
            onChange={e => setNewProgramaName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPrograma()}
          />
          <button className="btn-primary" style={{ width: 'auto', padding: '0 20px' }} onClick={addPrograma}>
            Agregar
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Cargando…</p>
      ) : programas.length === 0 ? (
        <div className="empty-state">No hay programas todavía. Crea el primero arriba.</div>
      ) : (
        programas.map(p => (
          <div key={p.id} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => toggleExpand(p.id)}
                style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 13, color: 'var(--kg-purple)', display: 'flex', alignItems: 'center', gap: 6, flex: 1, textAlign: 'left' }}
              >
                <span style={{ transform: expandedPrograma === p.id ? 'rotate(90deg)' : 'none', transition: 'transform .15s', display: 'inline-block' }}>›</span>
                <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--ink)' }}>{p.nombre}</span>
                {!p.activo && <span style={{ fontSize: 11, color: 'var(--muted)' }}>(inactivo)</span>}
              </button>
              <button className="icon-btn" onClick={() => toggleProgramaActivo(p)} title={p.activo ? 'Desactivar' : 'Activar'}>
                {p.activo ? '⏸' : '▶'}
              </button>
              <button className="icon-btn danger" onClick={() => deletePrograma(p.id)} title="Eliminar">✕</button>
            </div>

            {expandedPrograma === p.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 500 }}>Sesiones</p>

                {(sesionesByPrograma[p.id] || []).map(s => (
                  <div key={s.id} className={`manage-row ${!s.activa ? 'inactive' : ''}`}>
                    <span className="manage-row-name">{s.nombre}</span>
                    {s.fecha && <span className="manage-row-meta">{new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                    <button className="icon-btn" onClick={() => toggleSesionActiva(s)} title={s.activa ? 'Desactivar' : 'Activar'}>
                      {s.activa ? '⏸' : '▶'}
                    </button>
                    <button className="icon-btn danger" onClick={() => deleteSesion(s)} title="Eliminar">✕</button>
                  </div>
                ))}

                {(sesionesByPrograma[p.id] || []).length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Sin sesiones todavía.</p>
                )}

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <input
                    type="text"
                    placeholder="Nombre de la sesión"
                    value={newSesionForms[p.id]?.nombre || ''}
                    onChange={e => updateSesionForm(p.id, 'nombre', e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <input
                    type="date"
                    value={newSesionForms[p.id]?.fecha || ''}
                    onChange={e => updateSesionForm(p.id, 'fecha', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '0 16px', flexShrink: 0 }}
                    onClick={() => addSesion(p.id)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
