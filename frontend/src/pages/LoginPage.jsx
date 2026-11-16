import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { user, login, notice } = useAuth()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Déjà connecté : retour à la page demandée au départ (ou à l'accueil)
  if (user) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username.trim(), password)
    } catch (e) {
      setError(e.status ? e.message : 'Impossible de joindre le serveur. Réessayez dans un instant.')
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Card sx={{ width: '100%', maxWidth: 400 }} elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h1">
              Gestion documentaire
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connexion à votre espace
            </Typography>
          </Box>

          {notice && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {notice}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Identifiant"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting || !username.trim() || !password}
              sx={{ mt: 2 }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
