// Du moins sensible au plus sensible (même ordre que l'énumération du backend)
export const NIVEAUX = [
  { value: 'DIFFUSION_RESTREINTE', label: 'DIFFUSION_RESTREINTE', color: 'default' },
  { value: 'CONFIDENTIEL_DEFENSE', label: 'CONFIDENTIEL_DEFENSE', color: 'info' },
  { value: 'SECRET_DEFENSE', label: 'SECRET_DEFENSE', color: 'warning' },
  { value: 'TRES_SECRET_DEFENSE', label: 'TRES_SECRET_DEFENSE', color: 'error' },
]

export const TYPES = [
  { value: 'REQUISITION', label: 'Réquisition', niveauParDefaut: 'DIFFUSION_RESTREINTE' },
  { value: 'RAPPORT', label: 'Rapport', niveauParDefaut: 'TRES_SECRET_DEFENSE' },
  { value: 'NOTE_INTERNE', label: 'Note interne / correspondance', niveauParDefaut: 'SECRET_DEFENSE' },
  { value: 'CONFIDENTIEL_DIVERS', label: 'Document confidentiel divers', niveauParDefaut: 'DIFFUSION_RESTREINTE' },
]

export const STATUTS = {
  BROUILLON: { label: 'Brouillon', color: 'default' },
  SOUMIS: { label: 'Soumis', color: 'info' },
  EN_VALIDATION: { label: 'En validation', color: 'warning' },
  VALIDE: { label: 'Validé', color: 'success' },
  REJETE: { label: 'Rejeté', color: 'error' },
  ARCHIVE: { label: 'Archivé', color: 'secondary' },
}

export function typeLabel(value) {
  return TYPES.find((t) => t.value === value)?.label ?? value
}

export function niveauParDefaut(type) {
  return TYPES.find((t) => t.value === type)?.niveauParDefaut ?? 'INTERNE'
}

// Niveaux proposés pour un type : du niveau par défaut jusqu'à SECRET
export function niveauxAutorises(type) {
  const minimum = NIVEAUX.findIndex((n) => n.value === niveauParDefaut(type))
  return NIVEAUX.slice(minimum)
}

export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString('fr-FR') : '—'
}