const TOKEN_KEY = 'gestdoc.token'

let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

// sessionStorage : le jeton disparaît à la fermeture de l'onglet
export function getStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function storeToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // stockage indisponible : on ignore
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getStoredToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    // Jeton expiré ou invalide : on déconnecte (sauf pour la tentative de connexion elle-même)
    if (response.status === 401 && auth && onUnauthorized) onUnauthorized()
    const error = new Error((data && data.message) || `Erreur ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}
