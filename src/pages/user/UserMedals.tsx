import React, { useEffect, useState } from 'react'
import { Award, Copy, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import db from '../../data/mockDb'
import type { MedalhaUsuarioResponse } from '../../data/types'
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  StatusBadge,
  UserMedalsSkeleton,
} from '../../components/ui'
import { toast } from '../../components/ui/Toast'

export const UserMedals: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
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
    Promise.all([db.getMe(), db.getMyMedals()])
      .then(([, mdls]) => setMedals(mdls))
      .catch((err) => toast.error(err.message || 'Erro ao carregar medalhas.'))
      .finally(() => setLoading(false))
  }, [])

  if (!db.getLoggedUser()) return null
  if (loading) return <UserMedalsSkeleton />

  const filteredMedals = medals.filter(
    (medal) =>
      medal.nome.toLowerCase().includes(search.toLowerCase()) ||
      medal.tipo.toLowerCase().includes(search.toLowerCase()) ||
      (medal.evento?.tema || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="user-medals-container mobile-stack">
      <PageHeader
        eyebrow="Reconhecimento"
        title="Minhas medalhas"
        description="Conquistas academicas e tecnicas recebidas em eventos da FATEC Zona Leste."
        compact
      />

      <label className="mobile-search">
        <Search aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar por medalha ou evento"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {filteredMedals.length === 0 ? (
        <EmptyState
          title={
            search
              ? 'Nenhuma medalha encontrada'
              : 'Voce ainda nao tem medalhas'
          }
          description={
            search
              ? 'Tente outro termo de busca.'
              : 'As medalhas recebidas aparecerao aqui com o evento relacionado.'
          }
        />
      ) : (
        <div className="achievement-grid">
          {filteredMedals.map((medal) => {
            const eventName = medal.evento?.tema || 'Evento'

            return (
              <Card
                key={medal.id}
                className={`achievement-card achievement-card--${medal.tipo.toLowerCase()}`}
              >
                <div className="achievement-card__header">
                  <div className="achievement-card__mark">
                    <Award aria-hidden="true" />
                  </div>
                  <span
                    className={`medal-type-badge medal-type-badge--${medal.tipo.toLowerCase()}`}
                  >
                    {medal.tipo}
                  </span>
                </div>
                <StatusBadge status="FINALIZADO" label={eventName} />
                <h2>{medal.nome}</h2>
                <p>
                  {medal.descricao ||
                    'Reconhecimento recebido por participacao academica.'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Copy aria-hidden="true" />}
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `Recebi a medalha ${medal.tipo.toLowerCase()} "${medal.nome}" no evento ${eventName}.`
                    )
                  }}
                >
                  Copiar conquista
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserMedals
