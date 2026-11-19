import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Link,
  Paper,
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
import { NIVEAUX, formatDate, typeLabel } from '../config/documents'
import { useFlash } from '../hooks/useFlash'

export default function ATraiterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [flash, setFlash] = useFlash()
  const [documents, setDocuments] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/documents/a-traiter')
      .then(setDocuments)
      .catch((e) => setError(e.message))
  }, [])

  const consigne =
    user.role === 'RELECTEUR'
      ? 'Documents soumis qui attendent votre relecture.'
      : 'Documents qui attendent votre validation.'

  return (
    <>
      <Typography variant="h4" component="h1">
        Documents à traiter
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {consigne}
      </Typography>

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

      {documents && documents.length === 0 && <Alert severity="info">Aucun document n’attend votre décision.</Alert>}

      {documents && documents.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Référence</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Objet</TableCell>
                <TableCell>Auteur</TableCell>
                <TableCell>Confidentialité</TableCell>
                <TableCell>Dernière mise à jour</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((d) => {
                const niveau = NIVEAUX.find((n) => n.value === d.niveau)
                return (
                  <TableRow key={d.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/documents/${d.id}`)}>
                    <TableCell>
                      <Link component={RouterLink} to={`/documents/${d.id}`}>
                        {d.reference}
                      </Link>
                    </TableCell>
                    <TableCell>{typeLabel(d.type)}</TableCell>
                    <TableCell>{d.objet}</TableCell>
                    <TableCell>{d.auteur}</TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={niveau?.label ?? d.niveau} color={niveau?.color} />
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