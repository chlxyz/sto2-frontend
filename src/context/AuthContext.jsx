import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { csrf } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const me = useCallback(async () => {
    try {
      const { data } = await api.get('/user')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { me() }, [me])

  const requestCode = useCallback(async (email) => {
    await csrf()
    await api.post('/otp/request', { email })
  }, [])

  const verifyCode = useCallback(async (email, code, remember) => {
    await csrf()
    const { data } = await api.post('/otp/verify', { email, code, remember })
    setUser(data)
    return data
  }, [])

  const saveProfile = useCallback(async (patch) => {
    const { data } = await api.patch('/user', patch)
    setUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    await api.post('/logout')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, requestCode, verifyCode, saveProfile, logout, refresh: me }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
