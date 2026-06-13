import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import db from '../../data/mockDb'
import type { Medal, Participation, Person } from '../../data/types'
import { ButtonLink, PageHeader, TablePageSkeleton } from '../../components/ui'
import { toast } from '../../components/ui/Toast'

export const MedalList: React.FC = () => {
  const [medals, setMedals] = useState<Medal[]>([])
  const [participations, setParticipations] = useState<Participation[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)

    try {
      const [meds, parts, pps] = await Promise.all([
        db.getMedals(),
        db.getParticipations(),
        db.getPeople(),
      ])

      setMedals(meds)
      setParticipations(parts)
      setPeople(pps)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar medalhas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const medalTable = people
    .map((person) => {
      const participacaoIds = participations
        .filter((p) => p.pessoaId === person.id)
        .map((p) => p.id)

      const medalhasPessoa = medals.filter((m) =>
        participacaoIds.includes(m.participacaoId)
      )

      const ouro = medalhasPessoa.filter((m) => m.tipo === 'OURO').length

      const prata = medalhasPessoa.filter((m) => m.tipo === 'PRATA').length

      const bronze = medalhasPessoa.filter((m) => m.tipo === 'BRONZE').length

      return {
        id: person.id,
        nome: person.nome,
        ouro,
        prata,
        bronze,
        total: ouro + prata + bronze,
      }
    })
    .filter((p) => p.total > 0)
    .sort((a, b) => {
      if (b.ouro !== a.ouro) return b.ouro - a.ouro
      if (b.prata !== a.prata) return b.prata - a.prata
      return b.bronze - a.bronze
    })

  if (loading) {
    return <TablePageSkeleton columns={6} rows={6} />
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Reconhecimento"
        title="Quadro de Medalhas"
        description="Ranking de medalhas dos participantes."
        actions={
          <ButtonLink
            to="/admin/medalhas/novo"
            icon={<Plus aria-hidden="true" />}
          >
            Nova medalha
          </ButtonLink>
        }
      />

      <section className="people-panel">
        <table className="participants-table">
          <thead>
            <tr>

              <th className="header-default">Posição</th>
              <th className="header-default">Participante</th>
              <th className="header-gold">Ouro</th>
              <th className="header-silver">Prata</th>
              <th className="header-bronze">Bronze</th>
              <th className="header-default">Total</th>
            </tr>
          </thead>

          <tbody>
            {medalTable.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Nenhuma medalha cadastrada.
                </td>
              </tr>
            ) : (
              medalTable.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <strong>{index + 1}º</strong>
                  </td>

                  <td>
                    <span className="participant-name">{item.nome}</span>
                  </td>

                  <td className="medal-gold">{item.ouro}</td>
                  <td className="medal-silver">{item.prata}</td>
                  <td className="medal-bronze">{item.bronze}</td>

                  <td>
                    <strong>{item.total}</strong>
                  </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default MedalList
