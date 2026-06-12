import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, Search, ShieldCheck } from 'lucide-react'
import db from '../../data/mockDb'
import type { CertificadoUsuarioResponse } from '../../data/types'
import { ButtonAnchor, ButtonLink, Card, EmptyState, PageHeader, StatusBadge, UserCertificatesSkeleton } from '../../components/ui'
import { toast } from '../../components/ui/Toast'

const formatDate = (date: string) => (date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : 'Data nao informada')

export const UserCertificates: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [certificates, setCertificates] = useState<CertificadoUsuarioResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db.getLoggedUser()) {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    if (!db.getLoggedUser()) return

    setLoading(true)
    Promise.all([db.getMe(), db.getMyCertificates()])
      .then(([, certs]) => setCertificates(certs))
      .catch((err) => toast.error(err.message || 'Erro ao carregar certificados.'))
      .finally(() => setLoading(false))
  }, [])

  if (!db.getLoggedUser()) return null
  if (loading) return <UserCertificatesSkeleton />

  const filteredCerts = certificates.filter((cert) =>
    (cert.evento?.tema || 'Certificado Muttley').toLowerCase().includes(search.toLowerCase()),
  )

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
            const issueDate = cert.dataEmissao ? new Date(`${cert.dataEmissao}T00:00:00`) : null
            const issueYear = issueDate?.getFullYear()
            const issueMonth = issueDate ? issueDate.getMonth() + 1 : undefined
            const eventName = cert.evento?.tema || 'Certificado Muttley'
            const certUrl = window.location.origin + `/certificados/${cert.codigoValidacao}`
            const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
              eventName,
            )}&organizationName=${encodeURIComponent('FATEC Zona Leste')}${
              issueYear ? `&issueYear=${issueYear}&issueMonth=${issueMonth}` : ''
            }&certUrl=${encodeURIComponent(certUrl)}&certId=${cert.codigoValidacao}`

            return (
              <Card key={cert.id} className="student-record-card">
                <div className="student-record-card__top">
                  <StatusBadge status="VALID" label={`Certificado de ${cert.tipoParticipacao || 'Participacao'}`} />
                  <ShieldCheck aria-hidden="true" />
                </div>

                <div className="student-record-card__body">
                  <h2>{eventName}</h2>
                  <dl>
                    <div>
                      <dt>Emissao</dt>
                      <dd>{formatDate(cert.dataEmissao)}</dd>
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
