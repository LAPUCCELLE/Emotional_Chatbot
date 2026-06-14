import { createContext, useContext, useState } from 'react'

const SessionContext = createContext()

export function SessionProvider({ children }) {
  const [session, setSession] = useState({
    moodStart: null,
    moodEnd: null,
    route: null,
    journalEntries: [],
  })

  const updateSession = (updates) =>
    setSession(prev => ({ ...prev, ...updates }))

  const resetSession = () =>
    setSession({ moodStart: null, moodEnd: null, route: null, journalEntries: [] })

  return (
    <SessionContext.Provider value={{ session, updateSession, resetSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
