// Source unique des droits d'accès côté interface.
// Attention : ceci ne sert qu'à masquer ce qui est inutile. La vraie sécurité
// est appliquée par le backend (jours suivants).
export const ACCESS = {
  nouveauDocument: ['REDACTEUR'],
  aTraiter: ['RELECTEUR', 'VALIDATEUR'],
  audit: ['ADMIN'],
}

export const ROLE_LABELS = {
  REDACTEUR: 'Agent rédacteur',
  RELECTEUR: 'Relecteur',
  VALIDATEUR: 'Validateur hiérarchique',
  ADMIN: 'Administrateur',
}
