import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getAdminCatalogsApi } from '../api/adminCatalogApi'
import type {
  AdminCatalogKey,
  AdminCatalogsData,
} from '../domain/adminCatalogTypes'
import { includesSearch } from '../domain/adminCatalogTypes'
import { Input, SearchIcon } from '../../../shared/ui'
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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
  const total = data
    ? Object.values(data).reduce((sum, list) => sum + list.length, 0)
    : 0

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <AdminSectionHeader
        eyebrow="Base operacional"
        title="Cadastros institucionais"
        description="Consulte os recursos usados na criação de eventos e no reconhecimento dos participantes."
        onRefresh={load}
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
            <div
              className="flex flex-wrap gap-1 border-b border-[var(--color-border)]"
              role="tablist"
              aria-label="Tipos de cadastro"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active === tab.key}
                  onClick={() => {
                    setActive(tab.key)
                    setSearch('')
                  }}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${active === tab.key ? 'border-[var(--color-primary)] text-[var(--color-primary-text)] bg-[var(--color-bg-subtle)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  {tab.label}{' '}
                  <span className="font-mono text-xs ml-1">
                    {data?.[tab.key].length || 0}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 id="catalog-list-title" className="font-serif text-xl">
                  {tabs.find((tab) => tab.key === active)?.label}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {records.length} registro(s)
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <SearchIcon
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar neste cadastro"
                  className="pl-9"
                />
              </div>
            </div>
            {records.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {records.map((record) => {
                  const presentation = getRecordPresentation(
                    active,
                    record as unknown as Record<string, unknown>
                  )
                  return (
                    <article
                      key={record.id}
                      className="surface-depth bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-5"
                    >
                      <p className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                        Registro #{record.id}
                      </p>
                      <h3 className="font-serif text-lg mt-2 text-[var(--color-text-primary)]">
                        {presentation.title}
                      </h3>
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
          </section>
        </>
      )}
    </div>
  )
}
