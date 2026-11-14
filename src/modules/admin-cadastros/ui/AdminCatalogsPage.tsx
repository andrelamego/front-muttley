import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  excluirCadastroApi,
  getAdminCatalogsApi,
  getProfessoresApi,
  salvarCadastroApi,
} from '../api/adminCatalogApi'
import {
  CAMPOS_CADASTRO,
  NOME_CADASTRO,
  paraPayload,
  valoresDe,
  type OpcaoCampo,
  type TipoCadastro,
} from '../domain/formularios'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { paginar } from '../../../shared/lib/tabela'
import { FormularioDialog } from './FormularioDialog'
import { ConfirmarExclusao } from './ConfirmarExclusao'
import { AcoesRegistro } from './AcoesRegistro'
import type {
  AdminCatalogKey,
  AdminCatalogsData,
} from '../domain/adminCatalogTypes'
import { includesSearch } from '../domain/adminCatalogTypes'
import {
  Button,
  FiltroSegmentado,
  Input,
  SearchIcon,
  toast,
} from '../../../shared/ui'
import { AdminDataSkeleton } from './AdminDataSkeleton'
import {
  AdminEmpty,
  AdminLoadError,
  AdminMetric,
  AdminSectionHeader,
} from './AdminPageParts'

const tabs: Array<{ key: AdminCatalogKey; label: string }> = [
  { key: 'disciplinas', label: 'Disciplinas' },
  { key: 'locais', label: 'Locais' },
  { key: 'patrocinadores', label: 'Patrocinadores' },
  { key: 'enderecos', label: 'Endereços' },
  { key: 'medalhas', label: 'Medalhas' },
]

type Registro = { id: number } & Record<string, unknown>

// Medalhas são concedidas pela conclusão dos eventos; aqui só se consultam.
// Medalhas passam de 200 cartões; a paginação mantém a página leve e navegável.
const POR_PAGINA = 24

const editavel = (chave: AdminCatalogKey): chave is TipoCadastro =>
  chave !== 'medalhas'

const descreverEndereco = (e: Record<string, unknown>) =>
  `${e.logradouro || 'Sem logradouro'}, ${e.numero || 's/n'} – ${e.bairro || 'sem bairro'}`

const recordText = (record: object): string[] =>
  Object.values(record).flatMap((value) => {
    if (value === null || value === undefined) return []
    if (typeof value === 'object') return recordText(value as object)
    return [String(value)]
  })

const getRecordPresentation = (
  key: AdminCatalogKey,
  record: Record<string, unknown>
) => {
  if (key === 'enderecos') {
    return {
      title: `${record.logradouro || 'Logradouro não informado'}, ${record.numero || 's/n'}`,
      meta: `${record.bairro || 'Bairro não informado'} • ${record.cidade || 'Cidade não informada'} / ${record.estado || 'UF'}`,
      detail: String(record.complemento || 'Sem complemento'),
    }
  }
  if (key === 'locais') {
    return {
      title: String(record.nome || 'Local sem nome'),
      meta: `Capacidade: ${record.capacidade ?? 'não informada'}`,
      detail: String(record.descricao || 'Sem descrição'),
    }
  }
  if (key === 'disciplinas') {
    const professor = record.professor as { nome?: string } | undefined
    return {
      title: String(record.nome || 'Disciplina sem nome'),
      meta: `${record.turno || 'Turno não informado'} • ${professor?.nome || 'Professor não informado'}`,
      detail: String(record.descricao || 'Sem descrição'),
    }
  }
  if (key === 'patrocinadores') {
    return {
      title: String(record.nome || 'Patrocinador sem nome'),
      meta: String(record.email || record.site || 'Contato não informado'),
      detail: `CNPJ: ${record.cnpj || 'não informado'}`,
    }
  }
  return {
    title: String(record.nome || 'Medalha sem nome'),
    meta: String(record.tipo || 'Tipo não informado'),
    detail: String(record.descricao || 'Sem descrição'),
  }
}

export const AdminCatalogsPage: React.FC = () => {
  const [data, setData] = useState<AdminCatalogsData | null>(null)
  const [active, setActive] = useState<AdminCatalogKey>('disciplinas')
  const [search, setSearch] = useState('')
  const [pagina, setPagina] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [professores, setProfessores] = useState<OpcaoCampo[]>([])
  const [formulario, setFormulario] = useState<{
    tipo: TipoCadastro
    registro: Registro | null
  } | null>(null)
  const [excluindo, setExcluindo] = useState<{
    tipo: TipoCadastro
    registro: Registro
  } | null>(null)

  useEffect(() => {
    getProfessoresApi()
      .then((lista) =>
        setProfessores(
          lista.map((p) => ({ valor: String(p.id), rotulo: p.nome }))
        )
      )
      .catch(() => {}) // o professor é opcional; sem a lista o campo fica só com "Nenhum"
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await getAdminCatalogsApi())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha inesperada na API.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    getAdminCatalogsApi()
      .then((result) => {
        if (mounted) setData(result)
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

  const records = useMemo(
    () =>
      (data?.[active] || []).filter((record) =>
        includesSearch(recordText(record), search)
      ),
    [active, data, search]
  )
  const visiveis = paginar(records, pagina, POR_PAGINA)
  const total = data
    ? Object.values(data).reduce((sum, list) => sum + list.length, 0)
    : 0

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <AdminSectionHeader
        title="Cadastros institucionais"
        description="Mantenha os recursos usados na criação de eventos e consulte as medalhas concedidas."
        onRefresh={load}
        action={
          editavel(active) && (
            <Button
              id="botao-novo-cadastro"
              size="sm"
              leftIcon={<Plus className="size-4" />}
              onClick={() => setFormulario({ tipo: active, registro: null })}
            >
              {NOME_CADASTRO[active].novo}
            </Button>
          )
        }
      />
      {loading && !data ? (
        <AdminDataSkeleton />
      ) : error ? (
        <AdminLoadError message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminMetric
              label="Registros totais"
              value={total}
              detail="em cinco cadastros integrados"
            />
            <AdminMetric
              label="Locais disponíveis"
              value={data?.locais.length || 0}
              detail="espaços para novos eventos"
            />
            <AdminMetric
              label="Disciplinas"
              value={data?.disciplinas.length || 0}
              detail="vínculos acadêmicos cadastrados"
            />
          </div>

          <section className="space-y-4" aria-labelledby="catalog-list-title">
            <FiltroSegmentado
              rotulo="Tipos de cadastro"
              valor={active}
              onChange={(chave) => {
                setActive(chave)
                setSearch('')
                setPagina(1)
              }}
              opcoes={tabs.map((tab) => ({
                valor: tab.key,
                rotulo: tab.label,
                total: data?.[tab.key].length || 0,
              }))}
            />
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 id="catalog-list-title" className="font-display text-xl">
                  {tabs.find((tab) => tab.key === active)?.label}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {records.length} registro(s)
                  {active === 'medalhas' &&
                    ' · concedidas automaticamente na conclusão dos eventos'}
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <SearchIcon
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPagina(1)
                  }}
                  placeholder="Buscar neste cadastro"
                  className="pl-9"
                />
              </div>
            </div>
            {records.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visiveis.itens.map((record) => {
                  const presentation = getRecordPresentation(
                    active,
                    record as unknown as Record<string, unknown>
                  )
                  return (
                    <article
                      key={record.id}
                      className="rounded-md bg-[var(--color-bg-surface)] p-5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-lg leading-snug text-[var(--color-text-primary)] min-w-0 break-words">
                          {presentation.title}
                        </h3>
                        {editavel(active) && (
                          <div className="-mt-2 -mr-2">
                            <AcoesRegistro
                              id={`acoes-${active}-${record.id}`}
                              rotulo={`Ações de ${presentation.title}`}
                              onEditar={() =>
                                setFormulario({
                                  tipo: active,
                                  registro: record as unknown as Registro,
                                })
                              }
                              onExcluir={() =>
                                setExcluindo({
                                  tipo: active,
                                  registro: record as unknown as Registro,
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[var(--color-primary-text)] mt-2">
                        {presentation.meta}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-2 line-clamp-2">
                        {presentation.detail}
                      </p>
                    </article>
                  )
                })}
              </div>
            ) : (
              <AdminEmpty message="Nenhum registro corresponde à busca." />
            )}
            {visiveis.totalPaginas > 1 && (
              <nav
                aria-label="Páginas do cadastro"
                className="flex flex-wrap items-center justify-between gap-3"
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
            )}
          </section>
        </>
      )}

      {formulario && (
        <FormularioDialog
          key={`${formulario.tipo}-${formulario.registro?.id ?? 'novo'}`}
          aberto
          onFechar={() => setFormulario(null)}
          idRetorno={
            formulario.registro
              ? `acoes-${formulario.tipo}-${formulario.registro.id}`
              : 'botao-novo-cadastro'
          }
          titulo={
            formulario.registro
              ? `Editar ${NOME_CADASTRO[formulario.tipo].singular}`
              : NOME_CADASTRO[formulario.tipo].novo
          }
          campos={CAMPOS_CADASTRO[formulario.tipo]}
          valoresIniciais={valoresDe(
            CAMPOS_CADASTRO[formulario.tipo],
            formulario.registro
          )}
          opcoes={{
            id_professor: professores,
            enderecoId: (data?.enderecos ?? []).map((e) => ({
              valor: String(e.id),
              rotulo: descreverEndereco(
                e as unknown as Record<string, unknown>
              ),
            })),
          }}
          rotuloSalvar={formulario.registro ? 'Salvar alterações' : 'Cadastrar'}
          onSalvar={async (valores) => {
            const { tipo, registro } = formulario
            await salvarCadastroApi(
              tipo,
              registro?.id ?? null,
              paraPayload(CAMPOS_CADASTRO[tipo], valores)
            )
            toast.success(registro ? 'Alterações salvas' : 'Cadastro criado')
            setFormulario(null)
            void load()
          }}
        />
      )}

      <ConfirmarExclusao
        nome={
          excluindo
            ? getRecordPresentation(excluindo.tipo, excluindo.registro).title
            : null
        }
        tipo={excluindo ? NOME_CADASTRO[excluindo.tipo].singular : 'registro'}
        idRetorno={
          excluindo
            ? `acoes-${excluindo.tipo}-${excluindo.registro.id}`
            : undefined
        }
        onFechar={() => setExcluindo(null)}
        onExcluir={async () => {
          if (!excluindo) return
          await excluirCadastroApi(excluindo.tipo, excluindo.registro.id)
          void load()
        }}
      />
    </div>
  )
}
