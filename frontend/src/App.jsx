import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import { ACCESS } from './config/access'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ForbiddenPage from './pages/ForbiddenPage'
import ComingSoon from './pages/ComingSoon'
import DocumentsPage from './pages/DocumentsPage'
import NouveauDocumentPage from './pages/NouveauDocumentPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Tout ce qui est dessous exige d'être connecté */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/tableau-de-bord" replace />} />
          <Route path="tableau-de-bord" element={<DashboardPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="acces-refuse" element={<ForbiddenPage />} />

          {/* Pages réservées à certains rôles */}
          <Route element={<ProtectedRoute roles={ACCESS.nouveauDocument} />}>
            <Route path="documents/nouveau" element={<NouveauDocumentPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.aTraiter} />}>
            <Route path="a-traiter" element={<ComingSoon title="Documents à traiter" day={6} />} />
          </Route>
          <Route element={<ProtectedRoute roles={ACCESS.audit} />}>
            <Route path="audit" element={<ComingSoon title="Journal d'audit" day={8} />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
