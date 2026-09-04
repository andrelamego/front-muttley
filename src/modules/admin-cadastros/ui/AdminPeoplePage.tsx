import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getAdminPeopleApi } from '../api/adminCatalogApi'
import type { AdminPessoa } from '../domain/adminCatalogTypes'
import { includesSearch } from '../domain/adminCatalogTypes'
import { Badge, Input, SearchIcon } from '../../../shared/ui'
import { AdminDataSkeleton } from './AdminDataSkeleton'
import {
  AdminEmpty,
  AdminLoadError,
  AdminMetric,
  AdminSectionHeader,
} from './AdminPageParts'

const roleLabel = (role?: string) =>
  role?.toUpperCase() === 'ADMIN' ? 'Administrador' : 'Usuário'

export const AdminPeoplePage: React.FC = () => {
  const [people, setPeople] = useState<AdminPessoa[]>([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('TODOS')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPeople(await getAdminPeopleApi())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha inesperada na API.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    getAdminPeopleApi()
      .then((result) => {
        if (mounted) setPeople(result)
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Falha inesperada na API.'
          )
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(
    () =>
      people.filter(
        (person) =>
          (role === 'TODOS' || person.role?.toUpperCase() === role) &&
          includesSearch(
            [person.nome, person.email, person.cpf, person.telefone],
            search
          )
      ),
    [people, role, search]
  )

  const admins = people.filter(
    (person) => person.role?.toUpperCase() === 'ADMIN'
  ).length

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <AdminSectionHeader
        eyebrow="Diretório institucional"
        title="Pessoas"
        description="Consulte os usuários cadastrados e identifique os perfis com acesso administrativo."
        onRefresh={load}
      />
      {loading && people.length === 0 ? (
        <AdminDataSkeleton />
      ) : error ? (
        <AdminLoadError message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminMetric
              label="Pessoas cadastradas"
              value={people.length}
              detail="registros ativos no diretório"
            />
            <AdminMetric
              label="Administradores"
              value={admins}
              detail="perfis com acesso à gestão"
            />
            <AdminMetric
              label="Usuários"
              value={people.length - admins}
              detail="participantes da plataforma"
            />
          </div>

          <section className="space-y-4" aria-labelledby="people-list-title">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h2 id="people-list-title" className="font-serif text-xl">
                  Diretório completo
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {filtered.length} pessoa(s) encontrada(s)
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative sm:w-80">
                  <SearchIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar nome, email, CPF ou telefone"
                    className="pl-9"
                  />
                </div>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  aria-label="Filtrar por perfil"
                  className="h-10 border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)]"
                >
                  <option value="TODOS">Todos os perfis</option>
                  <option value="ADMIN">Administradores</option>
                  <option value="USER">Usuários</option>
                </select>
              </div>
            </div>

            {filtered.length ? (
              <div className="overflow-x-auto border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[var(--color-bg-subtle)] text-xs text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Contato</th>
                      <th className="px-4 py-3">CPF</th>
                      <th className="px-4 py-3">Perfil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {filtered.map((person) => (
                      <tr
                        key={person.id}
                        className="hover:bg-[var(--color-bg-subtle)]"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {person.nome}
                        </td>
                        <td className="px-4 py-3">
                          <span className="block">{person.email}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {person.telefone || 'Telefone não informado'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {person.cpf || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              person.role?.toUpperCase() === 'ADMIN'
                                ? 'info'
                                : 'default'
                            }
                          >
                            {roleLabel(person.role)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <AdminEmpty message="Nenhuma pessoa corresponde aos filtros." />
            )}
          </section>
        </>
      )}
    </div>
  )
}
