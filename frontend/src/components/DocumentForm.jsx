import { useState } from 'react'
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material'
import { TYPES, niveauParDefaut, niveauxAutorises } from '../config/documents'

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
  const [values, setValues] = useState(initial)
  const niveaux = niveauxAutorises(values.type)

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
          value={values.niveau}
          onChange={handleChange('niveau')}
          disabled={readOnly}
          fullWidth
          helperText="Il ne peut pas être inférieur au niveau défini pour ce type de document."
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
            <Button type="submit" variant="contained" disabled={submitting || !values.objet.trim()}>
              {submitLabel}
            </Button>
            {children}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}