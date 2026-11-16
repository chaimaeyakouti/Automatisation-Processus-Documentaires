import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { apiFetch } from '../api/client'
import DocumentForm from '../components/DocumentForm'
import { STATUTS, formatDate } from '../config/documents'
import { useFlash } from '../hooks/useFlash'

function messageErreur(e) {
  if (e.status === 404) return 'Document introuvable.'
  if (e.status === 403) return "Vous n'avez pas accès à ce document."
  return e.message
}

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [flash, setFlash] = useFlash()
  const [doc, setDoc] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiFetch(`/documents/${id}`)
      .then((data) => {
        if (!cancelled) {
          setDoc(data)
          setLoadError('')
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadError(messageErreur(e))
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const handleSave = async (values) => {
    setError('')
    setFlash('')
    setSaving(true)
    try {
      const updated = await apiFetch(`/documents/${id}`, {
        method: 'PUT',
        body: { objet: values.objet, contenu: values.contenu, niveau: values.niveau },
      })
      setDoc(updated)
      setFlash('Modifications enregistrées.')
    } catch (e) {
      setError(messageErreur(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setConfirmOpen(false)
    setError('')
    try {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' })
      navigate('/documents', { state: { flash: `Brouillon ${doc.reference} supprimé.` } })
    } catch (e) {
      setError(messageErreur(e))
    }
  }

  if (loadError) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
        <Button component={RouterLink} to="/documents" variant="outlined">
          Retour aux documents
        </Button>
      </>
    )
  }

  if (!doc) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  const statut = STATUTS[doc.statut] ?? { label: doc.statut, color: 'default' }
  const estBrouillon = doc.statut === 'BROUILLON'

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" component="h1">
          {doc.reference}
        </Typography>
        <Chip label={statut.label} color={statut.color} />
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Auteur : {doc.auteur} — Service : {doc.serviceEmetteur ?? '—'} — Créé le {formatDate(doc.dateCreation)} —
        Modifié le {formatDate(doc.dateModification)}
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
      {!estBrouillon && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Ce document n'est plus un brouillon : il ne peut plus être modifié.
        </Alert>
      )}

      <Card sx={{ maxWidth: 800 }}>
        <CardContent>
          <DocumentForm
            key={doc.id}
            initial={{ type: doc.type, objet: doc.objet, niveau: doc.niveau, contenu: doc.contenu ?? '' }}
            typeLocked
            readOnly={!estBrouillon}
            submitting={saving}
            submitLabel="Enregistrer"
            onSubmit={handleSave}
          >
            <Button color="error" onClick={() => setConfirmOpen(true)}>
              Supprimer le brouillon
            </Button>
          </DocumentForm>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Supprimer ce brouillon ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Le brouillon {doc.reference} sera définitivement supprimé. Cette action est enregistrée dans le journal
            d'audit.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button color="error" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}