import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminCertificatesApi } from '../api/adminCatalogApi'
import type {
  AdminCertificado,
  AdminCertificatesData,
} from '../domain/adminCatalogTypes'
import { formatAdminDate, includesSearch } from '../domain/adminCatalogTypes'
import { Badge, Button, EyeIcon, Input, SearchIcon } from '../../../shared/ui'
import { AdminDataSkeleton } from './AdminDataSkeleton'
import {
  AdminEmpty,
  AdminLoadError,
  AdminMetric,
  AdminSectionHeader,
} from './AdminPageParts'

const CertificateRows: React.FC<{ records: AdminCertificado[] }> = ({
  records,
}) => (
  <div className="overflow-x-auto border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="bg-[var(--color-bg-subtle)] text-xs text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
        <tr>
          <th className="px-4 py-3">Participante</th>
          <th className="px-4 py-3">Evento</th>
          <th className="px-4 py-3">Emissão</th>
          <th className="px-4 py-3">Código</th>
          <th className="px-4 py-3 text-right">Ação</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--color-border-subtle)]">
        {records.map((cert) => (
          <tr key={cert.id} className="hover:bg-[var(--color-bg-subtle)]">
            <td className="px-4 py-3">
              <span className="font-semibold text-[var(--color-text-primary)] block">
                {cert.participacao?.pessoa?.nome ||
                  'Participante não informado'}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {cert.participacao?.pessoa?.email || 'Email não informado'}
              </span>
            </td>
            <td className="px-4 py-3 text-[var(--color-text-secondary)]">
              {cert.participacao?.evento?.tema || 'Evento não informado'}
            </td>
            <td className="px-4 py-3 text-[var(--color-text-secondary)]">
              {formatAdminDate(cert.dataEmissao)}
            </td>
            <td className="px-4 py-3 font-mono text-xs">
              {cert.codigoValidacao || '—'}
            </td>
            <td className="px-4 py-3 text-right">
              {cert.codigoValidacao ? (
                <Link to={`/certificados/${cert.codigoValidacao}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<EyeIcon size={15} />}
                  >
                    Visualizar
                  </Button>
                </Link>
              ) : (
                <Badge variant="default">Indisponível</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

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
        eyebrow="Emissão e autenticidade"
        title="Certificados"
        description="Acompanhe emissões recentes, consulte o acervo e identifique eventos que ainda aguardam certificados."
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
              <h2 id="pending-title" className="font-serif text-xl mb-3">
                Eventos aguardando certificados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data?.eventosAguardandoCertificado.map((event) => (
                  <Link
                    key={event.id}
                    to={`/admin/eventos/${event.id}/concluir`}
                    className="surface-depth flex items-center justify-between gap-4 border border-[var(--color-warning-border)] bg-[var(--color-primary-subtle)] p-4 hover:-translate-y-0.5 transition-transform"
                  >
                    <span>
                      <strong className="block text-sm">{event.tema}</strong>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {formatAdminDate(event.data)}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[var(--color-primary-text)]">
                      Revisar emissão
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(data?.ultimosCertificados.length || 0) > 0 && (
            <section aria-labelledby="recent-title">
              <h2 id="recent-title" className="font-serif text-xl mb-3">
                Últimos certificados emitidos
              </h2>
              <CertificateRows records={data?.ultimosCertificados || []} />
            </section>
          )}

          <section aria-labelledby="archive-title" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 id="archive-title" className="font-serif text-xl">
                  Acervo completo
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {filtered.length} registro(s) encontrado(s)
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
                  placeholder="Buscar por pessoa, evento ou código"
                  className="pl-9"
                />
              </div>
            </div>
            {filtered.length ? (
              <CertificateRows records={filtered} />
            ) : (
              <AdminEmpty message="Nenhum certificado corresponde à busca." />
            )}
          </section>
        </>
      )}
    </div>
  )
}
