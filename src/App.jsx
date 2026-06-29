import { useState } from 'react'
import ParticipantView from './components/ParticipantView.jsx'
import AdminView from './components/AdminView.jsx'

export default function App() {
  const [view, setView] = useState('participant')

  return (
    <div className="layout">
      <header className="topbar">
        <span className="topbar-title">Rúbrica Pragmadialéctica</span>
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
