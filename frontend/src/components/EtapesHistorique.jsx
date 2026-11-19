import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { ROLE_LABELS } from '../config/access'
import { ETAPE_STATUTS, formatDate } from '../config/documents'

export default function EtapesHistorique({ etapes }) {
  if (etapes.length === 0) return null

  return (
    <>
      <Typography variant="h6" component="h2" sx={{ mt: 4, mb: 1 }}>
        Historique des étapes
      </Typography>
      <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Rôle attendu</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Traité par</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Commentaire</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {etapes.map((e) => {
              const statut = ETAPE_STATUTS[e.statut] ?? { label: e.statut, color: 'default' }
              return (
                <TableRow key={e.id}>
                  <TableCell>{e.ordre}</TableCell>
                  <TableCell>{ROLE_LABELS[e.roleAttendu] ?? e.roleAttendu}</TableCell>
                  <TableCell>
                    <Chip size="small" label={statut.label} color={statut.color} />
                  </TableCell>
                  <TableCell>{e.validateur ?? '—'}</TableCell>
                  <TableCell>{formatDate(e.dateAction)}</TableCell>
                  <TableCell>{e.commentaire ?? '—'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}