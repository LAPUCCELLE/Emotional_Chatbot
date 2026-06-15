import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSessionById } from '../utils/firestoreStorage'
import { ROUTE_LABELS, formatDate } from '../utils/mood'
import MoodArrow from '../components/MoodArrow'
import ChatBubble from '../components/ChatBubble'
import styles from './SessionView.module.css'

export default function SessionView() {
  const navigate          = useNavigate()
  const { sessionId }     = useParams()
  const { uid }           = useAuth()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!uid) return

    async function loadSession() {
      try {
        const data = await getSessionById(uid, sessionId)
        if (!data) {
          setError('No encontramos esta sesion.')
        } else {
          setSession(data)
        }
      } catch (err) {
        console.error('Error cargando sesion:', err)
        setError('No pudimos cargar esta sesion. Intenta de nuevo mas tarde.')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [uid, sessionId])

  return (
    <div className="screen">
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/history')} aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {session && (
          <>
            <div className={styles.headerInfo}>
              <span className={styles.headerTitle}>{ROUTE_LABELS[session.route] || session.route}</span>
              <span className={styles.headerDate}>{formatDate(session.date)}</span>
            </div>
            <MoodArrow start={session.moodStart} end={session.moodEnd} />
          </>
        )}
      </div>

      <div className={styles.messages}>
        {loading ? (
          <p className={styles.emptyText}>Cargando...</p>
        ) : error ? (
          <p className={styles.emptyText}>{error}</p>
        ) : session.messages?.length ? (
          session.messages.map((m, i) => (
            <ChatBubble key={i} role={m.role}>{m.text}</ChatBubble>
          ))
        ) : (
          <p className={styles.emptyText}>Esta sesion no tiene mensajes guardados.</p>
        )}
      </div>
    </div>
  )
}
