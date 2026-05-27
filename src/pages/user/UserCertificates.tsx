import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, Search, ShieldCheck } from 'lucide-react'
import db from '../../data/mockDb'
import type { Certificate, Event, Participation } from '../../data/types'
import { ButtonAnchor, ButtonLink, Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export const UserCertificates: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const loggedUser = db.getLoggedUser()

  const [participations, setParticipations] = useState<Participation[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loggedUser) {
      navigate('/login')
    }
  }, [loggedUser, navigate])

  useEffect(() => {
    if (!loggedUser) return

    setLoading(true)
    Promise.all([db.getParticipations(), db.getEvents(), db.getCertificates()])
      .then(([parts, evts, certs]) => {
        const userParts = parts.filter((p) => p.pessoaId === loggedUser.id)
        setParticipations(userParts)
        setEvents(evts)
        setCertificates(certs.filter((c) => userParts.some((p) => p.id === c.participacaoId)))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (!loggedUser) return null
  if (loading) return <LoadingState label="Carregando certificados" />

  const userCerts = certificates.map((cert) => {
    const participation = participations.find((p) => p.id === cert.participacaoId)
    const event = participation ? events.find((e) => e.id === participation.eventoId) : null
    return { ...cert, event, participation }
  })

  const filteredCerts = userCerts.filter((cert) => cert.event?.tema.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="user-certs-container mobile-stack">
      <PageHeader
        eyebrow="Area do aluno"
        title="Meus certificados"
        description="Comprovantes oficiais emitidos apos presenca e conclusao das atividades."
        compact
      />

      <label className="mobile-search">
        <Search aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar por evento"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {filteredCerts.length === 0 ? (
        <EmptyState
          title={search ? 'Nenhum certificado encontrado' : 'Voce ainda nao tem certificados'}
          description={search ? 'Tente buscar por outro nome de evento.' : 'Quando um evento for concluido, seus certificados aparecem aqui.'}
        />
      ) : (
        <div className="mobile-card-list">
          {filteredCerts.map((cert) => {
            const issueDate = new Date(cert.dataEmissao)
            const formattedIssueDate = issueDate.toLocaleDateString('pt-BR')
            const issueYear = issueDate.getFullYear()
            const issueMonth = issueDate.getMonth() + 1
            const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
              cert.event?.tema || 'Certificado Muttley',
            )}&organizationName=${encodeURIComponent('FATEC Zona Leste')}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
              window.location.origin + `/certificados/${cert.codigoValidacao}`,
            )}&certId=${cert.codigoValidacao}`

            return (
              <Card key={cert.id} className="student-record-card">
                <div className="student-record-card__top">
                  <StatusBadge status="VALID" label={`Certificado de ${cert.participation?.tipo || 'Participacao'}`} />
                  <ShieldCheck aria-hidden="true" />
                </div>

                <div className="student-record-card__body">
                  <h2>{cert.event?.tema || 'Evento'}</h2>
                  <dl>
                    <div>
                      <dt>Emissao</dt>
                      <dd>{formattedIssueDate}</dd>
                    </div>
                    <div>
                      <dt>Codigo</dt>
                      <dd className="record-code">{cert.codigoValidacao}</dd>
                    </div>
                  </dl>
                </div>

                <div className="student-record-card__actions">
                  <ButtonLink to={`/certificados/${cert.codigoValidacao}`} size="sm">
                    Visualizar
                  </ButtonLink>
                  <ButtonAnchor href={linkedinUrl} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm" icon={<ExternalLink />}>
                    LinkedIn
                  </ButtonAnchor>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Link className="mobile-subtle-link" to="/user/inicio">
        Voltar ao inicio
      </Link>
    </div>
  )
}

export default UserCertificates
