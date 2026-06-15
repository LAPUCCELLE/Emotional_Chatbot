import { createContext, useContext, useEffect, useState } from 'react'
import { initAuth, loginWithGoogle, logout } from '../services/firebase'
import { saveUserProfile } from '../utils/firestoreStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [ready, setReady]   = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    initAuth()
      .then(u => {
        setUser(u)
        setReady(true)
      })
      .catch(err => {
        console.error('Auth error:', err)
        setError(err.message)
        setReady(true)
      })
  }, [])

  async function handleLoginWithGoogle() {
    try {
      const user = await loginWithGoogle()
      setUser(user)
      await saveUserProfile(user)
    } catch (err) {
      console.error('Error al conectar con Google:', err)
    }
  }

  async function handleLogout() {
    setUser(await logout())
  }

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <p style={{ color: '#7C3AED', fontSize: '0.9rem' }}>Cargando...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      uid: user?.uid ?? null,
      user,
      isAnonymous: user?.isAnonymous ?? true,
      loginWithGoogle: handleLoginWithGoogle,
      logout: handleLogout,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
