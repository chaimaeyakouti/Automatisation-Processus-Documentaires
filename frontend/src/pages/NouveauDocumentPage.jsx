import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Card, CardContent, Typography } from '@mui/material'
import { apiFetch } from '../api/client'
import DocumentForm from '../components/DocumentForm'
import { niveauParDefaut } from '../config/documents'

const INITIAL = {
  type: 'REQUISITION',
  objet: '',
  niveau: niveauParDefaut('REQUISITION'),
  contenu: '',
}

export default function NouveauDocumentPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values) => {
    setError('')
    setSubmitting(true)
    try {
      const doc = await apiFetch('/documents', { method: 'POST', body: values })
      navigate(`/documents/${doc.id}`, {
        state: { flash: `Brouillon ${doc.reference} enregistré.` },
      })
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Nouveau document
      </Typography>
      <Card sx={{ maxWidth: 800 }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <DocumentForm initial={INITIAL} submitting={submitting} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </>
  )
}