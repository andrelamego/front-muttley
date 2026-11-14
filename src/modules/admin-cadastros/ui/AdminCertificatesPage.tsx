import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react'
import { getAdminCertificatesApi } from '../api/adminCatalogApi'
import type {
  AdminCertificado,
  AdminCertificatesData,
} from '../domain/adminCatalogTypes'
import { formatAdminDate, includesSearch } from '../domain/adminCatalogTypes'
import {
  Badge,
  Button,
  ButtonLink,
  EyeIcon,
  Input,
  SearchIcon,
} from '../../../shared/ui'
import { paginar } from '../../../shared/lib/tabela'
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

const POR_PAGINA = 15

const CertificateRows: React.FC<{
  records: AdminCertificado[]
  /** Pagina listas longas, como o acervo completo. */
  paginado?: boolean
  rotulo: string
}> = ({ records, paginado = false, rotulo }) => {
  const [pagina, setPagina] = useState(1)
  const visiveis = paginado
    ? paginar(records, pagina, POR_PAGINA)
    : { itens: records, pagina: 1, totalPaginas: 1 }
  return (
    <div className="overflow-hidden rounded-md bg-[var(--color-bg-surface)]">
      <Table className="min-w-[760px]">
        <TableHeader className="bg-[var(--color-bg-subtle)]">
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">Participante</TableHead>
            <TableHead className="px-4">Evento</TableHead>
            <TableHead className="px-4">Emissão</TableHead>
            <TableHead className="px-4">Código</TableHead>
            <TableHead className="w-12 px-4">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visiveis.itens.map((cert) => (
            <TableRow key={cert.id}>
              <TableCell className="px-4 py-3">
                <span className="block font-semibold">
                  {cert.participacao?.pessoa?.nome ||
                    'Participante não informado'}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {cert.participacao?.pessoa?.email || 'Email não informado'}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-normal text-[var(--color-text-secondary)]">
                {cert.participacao?.evento?.tema || 'Evento não informado'}
              </TableCell>
              <TableCell className="px-4 py-3 tabular-nums text-[var(--color-text-secondary)]">
                {formatAdminDate(cert.dataEmissao)}
              </TableCell>
              <TableCell className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                {cert.codigoValidacao
                  ? `${cert.codigoValidacao.slice(0, 8)}…`
                  : '—'}
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                {cert.codigoValidacao ? (
                  <ButtonLink
                    to={`/certificados/${cert.codigoValidacao}`}
                    variant="ghost"
                    size="sm"
                    leftIcon={<EyeIcon size={15} />}
                    aria-label={`Ver o certificado de ${cert.participacao?.pessoa?.nome ?? 'participante'}`}
                  >
                    Ver
                  </ButtonLink>
                ) : (
                  <Badge variant="default">Indisponível</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {visiveis.totalPaginas > 1 && (
        <nav
          aria-label={`Páginas de ${rotulo}`}
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
      )}
    </div>
  )
}

export const AdminCertificatesPage: React.FC = () => {
  const [data, setData] = useState<AdminCertificatesData | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await getAdminCertificatesApi())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha inesperada na API.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    getAdminCertificatesApi()
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

  const filtered = useMemo(
    () =>
      (data?.certificados || []).filter((cert) =>
        includesSearch(
          [
            cert.codigoValidacao,
            cert.participacao?.pessoa?.nome,
            cert.participacao?.pessoa?.email,
            cert.participacao?.evento?.tema,
          ],
          search
        )
      ),
    [data, search]
  )

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      <AdminSectionHeader
        title="Certificados"
        description="Acompanhe emissões recentes, consulte o acervo e identifique eventos que ainda aguardam certificados."
        onRefresh={load}
        action={
          <ButtonLink
            to="/admin/certificados/modelo"
            size="sm"
            leftIcon={<Palette className="size-4" />}
          >
            Modelo do certificado
          </ButtonLink>
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
              label="Acervo emitido"
              value={data?.certificados.length || 0}
              detail="certificados registrados"
            />
            <AdminMetric
              label="Emissões recentes"
              value={data?.ultimosCertificados.length || 0}
              detail="últimos registros retornados"
            />
            <AdminMetric
              label="Aguardando emissão"
              value={data?.eventosAguardandoCertificado.length || 0}
              detail="eventos que exigem atenção"
            />
          </div>

          {(data?.eventosAguardandoCertificado.length || 0) > 0 && (
            <section aria-labelledby="pending-title">
              <h2 id="pending-title" className="font-display text-xl mb-3">
                Eventos aguardando certificados
              </h2>
              <ul className="divide-y divide-[var(--color-border-subtle)] rounded-md bg-[var(--color-bg-surface)]">
                {data?.eventosAguardandoCertificado.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold break-words">
                        {event.tema}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {formatAdminDate(event.data)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Badge variant="warning">Aguarda conclusão</Badge>
                      <ButtonLink
                        to={`/admin/eventos/${event.id}/concluir`}
                        size="sm"
                        variant="outline"
                      >
                        Concluir
                      </ButtonLink>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(data?.ultimosCertificados.length || 0) > 0 && (
            <section aria-labelledby="recent-title">
              <h2 id="recent-title" className="font-display text-xl mb-3">
                Últimos certificados emitidos
              </h2>
              <CertificateRows
                rotulo="últimos certificados"
                records={data?.ultimosCertificados || []}
              />
            </section>
          )}

          <section aria-labelledby="archive-title" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 id="archive-title" className="font-display text-xl">
                  Acervo completo
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {filtered.length} registro(s) encontrado(s)
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <SearchIcon
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por pessoa, evento ou código"
                  className="pl-9"
                />
              </div>
            </div>
            {filtered.length ? (
              <CertificateRows
                key={search}
                rotulo="acervo"
                records={filtered}
                paginado
              />
            ) : (
              <AdminEmpty message="Nenhum certificado corresponde à busca." />
            )}
          </section>
        </>
      )}
    </div>
  )
}
