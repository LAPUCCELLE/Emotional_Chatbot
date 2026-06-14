import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import MoodScale from '../components/MoodScale'
import { sendMessage, resetChat } from '../services/claude'
import { saveSession } from '../utils/storage'
import { CRISIS_RESOURCES } from '../utils/messages'
import styles from './Chat.module.css'

const PHASE = {
  GREETING:     'greeting',
  CHECKIN:      'checkin',
  CRISIS:       'crisis',
  ROUTING:      'routing',
  CONVERSATION: 'conversation',
  CHECKOUT:     'checkout',
  DONE:         'done',
}

const ROUTES = [
  { id: 'respiracion', label: 'Ejercicio de respiracion', desc: 'Reduce la tension en minutos' },
  { id: 'escritura',   label: 'Escribir mis pensamientos', desc: 'Organiza lo que tienes en mente' },
]

export default function Chat() {
  const navigate     = useNavigate()
  const initialized  = useRef(false)
  const endRef       = useRef(null)

  const [msgs, setMsgs]                 = useState([])
  const [phase, setPhase]               = useState(PHASE.GREETING)
  const [loading, setLoading]           = useState(false)
  const [input, setInput]               = useState('')
  const [selectedMood, setSelectedMood] = useState(null)
  const [moodStart, setMoodStart]       = useState(null)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    resetChat()
    startGreeting()
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  function addBot(text) {
    setMsgs(prev => [...prev, { id: crypto.randomUUID(), role: 'bot', text }])
  }

  function addUser(text) {
    setMsgs(prev => [...prev, { id: crypto.randomUUID(), role: 'user', text }])
  }

  async function botSay(trigger) {
    setLoading(true)
    try {
      const text = await sendMessage(trigger)
      addBot(text)
      return text
    } catch {
      addBot('Perdon, hubo un problema de conexion. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function startGreeting() {
    await botSay('INICIO_SESION')
    setPhase(PHASE.CHECKIN)
  }

  async function handleMoodCheckin() {
    const val = selectedMood
    setSelectedMood(null)
    setMoodStart(val)
    addUser(`Mi estado de animo es ${val} de 10`)

    if (val <= 3) {
      setPhase(PHASE.CRISIS)
      await botSay(`El usuario indica estado de animo ${val}/10. Expresa contencion emocional genuina. No sugieras actividades aun.`)
    } else {
      setPhase(PHASE.ROUTING)
      await botSay(`El usuario indica estado de animo ${val}/10. Valida su estado y pregunta que necesita hoy.`)
    }
  }

  async function handleRouteSelect(route) {
    addUser(route.label)
    setPhase(PHASE.CONVERSATION)
    await botSay(`El usuario eligio: "${route.label}". Comienza a guiarlo en esa actividad con calma y calidez.`)
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    addUser(text)
    await botSay(text)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function startCheckout() {
    setPhase(PHASE.CHECKOUT)
    setSelectedMood(null)
    await botSay('La sesion llega al final. Pregunta al usuario como se siente ahora en escala del 1 al 10.')
  }

  async function handleMoodCheckout() {
    const val = selectedMood
    setSelectedMood(null)
    addUser(`Ahora me siento ${val} de 10`)
    saveSession({ moodStart, moodEnd: val, route: 'conversacional', journalEntries: [] })
    setPhase(PHASE.DONE)
    await botSay(`El usuario termino con estado ${val}/10, habia comenzado con ${moodStart}/10. Haz una comparacion empatica y despidete con calidez.`)
  }

  // El input de texto es visible en todas las fases conversacionales
  const showInput = [PHASE.CHECKIN, PHASE.ROUTING, PHASE.CONVERSATION, PHASE.CRISIS].includes(phase)

  return (
    <div className="screen">
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate('/')} aria-label="Volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={styles.botInfo}>
          <span className={styles.botName}>Alma</span>
          <span className={styles.botSub}>Asistente de bienestar</span>
        </div>
        <button className={styles.iconBtn} onClick={() => navigate('/history')} aria-label="Historial">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>

      <div className={styles.messages}>
        {msgs.map(m => (
          <ChatBubble key={m.id} role={m.role}>{m.text}</ChatBubble>
        ))}
        {loading && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <div className={styles.inputArea}>

        {/* Escala de animo - check-in */}
        {phase === PHASE.CHECKIN && !loading && (
          <div className={styles.contextualUI}>
            <p className={styles.hint}>Selecciona tu estado o escribe a continuacion</p>
            <MoodScale value={selectedMood} onChange={setSelectedMood} />
            {selectedMood !== null && (
              <button className="btn-primary" onClick={handleMoodCheckin}>
                Confirmar estado de animo
              </button>
            )}
          </div>
        )}

        {/* Seleccion de ruta */}
        {phase === PHASE.ROUTING && !loading && (
          <div className={styles.contextualUI}>
            {ROUTES.map(r => (
              <button key={r.id} className={styles.routeBtn} onClick={() => handleRouteSelect(r)}>
                <div className={styles.routeBtnText}>
                  <span className={styles.routeLabel}>{r.label}</span>
                  <span className={styles.routeDesc}>{r.desc}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Recursos de crisis */}
        {phase === PHASE.CRISIS && !loading && (
          <div className={styles.crisisZone}>
            {CRISIS_RESOURCES.map((r, i) => (
              <div key={i} className={styles.resourceCard}>
                <p className={styles.resourceName}>{r.name}</p>
                <p className={styles.resourceDetail}>{r.detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* Escala de animo - check-out */}
        {phase === PHASE.CHECKOUT && !loading && (
          <div className={styles.contextualUI}>
            <p className={styles.hint}>Como te sientes ahora?</p>
            <MoodScale value={selectedMood} onChange={setSelectedMood} />
            {selectedMood !== null && (
              <button className="btn-primary" onClick={handleMoodCheckout}>
                Confirmar
              </button>
            )}
          </div>
        )}

        {/* Fin de sesion */}
        {phase === PHASE.DONE && !loading && (
          <div className={styles.doneZone}>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Nueva sesion
            </button>
            <button className="btn-secondary" onClick={() => navigate('/history')}>
              Ver mi historial
            </button>
          </div>
        )}

        {/* Input de texto - siempre visible en fases conversacionales */}
        {showInput && (
          <div className={styles.textZone}>
            <div className={styles.inputRow}>
              <textarea
                className={styles.textarea}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe aqui... (Enter para enviar)"
                rows={2}
                disabled={loading}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!input.trim() || loading}
                aria-label="Enviar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            {[PHASE.CONVERSATION, PHASE.CRISIS].includes(phase) && (
              <button className="btn-secondary" onClick={startCheckout} disabled={loading}>
                Finalizar sesion
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
