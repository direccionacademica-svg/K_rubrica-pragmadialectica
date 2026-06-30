import { useState } from 'react'
import ParticipantView from './components/ParticipantView.jsx'
import AdminView from './components/AdminView.jsx'

export default function App() {
  const [view, setView] = useState('participant')

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-brand">
          <img src="/kingala-isotipo.png" alt="Kingala" className="topbar-logo" />
          <div className="topbar-title-group">
            <span className="topbar-title">Rúbrica Pragmadialéctica</span>
            <span className="topbar-subtitle">Kingala · Business Life Training</span>
          </div>
        </div>
        <nav className="topbar-nav">
          <button
            className={`topbar-btn ${view === 'participant' ? 'active' : ''}`}
            onClick={() => setView('participant')}
          >
            Participante
          </button>
          <button
            className={`topbar-btn ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView('admin')}
          >
            Panel administrador
          </button>
        </nav>
      </header>

      <main className="main">
        {view === 'participant' ? <ParticipantView /> : <AdminView />}
      </main>
    </div>
  )
}
