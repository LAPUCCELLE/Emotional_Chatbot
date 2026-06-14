import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSessionsFromFirestore } from '../utils/firestoreStorage'
import styles from './History.module.css'

const ROUTE_LABELS = {
  respiracion:    'Respiracion',
  escritura:      'Escritura',
  conversacional: 'Conversacion libre',
  libre:          'Sesion libre',
}

const MOOD_COLORS = {
  1: '#EF4444', 2: '#F97316', 3: '#FB923C',
  4: '#FBBF24', 5: '#EAB308', 6: '#A3E635',
  7: '#4ADE80', 8: '#22C55E', 9: '#16A34A', 10: '#15803D',
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-PE', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function MoodArrow({ start, end }) {
  if (end == null) return <span style={{ color: MOOD_COLORS[start] }}>{start}</span>
  const diff  = end - start
  const arrow = diff > 1 ? '↑' : diff < -1 ? '↓' : '→'
  return (
    <span className={styles.moodFlow}>
      <span style={{ color: MOOD_COLORS[start] }}>{start}</span>
      <span className={styles.arrow}>{arrow}</span>
      <span style={{ color: MOOD_COLORS[end] }}>{end}</span>
    </span>
  )
}

export default function History() {
  const navigate          = useNavigate()
  const { uid }           = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!uid) return
    getSessionsFromFirestore(uid)
      .then(data => setSessions(data))
      .catch(err => console.error('Error cargando historial:', err))
      .finally(() => setLoading(false))
  }, [uid])

  return (
    <div className="screen">
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className={styles.title}>Mi historial</h2>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Cargando...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Aun no tienes sesiones guardadas.</p>
            <p className={styles.emptyHint}>Cuando completes una sesion, aparecera aqui.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {sessions.map(s => (
              <li key={s.id} className={styles.item}>
                <div className={styles.itemDate}>{formatDate(s.date)}</div>
                <div className={styles.itemRow}>
                  <span className={styles.routeTag}>{ROUTE_LABELS[s.route] || s.route}</span>
                  <MoodArrow start={s.moodStart} end={s.moodEnd} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.footer}>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Nueva sesion
        </button>
      </div>
    </div>
  )
}
