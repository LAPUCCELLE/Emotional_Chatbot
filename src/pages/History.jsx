import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSessionsFromFirestore } from '../utils/firestoreStorage'
import { ROUTE_LABELS, formatDate } from '../utils/mood'
import MoodArrow from '../components/MoodArrow'
import styles from './History.module.css'

export default function History() {
  const navigate          = useNavigate()
  const { uid, user, isAnonymous, loginWithGoogle, logout } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  async function handleGoogleLogin() {
    try {
      await loginWithGoogle()
    } catch (err) {
      console.error('Error al conectar con Google:', err)
    }
  }

  async function handleLogout() {
    try {
      await logout()
    } catch (err) {
      console.error('Error al cerrar sesion:', err)
    }
  }

  useEffect(() => {
    if (!uid) return

    // Usuario anonimo sin sesiones: evita la consulta y muestra el estado vacio de inmediato
    if (isAnonymous) {
      setLoading(false)
      return
    }

    async function loadSessions() {
      try {
        const data = await getSessionsFromFirestore(uid)
        setSessions(data)
      } catch (err) {
        console.error('Error cargando historial:', err)
        setError('No pudimos cargar tu historial. Intenta de nuevo mas tarde.')
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [uid, isAnonymous])

  return (
    <div className="screen">
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className={styles.title}>Mi historial</h2>
        {isAnonymous ? (
          <button className={styles.accountBtn} onClick={handleGoogleLogin}>
            Conectar con Google
          </button>
        ) : (
          <button className={styles.accountBtn} onClick={handleLogout} title={user?.email}>
            {user?.displayName?.split(' ')[0] || 'Cuenta'} · Salir
          </button>
        )}
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Cargando...</p>
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Aun no tienes sesiones guardadas.</p>
            <p className={styles.emptyHint}>Cuando completes una sesion, aparecera aqui.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {sessions.map(s => (
              <li key={s.id} className={styles.item} onClick={() => navigate(`/history/${s.id}`)}>
                <span className={styles.itemDate}>{formatDate(s.date)}</span>
                <span className={styles.itemLabel}>{ROUTE_LABELS[s.route] || s.route}</span>
                <MoodArrow start={s.moodStart} end={s.moodEnd} />
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
