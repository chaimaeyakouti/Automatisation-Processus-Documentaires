import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  AlertTitle,
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
import { useAuth } from '../auth/useAuth'
import DecisionDialog from '../components/DecisionDialog'
import DocumentForm from '../components/DocumentForm'
import EtapesHistorique from '../components/EtapesHistorique'
import { STATUTS, circuitLabel, formatDate, statutAttendu } from '../config/documents'
import { useFlash } from '../hooks/useFlash'

const PREFIXE_MODIFICATION = 'Demande de modification : '

const RESULTAT_DECISION = {
  APPROUVER: 'approuvé',
  DEMANDER_MODIFICATION: 'renvoyé à son auteur pour modification',
  REJETER: 'rejeté',
}

function messageErreur(e, accesRefuse = "Vous n'avez pas accès à ce document.") {
  if (e.status === 404) return 'Document introuvable.'
  if (e.status === 403) return accesRefuse
  return e.message
}

// Dernier refus du circuit (rejet ou demande de modification), à rappeler à l'auteur
function dernierRefus(doc, etapes) {
  if (doc.statut !== 'BROUILLON' && doc.statut !== 'REJETE') return null
  return [...etapes].reverse().find((e) => e.statut === 'REJETEE') ?? null
}

function messageStatut(doc, estRedacteur, aMoiDeDecider) {
  if (estRedacteur) {
    if (doc.statut === 'SOUMIS') return "Document soumis : il est en attente de relecture, vous ne pouvez plus le modifier."
    if (doc.statut === 'EN_VALIDATION') return 'Document en cours de validation : vous ne pouvez plus le modifier.'
    if (doc.statut === 'VALIDE') return 'Document validé : il ne peut plus être modifié.'
    if (doc.statut === 'ARCHIVE') return 'Document archivé : il ne peut plus être modifié.'
    return null
  }
  return aMoiDeDecider ? null : 'Document en lecture seule : ce n’est pas (ou plus) à vous de le traiter.'
}

export default function DocumentDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [flash, setFlash] = useFlash()
  const [doc, setDoc] = useState(null)
  const [etapes, setEtapes] = useState([])
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [decision, setDecision] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([apiFetch(`/documents/${id}`), apiFetch(`/documents/${id}/etapes`).catch(() => [])])
      .then(([data, steps]) => {
        if (!cancelled) {
          setDoc(data)
          setEtapes(steps)
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

  const rechargerEtapes = () =>
    apiFetch(`/documents/${id}/etapes`)
      .then(setEtapes)
      .catch(() => setEtapes([]))

  // Enveloppe commune : message d'erreur, état « occupé » pendant l'appel
  const executer = async (action, accesRefuse) => {
    setError('')
    setFlash('')
    setBusy(true)
    try {
      await action()
    } catch (e) {
      setError(messageErreur(e, accesRefuse))
    } finally {
      setBusy(false)
    }
  }

  const handleSave = (values) =>
    executer(async () => {
      const updated = await apiFetch(`/documents/${id}`, {
        method: 'PUT',
        body: { objet: values.objet, contenu: values.contenu, niveau: values.niveau },
      })
      setDoc(updated)
      setFlash('Modifications enregistrées.')
    })

  const handleDelete = () => {
    setConfirmDelete(false)
    return executer(async () => {
      await apiFetch(`/documents/${id}`, { method: 'DELETE' })
      navigate('/documents', { state: { flash: `Brouillon ${doc.reference} supprimé.` } })
    })
  }

  const handleSoumettre = () => {
    setConfirmSubmit(false)
    return executer(async () => {
      const updated = await apiFetch(`/documents/${id}/soumettre`, { method: 'POST' })
      setDoc(updated)
      await rechargerEtapes()
      const destinataire = updated.statut === 'SOUMIS' ? 'du relecteur' : 'du validateur'
      setFlash(`Document soumis : il est maintenant en attente ${destinataire}.`)
    })
  }

  const handleDecision = (commentaire) => {
    const choix = decision
    setDecision(null)
    return executer(async () => {
      await apiFetch(`/documents/${id}/decision`, {
        method: 'POST',
        body: { decision: choix, commentaire: commentaire.trim() || null },
      })
      navigate('/a-traiter', { state: { flash: `Document ${doc.reference} ${RESULTAT_DECISION[choix]}.` } })
    }, "Ce document n'est plus en attente de votre décision.")
  }

  if (loadError) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
        <Button component={RouterLink} to={user.role === 'REDACTEUR' ? '/documents' : '/a-traiter'} variant="outlined">
          Retour à la liste
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
  // Un rédacteur ne reçoit que ses propres documents (le serveur l'impose) : il en est donc l'auteur
  const estRedacteur = user.role === 'REDACTEUR'
  const modifiable = estRedacteur && (doc.statut === 'BROUILLON' || doc.statut === 'REJETE')
  const supprimable = estRedacteur && doc.statut === 'BROUILLON'
  const aMoiDeDecider = statutAttendu(user.role) === doc.statut
  const refus = dernierRefus(doc, etapes)
  const demandeModification = refus?.commentaire?.startsWith(PREFIXE_MODIFICATION)
  const info = messageStatut(doc, estRedacteur, aMoiDeDecider)

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
      {refus && (
        <Alert severity={demandeModification ? 'warning' : 'error'} sx={{ mb: 2 }}>
          <AlertTitle>
            {demandeModification ? 'Modification demandée' : 'Document rejeté'} par {refus.validateur}
          </AlertTitle>
          {demandeModification ? refus.commentaire.slice(PREFIXE_MODIFICATION.length) : refus.commentaire}
        </Alert>
      )}
      {info && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {info}
        </Alert>
      )}

      {aMoiDeDecider && (
        <Card sx={{ maxWidth: 800, mb: 2 }}>
          <CardContent>
            <Typography sx={{ mb: 2 }}>Ce document attend votre décision.</Typography>
            <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button variant="contained" color="success" disabled={busy} onClick={() => setDecision('APPROUVER')}>
                Approuver
              </Button>
              <Button
                variant="outlined"
                color="warning"
                disabled={busy}
                onClick={() => setDecision('DEMANDER_MODIFICATION')}
              >
                Demander une modification
              </Button>
              <Button variant="outlined" color="error" disabled={busy} onClick={() => setDecision('REJETER')}>
                Rejeter
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card sx={{ maxWidth: 800 }}>
        <CardContent>
          <DocumentForm
            key={`${doc.id}-${doc.statut}`}
            initial={{ type: doc.type, objet: doc.objet, niveau: doc.niveau, contenu: doc.contenu ?? '' }}
            typeLocked
            readOnly={!modifiable}
            submitting={busy}
            submitLabel="Enregistrer"
            onSubmit={handleSave}
          >
            <Button variant="outlined" disabled={busy} onClick={() => setConfirmSubmit(true)}>
              Soumettre pour validation
            </Button>
            {supprimable && (
              <Button color="error" onClick={() => setConfirmDelete(true)}>
                Supprimer le brouillon
              </Button>
            )}
          </DocumentForm>
        </CardContent>
      </Card>

      <EtapesHistorique etapes={etapes} />

      {decision && <DecisionDialog decision={decision} onCancel={() => setDecision(null)} onConfirm={handleDecision} />}

      <Dialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)}>
        <DialogTitle>Soumettre ce document ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Circuit : {circuitLabel(doc.type)}.
            <br />
            Une fois soumis, vous ne pourrez plus le modifier, sauf s’il est rejeté ou si une modification est demandée.
            <br />
            C’est la version enregistrée qui est soumise : enregistrez d’abord vos modifications.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSoumettre}>
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Supprimer ce brouillon ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Le brouillon {doc.reference} sera définitivement supprimé. Cette action est enregistrée dans le journal
            d'audit.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Annuler</Button>
          <Button color="error" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}