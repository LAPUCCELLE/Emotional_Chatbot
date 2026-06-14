import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChatSequence } from '../hooks/useChatSequence'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import { MESSAGES, BREATHING_STEPS } from '../utils/messages'
import styles from './BreathingGuide.module.css'

export default function BreathingGuide() {
  const navigate = useNavigate()
  const { shown, isTyping, isDone: introDone } = useChatSequence(MESSAGES.breathingIntro)
  const [stepIndex, setStepIndex] = useState(0)
  const [started, setStarted] = useState(false)

  const currentStep = BREATHING_STEPS[stepIndex]
  const isLastStep = stepIndex === BREATHING_STEPS.length - 1

  function handleNext() {
    if (isLastStep) {
      navigate('/checkout')
    } else {
      setStepIndex(i => i + 1)
    }
  }

  return (
    <div className="screen">
      <div className={styles.topbar}>
        <span className={styles.step}>Respiracion guiada</span>
        {started && (
          <span className={styles.counter}>{stepIndex + 1} / {BREATHING_STEPS.length}</span>
        )}
      </div>

      <div className={styles.content}>
        {!started ? (
          <>
            <div className={styles.chat}>
              {shown.map((msg, i) => (
                <ChatBubble key={i}>{msg}</ChatBubble>
              ))}
              {isTyping && <TypingIndicator />}
            </div>
            {introDone && (
              <div className={styles.actions}>
                <button className="btn-primary" onClick={() => setStarted(true)}>
                  Empezar ejercicio
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.exerciseArea}>
              <div className={`${styles.circle} ${styles[currentStep.phase]}`} />
              <p className={styles.instruction}>{currentStep.text}</p>
            </div>
            <div className={styles.actions}>
              <button className="btn-primary" onClick={handleNext}>
                {isLastStep ? 'Finalizar' : 'Continuar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
