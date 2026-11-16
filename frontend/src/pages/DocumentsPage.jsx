import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { apiFetch } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { NIVEAUX, STATUTS, formatDate, typeLabel } from '../config/documents'
import { useFlash } from '../hooks/useFlash'

export default function DocumentsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [flash, setFlash] = useFlash()
  const [documents, setDocuments] = useState(null)
  const [error, setError] = useState('')
  const estRedacteur = user.role === 'REDACTEUR'

  useEffect(() => {
    if (!estRedacteur) return
    apiFetch('/documents/mes-documents')
      .then(setDocuments)
      .catch((e) => setError(e.message))
  }, [estRedacteur])

  if (!estRedacteur) {
    return (
      <>
        <Typography variant="h4" component="h1" gutterBottom>
          Documents
        </Typography>
        <Alert severity="info">La consultation et la recherche de documents seront disponibles au jour 9.</Alert>
      </>
    )
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Mes documents
        </Typography>
        <Button component={RouterLink} to="/documents/nouveau" variant="contained">
          Nouveau document
        </Button>
      </Stack>

      {flash && (
        <Alert severity="success" onClose={() => setFlash('')} sx={{ mb: 2 }}>
          {flash}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {documents === null && !error && (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {documents && documents.length === 0 && (
        <Alert severity="info">Vous n'avez encore aucun document. Créez votre premier brouillon.</Alert>
      )}

      {documents && documents.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Référence</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Objet</TableCell>
                <TableCell>Confidentialité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Modifié le</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((d) => {
                const niveau = NIVEAUX.find((n) => n.value === d.niveau)
                const statut = STATUTS[d.statut] ?? { label: d.statut, color: 'default' }
                return (
                  <TableRow key={d.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/documents/${d.id}`)}>
                    <TableCell>
                      <Link component={RouterLink} to={`/documents/${d.id}`}>
                        {d.reference}
                      </Link>
                    </TableCell>
                    <TableCell>{typeLabel(d.type)}</TableCell>
                    <TableCell>{d.objet}</TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={niveau?.label ?? d.niveau} color={niveau?.color} />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={statut.label} color={statut.color} />
                    </TableCell>
                    <TableCell>{formatDate(d.dateModification)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}