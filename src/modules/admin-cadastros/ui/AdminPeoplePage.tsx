import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getAdminPeopleApi } from '../api/adminCatalogApi'
import type { AdminPessoa } from '../domain/adminCatalogTypes'
import { includesSearch } from '../domain/adminCatalogTypes'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Badge, Button, Input, SearchIcon } from '../../../shared/ui'
import { ordenarPor, paginar, type Direcao } from '../../../shared/lib/tabela'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/shadcn/table'
import { AdminDataSkeleton } from './AdminDataSkeleton'
import {
  AdminEmpty,
  AdminLoadError,
  AdminMetric,
  AdminSectionHeader,
} from './AdminPageParts'

const roleLabel = (role?: string) =>
  role?.toUpperCase() === 'ADMIN' ? 'Administrador' : 'Usuário'

const POR_PAGINA = 15

type ColunaOrdenavel = 'nome' | 'email' | 'role'
interface Ordem {
  coluna: ColunaOrdenavel
  direcao: Direcao
}

/** Cabeçalho que ordena ao clicar; aria-sort informa a ordem atual ao leitor de tela. */
const CabecalhoOrdenavel: React.FC<{
  rotulo: string
  coluna: ColunaOrdenavel
  ordem: Ordem
  onOrdenar: (coluna: ColunaOrdenavel) => void
}> = ({ rotulo, coluna, ordem, onOrdenar }) => {
  const ativa = ordem.coluna === coluna
  const Icone = !ativa
    ? ArrowUpDown
    : ordem.direcao === 'asc'
      ? ArrowUp
      : ArrowDown
  return (
    <TableHead
      className="px-2"
      aria-sort={
        ativa ? (ordem.direcao === 'asc' ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        onClick={() => onOrdenar(coluna)}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-sm px-2 font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
      >
        {rotulo}
        <Icone
          className={`size-3.5 ${ativa ? '' : 'opacity-50'}`}
          aria-hidden="true"
        />
      </button>
    </TableHead>
  )
}

export const AdminPeoplePage: React.FC = () => {
  const [people, setPeople] = useState<AdminPessoa[]>([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('TODOS')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [ordem, setOrdem] = useState<Ordem>({ coluna: 'nome', direcao: 'asc' })
  const [pagina, setPagina] = useState(1)

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

  const visiveis = useMemo(
    () =>
      paginar(
        // Ordenação estável: empates na coluna escolhida ficam em ordem de nome
        ordenarPor(
          ordenarPor(filtered, 'nome', 'asc'),
          ordem.coluna,
          ordem.direcao
        ),
        pagina,
        POR_PAGINA
      ),
    [filtered, ordem, pagina]
  )

  // Mesma coluna inverte a direção; outra coluna começa em ordem crescente.
  const alternarOrdem = (coluna: ColunaOrdenavel) => {
    setOrdem((atual) => ({
      coluna,
      direcao:
        atual.coluna === coluna && atual.direcao === 'asc' ? 'desc' : 'asc',
    }))
    setPagina(1)
  }

  const admins = people.filter(
    (person) => person.role?.toUpperCase() === 'ADMIN'
  ).length

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <AdminSectionHeader
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
                <h2 id="people-list-title" className="font-display text-xl">
                  Diretório completo
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {filtered.length === 1
                    ? '1 pessoa encontrada'
                    : `${filtered.length} pessoas encontradas`}
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
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPagina(1)
                    }}
                    placeholder="Buscar nome, email, CPF ou telefone"
                    className="pl-9"
                  />
                </div>
                <select
                  value={role}
                  onChange={(event) => {
                    setRole(event.target.value)
                    setPagina(1)
                  }}
                  aria-label="Filtrar por perfil"
                  className="h-10 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)]"
                >
                  <option value="TODOS">Todos os perfis</option>
                  <option value="ADMIN">Administradores</option>
                  <option value="USER">Usuários</option>
                </select>
              </div>
            </div>

            {filtered.length ? (
              <div className="rounded-md bg-[var(--color-bg-surface)]">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-[var(--color-bg-subtle)]">
                    <TableRow className="hover:bg-transparent">
                      <CabecalhoOrdenavel
                        rotulo="Nome"
                        coluna="nome"
                        ordem={ordem}
                        onOrdenar={alternarOrdem}
                      />
                      <CabecalhoOrdenavel
                        rotulo="Contato"
                        coluna="email"
                        ordem={ordem}
                        onOrdenar={alternarOrdem}
                      />
                      <TableHead className="px-4">CPF</TableHead>
                      <CabecalhoOrdenavel
                        rotulo="Perfil"
                        coluna="role"
                        ordem={ordem}
                        onOrdenar={alternarOrdem}
                      />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiveis.itens.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="px-4 py-3 font-semibold">
                          {person.nome}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="block">{person.email}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {person.telefone || 'Telefone não informado'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 tabular-nums text-xs">
                          {person.cpf || '—'}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant={
                              person.role?.toUpperCase() === 'ADMIN'
                                ? 'info'
                                : 'default'
                            }
                          >
                            {roleLabel(person.role)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <nav
                  aria-label="Páginas do diretório"
                  className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"
                >
                  <span
                    className="text-sm text-[var(--color-text-secondary)]"
                    aria-live="polite"
                  >
                    Página {visiveis.pagina} de {visiveis.totalPaginas}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={visiveis.pagina === 1}
                      onClick={() => setPagina(visiveis.pagina - 1)}
                      leftIcon={<ChevronLeft className="size-4" />}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={visiveis.pagina === visiveis.totalPaginas}
                      onClick={() => setPagina(visiveis.pagina + 1)}
                      rightIcon={<ChevronRight className="size-4" />}
                    >
                      Próxima
                    </Button>
                  </div>
                </nav>
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
