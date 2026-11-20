import { ROLE_LABELS } from './access'
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

// Niveaux proposés pour un type : du niveau par défaut jusqu'à l'habilitation de la personne
export function niveauxAutorises(type, habilitation) {
  const minimum = NIVEAUX.findIndex((n) => n.value === niveauParDefaut(type))
  const maximum = NIVEAUX.findIndex((n) => n.value === habilitation)
  return NIVEAUX.slice(minimum, maximum + 1)
}

export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString('fr-FR') : '—'
}

export const ETAPE_STATUTS = {
  EN_ATTENTE: { label: 'En attente', color: 'default' },
  APPROUVEE: { label: 'Approuvée', color: 'success' },
  REJETEE: { label: 'Refusée', color: 'error' },
}

// Mêmes circuits que domain/Circuits.java (affichage seulement : c'est le serveur qui décide)
const CIRCUITS = {
  REQUISITION: ['VALIDATEUR'],
  RAPPORT: ['RELECTEUR', 'VALIDATEUR'],
  NOTE_INTERNE: ['VALIDATEUR'],
  CONFIDENTIEL_DIVERS: ['VALIDATEUR'],
}

export function circuitLabel(type) {
  const roles = CIRCUITS[type] ?? []
  return ['Rédacteur', ...roles.map((r) => ROLE_LABELS[r])].join(' → ')
}

// Statut dans lequel un document attend la décision de ce rôle
export function statutAttendu(role) {
  return { RELECTEUR: 'SOUMIS', VALIDATEUR: 'EN_VALIDATION' }[role] ?? null
}