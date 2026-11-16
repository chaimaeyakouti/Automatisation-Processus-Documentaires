import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useAuth } from '../auth/useAuth'
import { ROLE_LABELS } from '../config/access'

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de bord
      </Typography>
      <Card sx={{ maxWidth: 520 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bienvenue, {user.nomComplet}
          </Typography>
          <Stack spacing={1}>
            <Typography>
              Identifiant : <strong>{user.username}</strong>
            </Typography>
            <Typography>Service : {user.service ?? '—'}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>Rôle :</Typography>
              <Chip color="primary" size="small" label={ROLE_LABELS[user.role] ?? user.role} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Typography color="text.secondary" sx={{ mt: 3 }}>
        Les indicateurs (documents par statut et par type) seront ajoutés au jour 10.
      </Typography>
    </>
  )
}
