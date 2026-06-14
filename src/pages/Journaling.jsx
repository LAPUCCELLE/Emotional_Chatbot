import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { useChatSequence } from '../hooks/useChatSequence'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import { MESSAGES, JOURNALING_QUESTIONS } from '../utils/messages'
import styles from './Journaling.module.css'

export default function Journaling() {
  const navigate = useNavigate()
  const { updateSession } = useSession()
  const { shown, isTyping, isDone: introDone } = useChatSequence(MESSAGES.journalingIntro)

  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [draft, setDraft] = useState('')
  const [showQ, setShowQ] = useState(false)
  const [showEnd, setShowEnd] = useState(false)

  function handleIntroReady() {
    setShowQ(true)
  }

  function handleSubmit() {
    if (!draft.trim()) return
    const newAnswers = [...answers, draft.trim()]
    setAnswers(newAnswers)
    setDraft('')

    if (qIndex < JOURNALING_QUESTIONS.length - 1) {
      setQIndex(i => i + 1)
    } else {
      updateSession({ journalEntries: newAnswers })
      setShowEnd(true)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && e.ctrlKey) handleSubmit()
  }

  return (
    <div className="screen">
      <div className={styles.topbar}>
        <span className={styles.step}>Journaling</span>
        {showQ && !showEnd && (
          <span className={styles.counter}>{qIndex + 1} / {JOURNALING_QUESTIONS.length}</span>
        )}
      </div>

      <div className={styles.chat}>
        {shown.map((msg, i) => (
          <ChatBubble key={i}>{msg}</ChatBubble>
        ))}
        {isTyping && <TypingIndicator />}

        {introDone && !showQ && (
          <div className={styles.introCta}>
            <button className="btn-primary" onClick={handleIntroReady}>
              Empezar
            </button>
          </div>
        )}

        {showQ && answers.map((ans, i) => (
          <div key={i}>
            <ChatBubble>{JOURNALING_QUESTIONS[i]}</ChatBubble>
            <ChatBubble role="user">{ans}</ChatBubble>
          </div>
        ))}

        {showQ && !showEnd && (
          <ChatBubble>{JOURNALING_QUESTIONS[qIndex]}</ChatBubble>
        )}

        {showEnd && (
          <ChatBubble>{MESSAGES.journalingEnd[0]}</ChatBubble>
        )}
      </div>

      {showQ && !showEnd && (
        <div className={styles.inputArea}>
          <textarea
            className={styles.textarea}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe aqui... (Ctrl+Enter para enviar)"
            rows={3}
            autoFocus
          />
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!draft.trim()}
          >
            Enviar
          </button>
        </div>
      )}

      {showEnd && (
        <div className={styles.inputArea}>
          <button className="btn-primary" onClick={() => navigate('/checkout')}>
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}
