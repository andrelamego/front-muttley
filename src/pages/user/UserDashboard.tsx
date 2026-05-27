import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, CalendarDays, FileBadge, MapPin, Ticket } from 'lucide-react'
import db from '../../data/mockDb'
import type { Certificate, Event, Local, Medal, Participation } from '../../data/types'
import { Button, ButtonLink, Card, EmptyState, LoadingState, SectionHeader, StatCard, StatusBadge } from '../../components/ui'

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate()
  const loggedUser = db.getLoggedUser()

  const [participations, setParticipations] = useState<Participation[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [locations, setLocations] = useState<Local[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [medals, setMedals] = useState<Medal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loggedUser) {
      navigate('/login')
    }
  }, [loggedUser, navigate])

  const loadData = () => {
    if (!loggedUser) return

    setLoading(true)
    Promise.all([db.getParticipations(), db.getEvents(), db.getLocais(), db.getCertificates(), db.getMedals()])
      .then(([parts, evts, locs, certs, mdls]) => {
        const userParts = parts.filter((p) => p.pessoaId === loggedUser.id)
        setParticipations(userParts)
        setEvents(evts)
        setLocations(locs)
        setCertificates(certs.filter((c) => userParts.some((p) => p.id === c.participacaoId)))
        setMedals(mdls.filter((m) => userParts.some((p) => p.id === m.participacaoId)))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  if (!loggedUser) return null
  if (loading) return <LoadingState label="Carregando seu painel" />

  const userEvents = events
    .filter((event) => participations.some((participation) => participation.eventoId === event.id))
    .map((event) => {
      const participation = participations.find((item) => item.eventoId === event.id)
      const location = locations.find((item) => item.id === event.localId)
      const certificate = participation ? certificates.find((item) => item.participacaoId === participation.id) : null
      return { ...event, participation, location, certificate }
    })

  const availableEvents = events
    .filter((event) => event.status === 'EM_ANDAMENTO' && !participations.some((participation) => participation.eventoId === event.id))
    .map((event) => ({ ...event, location: locations.find((item) => item.id === event.localId) }))

  const handleRegisterEvent = async (eventId: string) => {
    await db.saveParticipation({
      eventoId: eventId,
      pessoaId: loggedUser.id,
      tipo: 'Aluno',
    })
    loadData()
  }

  return (
    <div className="user-dashboard-container mobile-stack">
      <section className="student-hero">
        <span>Area do aluno</span>
        <h1>Ola, {loggedUser.nome.split(' ')[0]}</h1>
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
            description="Escolha um evento disponivel abaixo para iniciar sua participacao."
          />
        ) : (
          <div className="mobile-card-list">
            {userEvents.map((event) => {
              const formattedDate = new Date(event.data).toLocaleDateString('pt-BR')
              const isClosed = event.status === 'FINALIZADO'
              const isPresent = event.participation?.presente

              return (
                <Card key={event.id} className="student-event-card">
                  <div className="student-event-card__top">
                    <StatusBadge
                      status={isClosed ? (isPresent ? 'PRESENTE' : 'AUSENTE') : 'INSCRITO'}
                      label={isClosed ? (isPresent ? 'Presenca confirmada' : 'Ausente') : 'Inscrito'}
                    />
                    <span>#{event.participation?.inscricao}</span>
                  </div>
                  <h2>{event.tema}</h2>
                  <div className="student-event-card__meta">
                    <span>
                      <CalendarDays aria-hidden="true" />
                      {formattedDate} as {event.horarioInicio}
                    </span>
                    <span>
                      <MapPin aria-hidden="true" />
                      {event.location?.nome || 'Online'}
                    </span>
                  </div>
                  <div className="student-event-card__actions">
                    <ButtonLink to={`/user/evento/${event.id}`} variant="secondary" size="sm">
                      Detalhes
                    </ButtonLink>
                    {isClosed && isPresent && event.certificate && (
                      <ButtonLink to={`/certificados/${event.certificate.codigoValidacao}`} size="sm">
                        Certificado
                      </ButtonLink>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Eventos disponiveis" description="Inscricoes abertas para novas atividades." />

        {availableEvents.length === 0 ? (
          <EmptyState title="Nenhum evento aberto" description="Novas atividades aparecem aqui quando forem publicadas." />
        ) : (
          <div className="mobile-card-list">
            {availableEvents.map((event) => (
              <Card key={event.id} className="student-event-card">
                <div className="student-event-card__top">
                  <StatusBadge status="DISPONIVEL" label="Inscricoes abertas" />
                </div>
                <h2>{event.tema}</h2>
                <p>{event.descricao}</p>
                <div className="student-event-card__meta">
                  <span>
                    <CalendarDays aria-hidden="true" />
                    {new Date(event.data).toLocaleDateString('pt-BR')} as {event.horarioInicio}
                  </span>
                  <span>
                    <MapPin aria-hidden="true" />
                    {event.location?.nome || 'Online'}
                  </span>
                </div>
                <div className="student-event-card__actions">
                  <ButtonLink to={`/user/evento/${event.id}`} variant="secondary" size="sm">
                    Ver detalhes
                  </ButtonLink>
                  <Button onClick={() => handleRegisterEvent(event.id)} size="sm">
                    Inscrever-se
                  </Button>
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
