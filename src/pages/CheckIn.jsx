import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { useChatSequence } from '../hooks/useChatSequence'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import MoodScale from '../components/MoodScale'
import { MESSAGES } from '../utils/messages'
import styles from './CheckIn.module.css'

function getAck(mood) {
  if (mood <= 3) return MESSAGES.checkinAck.low
  if (mood <= 6) return MESSAGES.checkinAck.mid
  return MESSAGES.checkinAck.high
}

export default function CheckIn() {
  const navigate = useNavigate()
  const { updateSession } = useSession()
  const { shown, isTyping, isDone } = useChatSequence(MESSAGES.checkin)
  const [mood, setMood] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  function handleConfirm() {
    updateSession({ moodStart: mood })
    setConfirmed(true)
    setTimeout(() => {
      if (mood <= 3) navigate('/crisis')
      else navigate('/routes')
    }, 1400)
  }

  return (
    <div className="screen">
      <div className={styles.topbar}>
        <span className={styles.step}>Check-in</span>
      </div>

      <div className={styles.chat}>
        {shown.map((msg, i) => (
          <ChatBubble key={i}>{msg}</ChatBubble>
        ))}
        {isTyping && <TypingIndicator />}

        {mood !== null && !confirmed && (
          <ChatBubble role="user">{mood} / 10</ChatBubble>
        )}

        {confirmed && (
          <ChatBubble>{getAck(mood)}</ChatBubble>
        )}
      </div>

      {isDone && !confirmed && (
        <div className={styles.actions}>
          <MoodScale value={mood} onChange={setMood} />
          {mood !== null && (
            <button className="btn-primary" onClick={handleConfirm}>
              Continuar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
