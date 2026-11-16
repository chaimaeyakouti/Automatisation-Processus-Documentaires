import DashboardIcon from '@mui/icons-material/Dashboard'
import DescriptionIcon from '@mui/icons-material/Description'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import HistoryIcon from '@mui/icons-material/History'
import { ACCESS } from './access'

// roles: null = visible par tous les utilisateurs connectés
export const MENU = [
  { label: 'Tableau de bord', path: '/tableau-de-bord', icon: DashboardIcon, roles: null },
  { label: 'Documents', path: '/documents', icon: DescriptionIcon, roles: null },
  { label: 'Nouveau document', path: '/documents/nouveau', icon: NoteAddIcon, roles: ACCESS.nouveauDocument },
  { label: 'À traiter', path: '/a-traiter', icon: FactCheckIcon, roles: ACCESS.aTraiter },
  { label: "Journal d'audit", path: '/audit', icon: HistoryIcon, roles: ACCESS.audit },
]
