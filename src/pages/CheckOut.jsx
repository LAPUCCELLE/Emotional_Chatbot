import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { useChatSequence } from '../hooks/useChatSequence'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import MoodScale from '../components/MoodScale'
import { MESSAGES } from '../utils/messages'
import { saveSession } from '../utils/storage'
import styles from './CheckOut.module.css'

const MOOD_COLORS = {
  1: '#EF4444', 2: '#F97316', 3: '#FB923C',
  4: '#FBBF24', 5: '#EAB308', 6: '#A3E635',
  7: '#4ADE80', 8: '#22C55E', 9: '#16A34A', 10: '#15803D',
}

function getComparisonMsg(start, end) {
  if (end > start + 1) return MESSAGES.checkoutComparison.better
  if (end < start - 1) return MESSAGES.checkoutComparison.worse
  return MESSAGES.checkoutComparison.same
}

export default function CheckOut() {
  const navigate = useNavigate()
  const { session, updateSession } = useSession()
  const { shown, isTyping, isDone } = useChatSequence(MESSAGES.checkout)
  const [mood, setMood] = useState(null)
  const [saved, setSaved] = useState(false)

  function handleConfirm() {
    updateSession({ moodEnd: mood })
    saveSession({ ...session, moodEnd: mood })
    setSaved(true)
  }

  return (
    <div className="screen">
      <div className={styles.topbar}>
        <span className={styles.step}>Check-out</span>
      </div>

      <div className={styles.chat}>
        {shown.map((msg, i) => (
          <ChatBubble key={i}>{msg}</ChatBubble>
        ))}
        {isTyping && <TypingIndicator />}

        {mood !== null && !saved && (
          <ChatBubble role="user">{mood} / 10</ChatBubble>
        )}

        {saved && (
          <>
            <div className={styles.comparison}>
              <div className={styles.moodBox}>
                <span className={styles.moodLabel}>Llegaste</span>
                <span
                  className={styles.moodValue}
                  style={{ color: MOOD_COLORS[session.moodStart] }}
                >
                  {session.moodStart}
                </span>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <div className={styles.moodBox}>
                <span className={styles.moodLabel}>Ahora</span>
                <span
                  className={styles.moodValue}
                  style={{ color: MOOD_COLORS[mood] }}
                >
                  {mood}
                </span>
              </div>
            </div>
            <ChatBubble>{getComparisonMsg(session.moodStart, mood)}</ChatBubble>
          </>
        )}
      </div>

      {isDone && !saved && (
        <div className={styles.actions}>
          <MoodScale value={mood} onChange={setMood} />
          {mood !== null && (
            <button className="btn-primary" onClick={handleConfirm}>
              Ver comparacion
            </button>
          )}
        </div>
      )}

      {saved && (
        <div className={styles.actions}>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Nueva sesion
          </button>
          <button className="btn-secondary" onClick={() => navigate('/history')}>
            Ver mi historial
          </button>
        </div>
      )}
    </div>
  )
}
