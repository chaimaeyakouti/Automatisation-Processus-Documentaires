import { Alert, Typography } from '@mui/material'

// Page provisoire : sera remplacée au fil des jours suivants
export default function ComingSoon({ title, day }) {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      <Alert severity="info">Cette page sera réalisée au jour {day}.</Alert>
    </>
  )
}
