import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChatSequence } from '../hooks/useChatSequence'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import { MESSAGES } from '../utils/messages'
import styles from './Home.module.css'

export default function Home() {
  const navigate = useNavigate()
  const { user, isAnonymous, loginWithGoogle, logout } = useAuth()
  const { shown, isTyping, isDone } = useChatSequence(MESSAGES.home)

  return (
    <>
      <header className={styles.navbar}>
        <span className={styles.navBrand}>Alma</span>
        {isAnonymous ? (
          <button className={styles.navBtn} onClick={loginWithGoogle}>
            Conectar con Google
          </button>
        ) : (
          <div className={styles.navRight}>
            <span className={styles.navUser}>{user.displayName}</span>
            <button className={styles.navBtn} onClick={logout}>
              Cerrar sesion
            </button>
          </div>
        )}
      </header>

      <div className={`screen ${styles.homeContent}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h1 className={styles.title}>Espacio Contigo</h1>
        </div>

        <div className={styles.chat}>
          {shown.map((msg, i) => (
            <ChatBubble key={i}>{msg}</ChatBubble>
          ))}
          {isTyping && <TypingIndicator />}
        </div>

        {isDone && (
          <div className={styles.actions}>
            <button className="btn-primary" onClick={() => navigate('/chat')}>
              Empezar
            </button>
            <button className="btn-secondary" onClick={() => navigate('/history')}>
              Ver mi historial
            </button>
          </div>
        )}
      </div>
    </>
  )
}
