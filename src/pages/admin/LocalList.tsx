import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import db from '../../data/mockDb'
import type { Local, Address } from '../../data/types'
import { ButtonLink, PageHeader, TablePageSkeleton } from '../../components/ui'
import { toast } from '../../components/ui/Toast'

export const LocalList: React.FC = () => {
  const [locais, setLocais] = useState<Local[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setLoading(true)
    Promise.all([db.getLocais(), db.getAddresses()])
      .then(([locs, addrs]) => {
        setLocais(locs)
        setAddresses(addrs)
      })
      .catch((err) => toast.error(err.message || 'Erro ao carregar locais.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteLocal = async (id: string) => {
    if (window.confirm('Excluir este local?')) {
      try {
        await db.deleteLocal(id)
        setLocais((prev) => prev.filter((l) => l.id !== id))
        toast.success('Local excluído com sucesso.')
      } catch (err: any) {
        toast.error(err.message || 'Erro ao excluir local.')
      }
    }
  }

  const handleDeleteAddress = async (id: string) => {
    // Check if address is in use
    const isUsed = locais.some((l) => l.enderecoId === id)
    if (isUsed) {
      toast.warning(
        'Não é possível excluir este endereço pois ele está vinculado a um local.'
      )
      return
    }

    if (window.confirm('Excluir este endereço?')) {
      try {
        await db.deleteAddress(id)
        setAddresses((prev) => prev.filter((a) => a.id !== id))
        toast.success('Endereço excluído com sucesso.')
      } catch (err: any) {
        toast.error(err.message || 'Erro ao excluir endereço.')
      }
    }
  }

  const getAddressString = (addrId: string) => {
    const addr = addresses.find((a) => a.id === addrId)
    return addr ? `${addr.logradouro}, ${addr.numero} - ${addr.cidade}` : '-'
  }

  if (loading) {
    return <TablePageSkeleton columns={5} rows={5} />
  }

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Infraestrutura"
        title="Locais"
        description="Gerencie salas, auditorios, capacidade e enderecos usados nos eventos."
        actions={
          <ButtonLink
            to="/admin/locais/novo"
            icon={<Plus aria-hidden="true" />}
          >
            Novo local
          </ButtonLink>
        }
      />

      <section className="people-panel mb-8">
        <table className="participants-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Capacidade</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {locais.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  Nenhum local cadastrado.
                </td>
              </tr>
            ) : (
              locais.map((l) => (
                <tr key={l.id}>
                  <td>{l.nome}</td>
                  <td>{l.descricao}</td>
                  <td>{l.capacidade}</td>
                  <td>{getAddressString(l.enderecoId)}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="table-action"
                        to={`/admin/locais/editar/${l.id}`}
                      >
                        Editar
                      </Link>
                      <button
                        className="table-action danger"
                        onClick={() => handleDeleteLocal(l.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section
        className="participants-section mt-12"
        aria-labelledby="enderecos-title"
      >
        <div className="participants-heading flex items-center justify-between mb-4">
          <h2
            id="enderecos-title"
            className="text-lg font-bold text-brand-ink-strong"
          >
            Endereços
          </h2>
          <Link className="new-event-button" to="/admin/locais/enderecos/novo">
            Novo endereço
          </Link>
        </div>

        <div className="people-panel">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Logradouro</th>
                <th>Número</th>
                <th>Bairro</th>
                <th>Cidade</th>
                <th>Estado</th>
                <th>Complemento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {addresses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    Nenhum endereço cadastrado.
                  </td>
                </tr>
              ) : (
                addresses.map((a) => (
                  <tr key={a.id}>
                    <td>{a.logradouro}</td>
                    <td>{a.numero}</td>
                    <td>{a.bairro}</td>
                    <td>{a.cidade}</td>
                    <td>{a.estado}</td>
                    <td>{a.complemento || '-'}</td>
                    <td>
                      <div className="table-actions">
                        <Link
                          className="table-action"
                          to={`/admin/locais/enderecos/editar/${a.id}`}
                        >
                          Editar
                        </Link>
                        <button
                          className="table-action danger"
                          onClick={() => handleDeleteAddress(a.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default LocalList
