import { createContext, useContext, useEffect, useState } from 'react'
import { initAuth } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [uid, setUid]       = useState(null)
  const [ready, setReady]   = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    initAuth()
      .then(user => {
        setUid(user.uid)
        setReady(true)
      })
      .catch(err => {
        console.error('Auth error:', err)
        setError(err.message)
        setReady(true)
      })
  }, [])

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ color: '#7C3AED', fontSize: '0.9rem' }}>Cargando...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ uid, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
