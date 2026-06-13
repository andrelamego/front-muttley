import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom'
import Layout from './components/Layout'

// Public Pages
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import CertificateView from './pages/public/CertificateView'
import PublicEventList from './pages/public/PublicEventList'
import PublicEventDetail from './pages/public/PublicEventDetail'
import ConfirmarPresenca from './pages/public/ConfirmarPresenca'

// User Pages
import UserDashboard from './pages/user/UserDashboard'
import UserCertificates from './pages/user/UserCertificates'
import UserMedals from './pages/user/UserMedals'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import EventList from './pages/admin/EventList'
import EventForm from './pages/admin/EventForm'
import EventConclude from './pages/admin/EventConclude'
import MedalList from './pages/admin/MedalList'
import MedalForm from './pages/admin/MedalForm'
import CertificateList from './pages/admin/CertificateList'
import LocalList from './pages/admin/LocalList'
import LocalForm from './pages/admin/LocalForm'
import AddressForm from './pages/admin/AddressForm'
import ParticipantList from './pages/admin/ParticipantList'
import DisciplineList from './pages/admin/DisciplineList'
import DisciplineForm from './pages/admin/DisciplineForm'

const UserEventRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={id ? `/eventos/${id}` : '/eventos'} replace />
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public events home */}
        <Route
          path="/"
          element={
            <Layout>
              <PublicEventList />
            </Layout>
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/eventos"
          element={
            <Layout>
              <PublicEventList />
            </Layout>
          }
        />
        <Route
          path="/eventos/:id"
          element={
            <Layout>
              <PublicEventDetail />
            </Layout>
          }
        />
        <Route path="/certificados/:codigo" element={<CertificateView />} />
        <Route
          path="/eventos/:id/confirmar-presenca"
          element={<ConfirmarPresenca />}
        />

        {/* User Routes */}
        <Route
          path="/user/inicio"
          element={
            <Layout>
              <UserDashboard />
            </Layout>
          }
        />
        <Route
          path="/user/certificados"
          element={
            <Layout>
              <UserCertificates />
            </Layout>
          }
        />
        <Route
          path="/user/medalhas"
          element={
            <Layout>
              <UserMedals />
            </Layout>
          }
        />
        <Route
          path="/user/evento/:id"
          element={
            <Layout>
              <UserEventRedirect />
            </Layout>
          }
        />

        {/* Admin Routes with Header & Footer Layout */}
        <Route
          path="/admin/inicio"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/admin/eventos"
          element={
            <Layout>
              <EventList />
            </Layout>
          }
        />
        <Route
          path="/admin/eventos/novo"
          element={
            <Layout>
              <EventForm />
            </Layout>
          }
        />
        <Route
          path="/admin/eventos/editar/:id"
          element={
            <Layout>
              <EventForm />
            </Layout>
          }
        />
        <Route
          path="/admin/eventos/concluir/:id"
          element={
            <Layout>
              <EventConclude />
            </Layout>
          }
        />
        <Route
          path="/admin/medalhas"
          element={
            <Layout>
              <MedalList />
            </Layout>
          }
        />
        <Route
          path="/admin/medalhas/novo"
          element={
            <Layout>
              <MedalForm />
            </Layout>
          }
        />
        <Route
          path="/admin/medalhas/editar/:id"
          element={
            <Layout>
              <MedalForm />
            </Layout>
          }
        />
        <Route
          path="/admin/certificados"
          element={
            <Layout>
              <CertificateList />
            </Layout>
          }
        />
        <Route
          path="/admin/locais"
          element={
            <Layout>
              <LocalList />
            </Layout>
          }
        />
        <Route
          path="/admin/locais/novo"
          element={
            <Layout>
              <LocalForm />
            </Layout>
          }
        />
        <Route
          path="/admin/locais/editar/:id"
          element={
            <Layout>
              <LocalForm />
            </Layout>
          }
        />
        <Route
          path="/admin/locais/enderecos/novo"
          element={
            <Layout>
              <AddressForm />
            </Layout>
          }
        />
        <Route
          path="/admin/locais/enderecos/editar/:id"
          element={
            <Layout>
              <AddressForm />
            </Layout>
          }
        />
        <Route
          path="/admin/participantes"
          element={
            <Layout>
              <ParticipantList />
            </Layout>
          }
        />
        <Route
          path="/admin/disciplinas"
          element={
            <Layout>
              <DisciplineList />
            </Layout>
          }
        />
        <Route
          path="/admin/disciplinas/novo"
          element={
            <Layout>
              <DisciplineForm />
            </Layout>
          }
        />
        <Route
          path="/admin/disciplinas/editar/:id"
          element={
            <Layout>
              <DisciplineForm />
            </Layout>
          }
        />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
