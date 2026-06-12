import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, CalendarDays, FileBadge, MapPin, Ticket } from 'lucide-react'
import db from '../../data/mockDb'
import type {
  CertificadoUsuarioResponse,
  MedalhaUsuarioResponse,
  ParticipacaoUsuarioResponse,
  Pessoa,
} from '../../data/types'
import { ButtonLink, Card, EmptyState, SectionHeader, StatCard, StatusBadge, UserDashboardSkeleton } from '../../components/ui'
import { toast } from '../../components/ui/Toast'

const formatDate = (date: string) => (date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : 'Data nao informada')

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<Pessoa | null>(() => db.getLoggedUser())
  const [participations, setParticipations] = useState<ParticipacaoUsuarioResponse[]>([])
  const [certificates, setCertificates] = useState<CertificadoUsuarioResponse[]>([])
  const [medals, setMedals] = useState<MedalhaUsuarioResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db.getLoggedUser()) {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (!db.getLoggedUser()) return

    setLoading(true)
    Promise.all([db.getMe(), db.getMyParticipations(), db.getMyCertificates(), db.getMyMedals()])
      .then(([me, parts, certs, mdls]) => {
        setUser(me)
        setParticipations(parts)
        setCertificates(certs)
        setMedals(mdls)
      })
      .catch((err) => toast.error(err.message || 'Erro ao carregar seu painel.'))
      .finally(() => setLoading(false))
  }, [])

  if (!user) return null
  if (loading) return <UserDashboardSkeleton />

  const userEvents = participations
    .filter((participation) => participation.evento)
    .map((participation) => ({
      participation,
      event: participation.evento!,
      certificate: certificates.find((certificate) => certificate.participacaoId === participation.id),
    }))

  return (
    <div className="user-dashboard-container mobile-stack">
      <section className="student-hero">
        <span>Area do aluno</span>
        <h1>Ola, {user.nome.split(' ')[0]}</h1>
        <p>Eventos, certificados e conquistas em um painel simples para acompanhar sua vida academica.</p>
      </section>

      <section className="student-stat-grid" aria-label="Indicadores rapidos">
        <Link to="/user/inicio">
          <StatCard label="Inscricoes" value={participations.length} icon={<Ticket />} />
        </Link>
        <Link to="/user/certificados">
          <StatCard label="Certificados" value={certificates.length} icon={<FileBadge />} tone="success" />
        </Link>
        <Link to="/user/medalhas">
          <StatCard label="Medalhas" value={medals.length} icon={<Award />} tone="accent" />
        </Link>
      </section>

      <section>
        <SectionHeader title="Meus eventos" description="Acompanhe inscricoes e certificados disponiveis." />

        {userEvents.length === 0 ? (
          <EmptyState
            title="Nenhuma inscricao ainda"
            description="Acesse a pagina de eventos para encontrar atividades abertas."
            action={
              <ButtonLink to="/eventos" size="sm">
                Ver eventos
              </ButtonLink>
            }
          />
        ) : (
          <div className="mobile-card-list">
            {userEvents.map(({ event, participation, certificate }) => (
              <Card key={participation.id} className="student-event-card">
                <div className="student-event-card__top">
                  <StatusBadge status={event.status} label={event.status.replace('_', ' ')} />
                  <span>#{participation.inscricao}</span>
                </div>
                <h2>{event.tema}</h2>
                {event.descricao && <p>{event.descricao}</p>}
                <div className="student-event-card__meta">
                  <span>
                    <CalendarDays aria-hidden="true" />
                    {formatDate(event.data)} as {event.horarioInicio}
                  </span>
                  <span>
                    <MapPin aria-hidden="true" />
                    {event.local || (event.modalidade === 'ONLINE' ? 'Online' : 'Local nao informado')}
                  </span>
                </div>
                <div className="student-event-card__actions">
                  <ButtonLink to={`/eventos/${event.id}`} variant="secondary" size="sm">
                    Detalhes
                  </ButtonLink>
                  {certificate && (
                    <ButtonLink to={`/certificados/${certificate.codigoValidacao}`} size="sm">
                      Certificado
                    </ButtonLink>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default UserDashboard
