import React, { useEffect, useState } from 'react'
import { Award, Copy, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import db from '../../data/mockDb'
import type { MedalhaUsuarioResponse } from '../../data/types'
import { Button, Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

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
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (!db.getLoggedUser()) return null
  if (loading) return <LoadingState label="Carregando medalhas" />

  const filteredMedals = medals.filter(
    (medal) =>
      medal.nome.toLowerCase().includes(search.toLowerCase()) ||
      (medal.evento?.tema || '').toLowerCase().includes(search.toLowerCase()),
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
          title={search ? 'Nenhuma medalha encontrada' : 'Voce ainda nao tem medalhas'}
          description={search ? 'Tente outro termo de busca.' : 'As medalhas recebidas aparecerao aqui com o evento relacionado.'}
        />
      ) : (
        <div className="achievement-grid">
          {filteredMedals.map((medal) => {
            const eventName = medal.evento?.tema || 'Evento'

            return (
              <Card key={medal.id} className="achievement-card">
                <div className="achievement-card__mark">
                  <Award aria-hidden="true" />
                </div>
                <StatusBadge status="FINALIZADO" label={eventName} />
                <h2>{medal.nome}</h2>
                <p>{medal.descricao || 'Reconhecimento recebido por participacao academica.'}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Copy aria-hidden="true" />}
                  onClick={() => {
                    navigator.clipboard?.writeText(`Recebi a medalha "${medal.nome}" no evento ${eventName}.`)
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
