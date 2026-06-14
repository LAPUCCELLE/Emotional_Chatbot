import { useNavigate } from 'react-router-dom'
import { useChatSequence } from '../hooks/useChatSequence'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import { MESSAGES, CRISIS_RESOURCES } from '../utils/messages'
import styles from './Crisis.module.css'

const ICONS = {
  tel: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.29 6.29l1.36-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  uni: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
}

export default function Crisis() {
  const navigate = useNavigate()
  const { shown, isTyping, isDone } = useChatSequence(MESSAGES.crisis, 1100)

  return (
    <div className="screen">
      <div className={styles.topbar}>
        <div className={styles.badge}>Apoyo inmediato</div>
      </div>

      <div className={styles.chat}>
        {shown.map((msg, i) => (
          <ChatBubble key={i}>{msg}</ChatBubble>
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {isDone && (
        <div className={styles.resources}>
          {CRISIS_RESOURCES.map((r, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardIcon}>{ICONS[r.icon]}</div>
              <div>
                <p className={styles.cardName}>{r.name}</p>
                <p className={styles.cardDetail}>{r.detail}</p>
              </div>
            </div>
          ))}
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  )
}
