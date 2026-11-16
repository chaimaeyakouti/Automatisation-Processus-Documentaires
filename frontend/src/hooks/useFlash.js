import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Récupère un message envoyé par la page précédente (ex. « Brouillon enregistré »)
// puis l'efface de l'historique pour qu'il ne réapparaisse pas à l'actualisation.
export function useFlash() {
  const location = useLocation()
  const navigate = useNavigate()
  const [flash, setFlash] = useState(location.state?.flash ?? '')

  useEffect(() => {
    if (location.state?.flash) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  return [flash, setFlash]
}