import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import MoodScale from '../components/MoodScale'
import { sendMessage, resetChat, setMemory } from '../services/claude'
import { saveSessionToFirestore } from '../utils/firestoreStorage'
import { useAuth } from '../context/AuthContext'
import { MESSAGES, CRISIS_RESOURCES, BREATHING_STEPS, JOURNALING_QUESTIONS } from '../utils/messages'
import styles from './Chat.module.css'

const PHASE = {
  GREETING:     'greeting',
  CHECKIN:      'checkin',
  CRISIS:       'crisis',
  ROUTING:      'routing',
  BREATHING:    'breathing',
  JOURNALING:   'journaling',
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
  const { uid, user, isAnonymous, logout } = useAuth()
  const initialized  = useRef(false)
  const endRef       = useRef(null)

  const [msgs, setMsgs]                 = useState([])
  const [phase, setPhase]               = useState(PHASE.GREETING)
  const [loading, setLoading]           = useState(false)
  const [input, setInput]               = useState('')
  const [selectedMood, setSelectedMood] = useState(null)
  const [moodStart, setMoodStart]       = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)

  const [breathingStarted, setBreathingStarted] = useState(false)
  const [breathingStep, setBreathingStep]       = useState(0)

  const [journalStarted, setJournalStarted] = useState(false)
  const [journalIndex, setJournalIndex]     = useState(0)
  const [journalDraft, setJournalDraft]     = useState('')
  const [journalEntries, setJournalEntries] = useState([])

  const [hadCrisis, setHadCrisis] = useState(false)

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
    const id = crypto.randomUUID()
    let started = false
    try {
      const text = await sendMessage(trigger, chunk => {
        if (!started) {
          started = true
          setLoading(false)
          setMsgs(prev => [...prev, { id, role: 'bot', text: chunk }])
        } else {
          setMsgs(prev => prev.map(m => (m.id === id ? { ...m, text: m.text + chunk } : m)))
        }
      })
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
    setMemory(`Animo inicial ${val}/10.`)

    if (val <= 3) {
      setHadCrisis(true)
      setPhase(PHASE.CRISIS)
      await botSay(`El usuario indica estado de animo ${val}/10. Expresa contencion emocional genuina. No sugieras actividades aun.`)
    } else {
      setPhase(PHASE.ROUTING)
      await botSay(`El usuario indica estado de animo ${val}/10. Valida su estado y pregunta que necesita hoy.`)
    }
  }

  function handleRouteSelect(route) {
    addUser(route.label)
    setSelectedRoute(route.id)
    if (route.id === 'respiracion') {
      setPhase(PHASE.BREATHING)
      MESSAGES.breathingIntro.forEach(addBot)
    } else {
      setPhase(PHASE.JOURNALING)
      MESSAGES.journalingIntro.forEach(addBot)
    }
  }

  function startBreathing() {
    setBreathingStarted(true)
    addBot(BREATHING_STEPS[0].text)
  }

  function nextBreathingStep() {
    const next = breathingStep + 1
    if (next < BREATHING_STEPS.length) {
      setBreathingStep(next)
      addBot(BREATHING_STEPS[next].text)
    } else {
      finishBreathing()
    }
  }

  async function finishBreathing() {
    MESSAGES.breathingEnd.forEach(addBot)
    setPhase(PHASE.CONVERSATION)
    setMemory(`Animo inicial ${moodStart}/10. El usuario completo un ejercicio de respiracion guiada.`)
    await botSay('El usuario termino el ejercicio de respiracion guiada. Pregunta como se siente ahora y si quiere conversar sobre algo mas, o si prefiere finalizar la sesion.')
  }

  function startJournaling() {
    setJournalStarted(true)
    addBot(JOURNALING_QUESTIONS[0])
  }

  function submitJournalAnswer() {
    const text = journalDraft.trim()
    if (!text) return
    addUser(text)
    setJournalDraft('')
    const updated = [...journalEntries, text]
    setJournalEntries(updated)

    const next = journalIndex + 1
    if (next < JOURNALING_QUESTIONS.length) {
      setJournalIndex(next)
      addBot(JOURNALING_QUESTIONS[next])
    } else {
      finishJournaling(updated)
    }
  }

  async function finishJournaling(entries) {
    MESSAGES.journalingEnd.forEach(addBot)
    setPhase(PHASE.CONVERSATION)
    setMemory(`Animo inicial ${moodStart}/10. El usuario completo un ejercicio de journaling con ${entries.length} respuestas escritas.`)
    await botSay('El usuario termino de escribir sus pensamientos en el ejercicio de journaling. Reconoce brevemente lo que compartio y pregunta si quiere conversar sobre algo mas, o si prefiere finalizar la sesion.')
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
    const checkoutText = `Ahora me siento ${val} de 10`
    addUser(checkoutText)
    setPhase(PHASE.DONE)
    const farewell = await botSay(`El usuario termino con estado ${val}/10, habia comenzado con ${moodStart}/10. Haz una comparacion empatica y despidete con calidez.`)

    if (uid) {
      const fullMsgs = [...msgs, { role: 'user', text: checkoutText }, { role: 'bot', text: farewell || '' }]
      saveSessionToFirestore(uid, {
        moodStart,
        moodEnd: val,
        route: selectedRoute || 'conversacional',
        journalEntries,
        messages: fullMsgs.map(m => ({ role: m.role, text: m.text })),
      })
    }
  }

  // El input de texto es visible en todas las fases conversacionales
  const showInput = [PHASE.CHECKIN, PHASE.ROUTING, PHASE.CONVERSATION, PHASE.CRISIS].includes(phase)

  return (
    <div className={`screen ${styles.chatLayout}`}>

      {/* Sidebar — solo visible en desktop */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div>
            <div className={styles.sidebarName}>Alma</div>
            <div className={styles.sidebarSub}>Espacio Contigo</div>
          </div>
        </div>
        <nav className={styles.sidebarNav}>
          <button className={styles.sidebarNavBtn} onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Inicio
          </button>
          <button className={styles.sidebarNavBtn} onClick={() => navigate('/history')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Mi historial
          </button>
        </nav>
        <div className={styles.sidebarFooter}>
          {isAnonymous ? (
            <span className={styles.sidebarUserHint}>Sin cuenta guardada</span>
          ) : (
            <>
              <span className={styles.sidebarUserName}>{user?.displayName}</span>
              <button className={styles.sidebarLogout} onClick={logout}>Cerrar sesion</button>
            </>
          )}
        </div>
      </aside>

      {/* Panel principal del chat */}
      <div className={styles.chatMain}>
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

        {/* Ejercicio de respiracion guiada */}
        {phase === PHASE.BREATHING && !loading && (
          <div className={styles.contextualUI}>
            {!breathingStarted ? (
              <button className="btn-primary" onClick={startBreathing}>
                Comenzar ejercicio
              </button>
            ) : (
              <>
                <p className={styles.hint}>Paso {breathingStep + 1} de {BREATHING_STEPS.length}</p>
                <button className="btn-primary" onClick={nextBreathingStep}>
                  {breathingStep === BREATHING_STEPS.length - 1 ? 'Finalizar' : 'Siguiente paso'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Ejercicio de journaling guiado */}
        {phase === PHASE.JOURNALING && !loading && (
          <div className={styles.textZone}>
            {!journalStarted ? (
              <button className="btn-primary" onClick={startJournaling}>
                Comenzar
              </button>
            ) : (
              <div className={styles.inputRow}>
                <textarea
                  className={styles.textarea}
                  value={journalDraft}
                  onChange={e => setJournalDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submitJournalAnswer()
                    }
                  }}
                  placeholder="Escribe tu respuesta... (Enter para enviar)"
                  rows={2}
                  autoFocus
                />
                <button
                  className={styles.sendBtn}
                  onClick={submitJournalAnswer}
                  disabled={!journalDraft.trim()}
                  aria-label="Enviar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            )}
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
            {hadCrisis && (
              <div className={styles.crisisZone}>
                {CRISIS_RESOURCES.map((r, i) => (
                  <div key={i} className={styles.resourceCard}>
                    <p className={styles.resourceName}>{r.name}</p>
                    <p className={styles.resourceDetail}>{r.detail}</p>
                  </div>
                ))}
              </div>
            )}
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

      </div>{/* /inputArea */}
      </div>{/* /chatMain */}
    </div>
  )
}
