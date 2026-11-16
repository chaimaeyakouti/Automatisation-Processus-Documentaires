import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch, getStoredToken, setUnauthorizedHandler, storeToken } from '../api/client'
import { AuthContext } from './authContext'

const INACTIVITY_MS = 15 * 60 * 1000 // déconnexion après 15 minutes d'inactivité

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()))
  const [notice, setNotice] = useState('')

  // Déconnexion volontaire
  const logout = useCallback(() => {
    storeToken(null)
    setUser(null)
    setNotice('')
  }, [])

  // Déconnexion subie (inactivité, jeton expiré) : on explique pourquoi
  const expireSession = useCallback(() => {
    storeToken(null)
    setUser(null)
    setNotice('Votre session a expiré. Veuillez vous reconnecter.')
  }, [])

  // Au chargement de la page : si un jeton existe, on retrouve l'utilisateur
  useEffect(() => {
    if (!getStoredToken()) return
    apiFetch('/auth/me')
      .then(setUser)
      .catch(() => storeToken(null))
      .finally(() => setLoading(false))
  }, [])

  // Tout 401 renvoyé par l'API déconnecte l'utilisateur
  useEffect(() => {
    setUnauthorizedHandler(expireSession)
    return () => setUnauthorizedHandler(null)
  }, [expireSession])

  // Minuteur d'inactivité
  useEffect(() => {
    if (!user) return
    let timer
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(expireSession, INACTIVITY_MS)
    }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((name) => window.addEventListener(name, reset))
    reset()
    return () => {
      clearTimeout(timer)
      events.forEach((name) => window.removeEventListener(name, reset))
    }
  }, [user, expireSession])

  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { username, password },
      auth: false,
    })
    storeToken(data.token)
    setNotice('')
    setUser(await apiFetch('/auth/me'))
  }, [])

  const value = useMemo(
    () => ({ user, loading, notice, login, logout }),
    [user, loading, notice, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
