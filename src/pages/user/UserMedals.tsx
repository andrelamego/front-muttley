import React, { useEffect, useState } from 'react'
import { Award, Copy, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import db from '../../data/mockDb'
import type { Event, Medal, Participation } from '../../data/types'
import { Button, Card, EmptyState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export const UserMedals: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const loggedUser = db.getLoggedUser()

  const [participations, setParticipations] = useState<Participation[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [medals, setMedals] = useState<Medal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loggedUser) {
      navigate('/login')
    }
  }, [loggedUser, navigate])

  useEffect(() => {
    if (!loggedUser) return

    setLoading(true)
    Promise.all([db.getParticipations(), db.getEvents(), db.getMedals()])
      .then(([parts, evts, mdls]) => {
        const userParts = parts.filter((p) => p.pessoaId === loggedUser.id)
        setParticipations(userParts)
        setEvents(evts)
        setMedals(mdls.filter((m) => userParts.some((p) => p.id === m.participacaoId)))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (!loggedUser) return null
  if (loading) return <LoadingState label="Carregando medalhas" />

  const userMedals = medals.map((medal) => {
    const participation = participations.find((p) => p.id === medal.participacaoId)
    const event = participation ? events.find((e) => e.id === participation.eventoId) : null
    return { ...medal, event }
  })

  const filteredMedals = userMedals.filter(
    (medal) =>
      medal.nome.toLowerCase().includes(search.toLowerCase()) ||
      medal.event?.tema.toLowerCase().includes(search.toLowerCase()),
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
          {filteredMedals.map((medal) => (
            <Card key={medal.id} className="achievement-card">
              <div className="achievement-card__mark">
                <Award aria-hidden="true" />
              </div>
              <StatusBadge status="FINALIZADO" label={medal.event?.tema || 'Evento'} />
              <h2>{medal.nome}</h2>
              <p>{medal.descricao}</p>
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy aria-hidden="true" />}
                onClick={() => {
                  navigator.clipboard?.writeText(`Recebi a medalha "${medal.nome}" no evento ${medal.event?.tema || 'Muttley'}.`)
                }}
              >
                Copiar conquista
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserMedals
