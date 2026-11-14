import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImagePlus, Lock, Palette } from 'lucide-react'
import {
  concluirEventoApi,
  getAdminEventoByIdApi,
  getEventParticipationsApi,
} from '../api/adminEventosApi'
import type {
  AdminEvento,
  ConcluirEventoResponse,
  ParticipacaoEventoAdmin,
} from '../domain/adminEventoTypes'
import {
  Alert,
  Badge,
  Button,
  CheckCircleIcon,
  FiltroSegmentado,
  Input,
  SearchIcon,
  Ticket,
  UsersIcon,
  ButtonLink,
} from '../../../shared/ui'
import { HistoryBackButton } from '../../../shared/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/ui/shadcn/alert-dialog'
import { Checkbox } from '../../../shared/ui/shadcn/checkbox'
import { getTicketDateParts } from '../../eventos'
import { AdminEventConcludeSkeleton } from './skeletons'

// Limite padrão de upload do Spring (1 MB); a API aceita só PNG e JPG.
const ASSINATURA_MAX_BYTES = 1024 * 1024
const TIPOS_ASSINATURA = ['image/png', 'image/jpeg']

type Filtro = 'TODOS' | 'PRESENTES' | 'AUSENTES'

const nomeDe = (valor?: { nome: string } | string | null) =>
  typeof valor === 'string' ? valor : (valor?.nome ?? null)

const Passo: React.FC<{
  numero: number
  titulo: string
  descricao: string
  children: React.ReactNode
  acessorio?: React.ReactNode
}> = ({ numero, titulo, descricao, children, acessorio }) => (
  <section
    aria-labelledby={`passo-${numero}`}
    className="rounded-md bg-[var(--color-bg-surface)] p-5 sm:p-6"
  >
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div className="flex gap-3">
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-[var(--color-primary-contrast)]"
          aria-hidden
        >
          {numero}
        </span>
        <div>
          <h2 id={`passo-${numero}`} className="font-display text-lg font-bold">
            {titulo}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {descricao}
          </p>
        </div>
      </div>
      {acessorio}
    </div>
    {children}
  </section>
)

export const AdminEventConcludePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const buscaId = useId()
  const arquivoRef = useRef<HTMLInputElement>(null)

  const [evento, setEvento] = useState<AdminEvento | null>(null)
  const [participacoes, setParticipacoes] = useState<ParticipacaoEventoAdmin[]>(
    []
  )
  const [presentesIds, setPresentesIds] = useState<number[]>([])
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')

  const [assinatura, setAssinatura] = useState<File | null>(null)
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | null>(null)
  const [erroAssinatura, setErroAssinatura] = useState<string | null>(null)
  const [arrastando, setArrastando] = useState(false)

  const [carregando, setCarregando] = useState(true)
  const [concluindo, setConcluindo] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ConcluirEventoResponse | null>(
    null
  )

  useEffect(() => {
    let ativo = true
    if (!id) return
    Promise.all([getAdminEventoByIdApi(id), getEventParticipationsApi(id)])
      .then(([ev, parts]) => {
        if (!ativo) return
        setEvento(ev)
        setParticipacoes(parts)
        setPresentesIds(parts.filter((p) => p.presente).map((p) => p.id))
      })
      .catch((err: unknown) => {
        if (ativo)
          setErro(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar o evento e os inscritos.'
          )
      })
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [id])

  useEffect(
    () => () => {
      if (assinaturaUrl) URL.revokeObjectURL(assinaturaUrl)
    },
    [assinaturaUrl]
  )

  // A API só marca presenças: quem já confirmou pelo QR Code não pode ser desmarcado aqui.
  const confirmadosNoQr = useMemo(
    () => new Set(participacoes.filter((p) => p.presente).map((p) => p.id)),
    [participacoes]
  )

  const escolherAssinatura = (arquivo: File | undefined) => {
    if (!arquivo) return
    if (!TIPOS_ASSINATURA.includes(arquivo.type)) {
      setErroAssinatura('Envie a assinatura em PNG ou JPG.')
      return
    }
    if (arquivo.size > ASSINATURA_MAX_BYTES) {
      setErroAssinatura('A imagem deve ter até 1 MB.')
      return
    }
    setErroAssinatura(null)
    setAssinatura(arquivo)
    setAssinaturaUrl(URL.createObjectURL(arquivo))
  }

  const alternar = (participacaoId: number) => {
    if (confirmadosNoQr.has(participacaoId)) return
    setPresentesIds((atual) =>
      atual.includes(participacaoId)
        ? atual.filter((p) => p !== participacaoId)
        : [...atual, participacaoId]
    )
  }

  const filtradas = participacoes.filter((p) => {
    const presente = presentesIds.includes(p.id)
    if (filtro === 'PRESENTES' && !presente) return false
    if (filtro === 'AUSENTES' && presente) return false
    const termo = busca.trim().toLowerCase()
    return (
      !termo ||
      (p.pessoa?.nome ?? '').toLowerCase().includes(termo) ||
      (p.pessoa?.email ?? '').toLowerCase().includes(termo) ||
      String(p.inscricao).includes(termo)
    )
  })

  const marcaveis = filtradas.filter((p) => !confirmadosNoQr.has(p.id))
  const todosMarcados =
    marcaveis.length > 0 && marcaveis.every((p) => presentesIds.includes(p.id))

  const marcarTodos = (marcar: boolean) => {
    const ids = marcaveis.map((p) => p.id)
    setPresentesIds((atual) =>
      marcar
        ? Array.from(new Set([...atual, ...ids]))
        : atual.filter((p) => !ids.includes(p))
    )
  }

  const concluir = async () => {
    if (!id || !assinatura) return
    setConcluindo(true)
    setErro(null)
    try {
      setResultado(await concluirEventoApi(id, presentesIds, assinatura))
    } catch (err: unknown) {
      setErro(
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir o evento.'
      )
    } finally {
      setConcluindo(false)
      setConfirmando(false)
    }
  }

  const presentes = presentesIds.length
  const ausentes = participacoes.length - presentes
  const podeConcluir = evento?.status === 'EM_ANDAMENTO'

  if (carregando) {
    return (
      <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminEventConcludeSkeleton />
      </div>
    )
  }

  if (resultado) {
    const emitidos = resultado.certificadosGerados ?? presentes
    return (
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-16 text-center flex flex-col items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)]">
          <CheckCircleIcon size={30} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold">Evento concluído</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            {emitidos === 1
              ? '1 certificado foi emitido.'
              : `${emitidos} certificados foram emitidos.`}{' '}
            Os participantes já podem baixá-los na área deles.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <ButtonLink to={`/admin/eventos/${id}`}>Ver o evento</ButtonLink>
          <ButtonLink to="/admin/inicio" variant="outline">
            Voltar ao painel
          </ButtonLink>
        </div>
      </div>
    )
  }

  const partes = evento
    ? getTicketDateParts(evento.data, evento.horarioInicio)
    : null

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <HistoryBackButton label="Voltar" />
        <div>
          <h1 className="font-display text-3xl font-bold">Concluir evento</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Confira quem veio, anexe a assinatura e emita os certificados de uma
            vez.
          </p>
        </div>
      </div>

      {evento && partes && (
        <Ticket
          dia={partes.dia}
          mes={partes.mes}
          horario={partes.horario}
          compact
        >
          <p className="font-display text-xl font-bold leading-tight">
            {evento.tema}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {[
              `${evento.horarioInicio?.slice(0, 5)} às ${evento.horarioFim?.slice(0, 5)}`,
              nomeDe(evento.local),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </Ticket>
      )}

      {erro && (
        <Alert
          variant="error"
          title="Não foi possível concluir"
          onClose={() => setErro(null)}
        >
          {erro}
        </Alert>
      )}
      {evento && !podeConcluir && (
        <Alert variant="warning" title="Este evento não pode ser concluído">
          Só eventos em andamento podem ser concluídos.
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6 items-start">
        <Passo
          numero={1}
          titulo="Confira as presenças"
          descricao="Marque quem compareceu. Só os presentes recebem certificado."
          acessorio={
            <Badge variant="info" size="md">
              {presentes} de {participacoes.length} presentes
            </Badge>
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div className="relative sm:max-w-xs flex-1">
              <label htmlFor={buscaId} className="sr-only">
                Buscar inscrito
              </label>
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <Input
                id={buscaId}
                type="search"
                placeholder="Nome, email ou inscrição"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <FiltroSegmentado
              rotulo="Filtrar por presença"
              valor={filtro}
              onChange={setFiltro}
              opcoes={[
                {
                  valor: 'TODOS',
                  rotulo: 'Todos',
                  total: participacoes.length,
                },
                { valor: 'PRESENTES', rotulo: 'Presentes', total: presentes },
                { valor: 'AUSENTES', rotulo: 'Ausentes', total: ausentes },
              ]}
            />
          </div>

          {participacoes.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <UsersIcon
                size={28}
                className="mx-auto mb-2 text-[var(--color-text-subtle)]"
              />
              <p className="text-sm text-[var(--color-text-secondary)]">
                Ninguém se inscreveu neste evento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="bg-[var(--color-bg-subtle)] text-xs font-semibold text-[var(--color-text-secondary)]">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center">
                      <Checkbox
                        checked={todosMarcados}
                        disabled={marcaveis.length === 0}
                        onCheckedChange={(v) => marcarTodos(v === true)}
                        aria-label="Marcar todos os inscritos visíveis"
                        className="size-5"
                      />
                    </th>
                    <th className="px-4 py-3">Inscrito</th>
                    <th className="px-4 py-3">Inscrição</th>
                    <th className="px-4 py-3">Presença</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtradas.map((p) => {
                    const presente = presentesIds.includes(p.id)
                    const travado = confirmadosNoQr.has(p.id)
                    const nome = p.pessoa?.nome || 'Participante'
                    return (
                      <tr
                        key={p.id}
                        onClick={() => alternar(p.id)}
                        className={`transition-colors ${travado ? '' : 'cursor-pointer hover:bg-[var(--color-bg-hover)]'}`}
                      >
                        <td
                          className="px-4 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={presente}
                            disabled={travado}
                            onCheckedChange={() => alternar(p.id)}
                            aria-label={`Presença de ${nome}`}
                            className="size-5"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="block font-semibold">{nome}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {p.pessoa?.email || '—'}
                            {p.tipo && p.tipo !== 'Participante'
                              ? ` · ${p.tipo}`
                              : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-[var(--color-text-secondary)]">
                          #{p.inscricao}
                        </td>
                        <td className="px-4 py-3">
                          {travado ? (
                            <Badge
                              variant="success"
                              size="sm"
                              title="A presença já foi registrada e não pode ser desfeita"
                            >
                              <Lock className="size-3" aria-hidden />
                              Confirmou pelo QR Code
                            </Badge>
                          ) : presente ? (
                            <Badge variant="success" size="sm">
                              Presente
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm">
                              Ausente
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtradas.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]"
                      >
                        Ninguém corresponde à busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Passo>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <Passo
            numero={2}
            titulo="Assinatura"
            descricao="Imagem de quem certifica. Ela aparece em todos os certificados deste evento."
          >
            <input
              ref={arquivoRef}
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                escolherAssinatura(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => arquivoRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setArrastando(true)
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => {
                e.preventDefault()
                setArrastando(false)
                escolherAssinatura(e.dataTransfer.files?.[0])
              }}
              aria-describedby="assinatura-ajuda"
              className={`flex h-32 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] ${
                arrastando
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                  : 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] hover:border-[var(--color-primary)]'
              }`}
            >
              {assinaturaUrl ? (
                <img
                  src={assinaturaUrl}
                  alt="Assinatura escolhida"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <>
                  <ImagePlus
                    className="size-6 text-[var(--color-text-muted)]"
                    aria-hidden
                  />
                  <span className="font-semibold text-[var(--color-primary-text)]">
                    Escolher imagem
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ou arraste até aqui
                  </span>
                </>
              )}
            </button>
            <p
              id="assinatura-ajuda"
              className="mt-2 text-xs text-[var(--color-text-muted)]"
            >
              {assinatura
                ? `${assinatura.name} · clique para trocar`
                : 'PNG ou JPG, até 1 MB. Fundo transparente fica melhor.'}
            </p>
            {erroAssinatura && (
              <p
                role="alert"
                className="mt-1 text-xs text-[var(--color-danger-text)]"
              >
                {erroAssinatura}
              </p>
            )}
          </Passo>

          <section
            aria-label="Resumo"
            className="rounded-md bg-[var(--color-bg-surface)] p-5 sm:p-6 flex flex-col gap-4"
          >
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-[var(--color-success-bg)] p-3">
                <dt className="text-xs text-[var(--color-success-text)]">
                  Certificados
                </dt>
                <dd className="font-display text-3xl font-bold tabular-nums">
                  {presentes}
                </dd>
              </div>
              <div className="rounded-md bg-[var(--color-bg-subtle)] p-3">
                <dt className="text-xs text-[var(--color-text-secondary)]">
                  Ausentes
                </dt>
                <dd className="font-display text-3xl font-bold tabular-nums">
                  {ausentes}
                </dd>
              </div>
            </dl>
            <Button
              size="lg"
              fullWidth
              disabled={!assinatura || !podeConcluir}
              onClick={() => setConfirmando(true)}
              leftIcon={<CheckCircleIcon size={18} />}
            >
              Concluir e emitir
            </Button>
            {!assinatura && podeConcluir && (
              <p className="text-xs text-[var(--color-text-muted)] -mt-2 text-center">
                Anexe a assinatura para concluir.
              </p>
            )}
            <Link
              to="/admin/certificados/modelo"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--color-primary-text)] hover:underline"
            >
              <Palette className="size-4" aria-hidden />
              Ver o modelo do certificado
            </Link>
          </section>
        </div>
      </div>

      <AlertDialog
        open={confirmando}
        onOpenChange={(aberto) => !concluindo && setConfirmando(aberto)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir “{evento?.tema}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {presentes === 0
                ? 'Ninguém está marcado como presente, então nenhum certificado será emitido.'
                : presentes === 1
                  ? '1 certificado será emitido.'
                  : `${presentes} certificados serão emitidos.`}{' '}
              Depois de concluído, o evento não pode mais ser editado nem ter
              presenças alteradas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={concluindo}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              disabled={concluindo}
              onClick={(e) => {
                e.preventDefault() // fecha só depois da resposta da API
                void concluir()
              }}
            >
              {concluindo ? 'Emitindo…' : 'Concluir e emitir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
