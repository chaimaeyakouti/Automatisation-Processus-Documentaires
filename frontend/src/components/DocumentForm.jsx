import { useState } from 'react'
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material'
import { TYPES, niveauParDefaut, niveauxAutorises } from '../config/documents'
import { useAuth } from '../auth/useAuth'

const OBJET_MAX = 200
const CONTENU_MAX = 20000

export default function DocumentForm({
  initial,
  typeLocked = false,
  readOnly = false,
  submitting = false,
  submitLabel = 'Enregistrer le brouillon',
  onSubmit,
  children,
}) {
  const { user } = useAuth()
  const [values, setValues] = useState(initial)
  const niveaux = niveauxAutorises(values.type, user.habilitation)
  // Le type choisi exige un niveau supérieur à l'habilitation de la personne
  const habilitationInsuffisante = niveaux.length === 0

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  // Changer de type remet le niveau de confidentialité par défaut de ce type
  const handleTypeChange = (event) => {
    const type = event.target.value
    setValues((current) => ({ ...current, type, niveau: niveauParDefaut(type) }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ ...values, objet: values.objet.trim() })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        <TextField
          select
          label="Type de document"
          value={values.type}
          onChange={handleTypeChange}
          disabled={typeLocked || readOnly}
          fullWidth
        >
          {TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Objet"
          value={values.objet}
          onChange={handleChange('objet')}
          required
          disabled={readOnly}
          fullWidth
          helperText={`${values.objet.length}/${OBJET_MAX}`}
          slotProps={{ htmlInput: { maxLength: OBJET_MAX } }}
        />

        <TextField
          select
          label="Niveau de confidentialité"
          value={habilitationInsuffisante ? '' : values.niveau}
          error={habilitationInsuffisante}
          onChange={handleChange('niveau')}
          disabled={readOnly}
          fullWidth
          helperText={
            habilitationInsuffisante
              ? 'Votre habilitation ne vous permet pas de produire ce type de document.'
              : "Il est compris entre le niveau minimal du type et votre habilitation."
          }
        >
          {niveaux.map((n) => (
            <MenuItem key={n.value} value={n.value}>
              {n.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Contenu"
          value={values.contenu}
          onChange={handleChange('contenu')}
          multiline
          minRows={8}
          disabled={readOnly}
          fullWidth
          helperText={`${values.contenu.length}/${CONTENU_MAX}`}
          slotProps={{ htmlInput: { maxLength: CONTENU_MAX } }}
        />

        {!readOnly && (
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={submitting || !values.objet.trim() || habilitationInsuffisante}>
              {submitLabel}
            </Button>
            {children}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}