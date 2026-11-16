import { Link as RouterLink } from 'react-router-dom'
import { Button, Typography } from '@mui/material'

export default function ForbiddenPage() {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Accès refusé
      </Typography>
      <Typography sx={{ mb: 2 }}>Votre rôle ne vous permet pas d'accéder à cette page.</Typography>
      <Button component={RouterLink} to="/tableau-de-bord" variant="contained">
        Retour au tableau de bord
      </Button>
    </>
  )
}
