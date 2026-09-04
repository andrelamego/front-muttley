import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { ParticipantLayout } from '../layouts/ParticipantLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'

import { LoginPage } from '../../modules/auth'
import {
  LandingPage,
  PublicEventListPage,
  PublicEventDetailPage,
  ConfirmarPresencaPage,
  PARTICIPANT_EVENTS_PATH,
} from '../../modules/eventos'
import {
  ParticipantDashboardPage,
  AdminDashboardPage,
} from '../../modules/painel'
import {
  PublicCertificateViewPage,
  UserCertificatesPage,
} from '../../modules/certificados'
import { UserMedalsPage } from '../../modules/medalhas'
import {
  AdminEventListPage,
  AdminEventFormPage,
  AdminEventConcludePage,
} from '../../modules/admin-eventos'
import {
  AdminCatalogsPage,
  AdminCertificatesPage,
  AdminPeoplePage,
} from '../../modules/admin-cadastros'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/eventos" element={<PublicEventListPage />} />
        <Route path="/eventos/:id" element={<PublicEventDetailPage />} />
        <Route
          path="/eventos/:id/confirmar-presenca"
          element={<ConfirmarPresencaPage />}
        />
        <Route
          path="/certificados/:codigo"
          element={<PublicCertificateViewPage />}
        />
      </Route>

      {/* Rota de Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas do Participante (Mobile-First) */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <ParticipantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="inicio" element={<ParticipantDashboardPage />} />
        <Route
          path="eventos"
          element={
            <PublicEventListPage
              eventRouteBase={PARTICIPANT_EVENTS_PATH}
              participantView
            />
          }
        />
        <Route
          path="eventos/:id"
          element={
            <PublicEventDetailPage eventRouteBase={PARTICIPANT_EVENTS_PATH} />
          }
        />
        <Route
          path="eventos/:id/confirmar-presenca"
          element={
            <ConfirmarPresencaPage eventRouteBase={PARTICIPANT_EVENTS_PATH} />
          }
        />
        <Route path="certificados" element={<UserCertificatesPage />} />
        <Route path="medalhas" element={<UserMedalsPage />} />
      </Route>

      {/* Rotas Administrativas (Desktop-First) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="inicio" element={<AdminDashboardPage />} />
        <Route path="eventos" element={<AdminEventListPage />} />
        <Route path="eventos/novo" element={<AdminEventFormPage />} />
        <Route path="eventos/:id/editar" element={<AdminEventFormPage />} />
        <Route
          path="eventos/:id/concluir"
          element={<AdminEventConcludePage />}
        />
        <Route path="certificados" element={<AdminCertificatesPage />} />
        <Route path="pessoas" element={<AdminPeoplePage />} />
        <Route path="cadastros" element={<AdminCatalogsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
