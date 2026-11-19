import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material'

const COMMENTAIRE_MAX = 400

const CONFIG = {
  APPROUVER: {
    titre: 'Approuver ce document ?',
    texte: 'Le document passera à l’étape suivante du circuit (ou sera validé s’il s’agit de la dernière).',
    bouton: 'Approuver',
    color: 'success',
    obligatoire: false,
    label: 'Commentaire (facultatif)',
  },
  DEMANDER_MODIFICATION: {
    titre: 'Demander une modification',
    texte: 'Le document repasse en brouillon : l’auteur pourra le corriger puis le soumettre à nouveau.',
    bouton: 'Demander la modification',
    color: 'warning',
    obligatoire: true,
    label: 'Que faut-il corriger ?',
  },
  REJETER: {
    titre: 'Rejeter ce document',
    texte: 'Le document est renvoyé à son auteur avec le motif du rejet.',
    bouton: 'Rejeter',
    color: 'error',
    obligatoire: true,
    label: 'Motif du rejet',
  },
}

// Monté seulement quand une décision est choisie : son état repart donc de zéro à chaque ouverture.
export default function DecisionDialog({ decision, onCancel, onConfirm }) {
  const [commentaire, setCommentaire] = useState('')
  const config = CONFIG[decision]
  const invalide = config.obligatoire && !commentaire.trim()

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{config.titre}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{config.texte}</DialogContentText>
        <TextField
          autoFocus
          label={config.label}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          required={config.obligatoire}
          multiline
          minRows={3}
          fullWidth
          helperText={`${commentaire.length}/${COMMENTAIRE_MAX}`}
          slotProps={{ htmlInput: { maxLength: COMMENTAIRE_MAX } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Annuler</Button>
        <Button color={config.color} variant="contained" disabled={invalide} onClick={() => onConfirm(commentaire)}>
          {config.bouton}
        </Button>
      </DialogActions>
    </Dialog>
  )
}