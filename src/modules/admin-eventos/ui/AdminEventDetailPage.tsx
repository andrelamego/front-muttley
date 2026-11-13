import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, Pencil } from 'lucide-react'
import {
  getAdminEventoByIdApi,
  getEventParticipationsApi,
} from '../api/adminEventosApi'
import type {
  AdminEvento,
  ParticipacaoEventoAdmin,
} from '../domain/adminEventoTypes'
import {
  Alert,
  Badge,
  Button,
  CheckCircleIcon,
  FiltroSegmentado,
  Input,
  QrCodeIcon,
  SearchIcon,
  SkeletonBlock,
  Ticket,
} from '../../../shared/ui'
import { baixarArquivo, paraCsv } from '../../../shared/lib/csv'
import { ordenarPor, paginar } from '../../../shared/lib/tabela'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/shadcn/table'
import {
  formatModalidade,
  formatPresenceWindow,
  getPresenceWindow,
  getTicketDateParts,
  isWithinPresenceWindow,
} from '../../eventos'
import { EventoQrDialog } from './EventoQrDialog'
import { getStatusBadgeVariant, getStatusLabel } from './statusEvento'

const POR_PAGINA = 15
type FiltroPresenca = 'TODOS' | 'PRESENTES' | 'AUSENTES'

const nomeDe = (valor?: { nome: string } | string | null) =>
  typeof valor === 'string' ? valor : (valor?.nome ?? null)

interface LinhaInscrito {
  id: number
  nome: string
  email: string
  inscricao: number
  tipo: string
  presente: boolean
}

const paraLinha = (p: ParticipacaoEventoAdmin): LinhaInscrito => ({
  id: p.id,
  nome: p.pessoa?.nome ?? 'Participante',
  email: p.pessoa?.email ?? '',
  inscricao: p.inscricao,
  tipo: p.tipo,
  presente: p.presente,
})

export const AdminEventDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>()
  const [evento, setEvento] = useState<AdminEvento | null>(null)
  const [inscritos, setInscritos] = useState<LinhaInscrito[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [qrAberto, setQrAberto] = useState(false)

  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<FiltroPresenca>('TODOS')
  const [pagina, setPagina] = useState(1)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [ev, parts] = await Promise.all([
        getAdminEventoByIdApi(id),
        getEventParticipationsApi(id),
      ])
      setEvento(ev)
      setInscritos(parts.map(paraLinha))
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : 'Não foi possível abrir o evento.'
      )
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => {
    let ativo = true
    Promise.all([getAdminEventoByIdApi(id), getEventParticipationsApi(id)])
      .then(([ev, parts]) => {
        if (!ativo) return
        setEvento(ev)
        setInscritos(parts.map(paraLinha))
      })
      .catch((err: unknown) => {
        if (ativo)
          setErro(
            err instanceof Error
              ? err.message
              : 'Não foi possível abrir o evento.'
          )
      })
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [id])

  const presentes = inscritos.filter((i) => i.presente).length

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtrados = inscritos.filter(
      (i) =>
        (filtro === 'TODOS' || (filtro === 'PRESENTES') === i.presente) &&
        (!termo ||
          i.nome.toLowerCase().includes(termo) ||
          i.email.toLowerCase().includes(termo) ||
          String(i.inscricao).includes(termo))
    )
    return paginar(ordenarPor(filtrados, 'nome', 'asc'), pagina, POR_PAGINA)
  }, [inscritos, busca, filtro, pagina])

  const exportar = () => {
    if (!evento) return
    baixarArquivo(
      paraCsv([
        ['Nome', 'Email', 'Inscrição', 'Tipo', 'Presente'],
        ...ordenarPor(inscritos, 'nome', 'asc').map((i) => [
          i.nome,
          i.email,
          i.inscricao,
          i.tipo,
          i.presente ? 'Sim' : 'Não',
        ]),
      ]),
      `inscritos-evento-${evento.id}.csv`
    )
  }

  if (carregando && !evento) {
    return (
      <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <SkeletonBlock className="h-48 w-full" />
        <SkeletonBlock className="h-80 w-full" />
      </div>
    )
  }

  if (erro || !evento) {
    return (
      <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="error" title="Não foi possível abrir o evento">
          <p>{erro}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={carregar}
          >
            Tentar novamente
          </Button>
        </Alert>
      </div>
    )
  }

  const partes = getTicketDateParts(evento.data, evento.horarioInicio)
  const janela = getPresenceWindow(
    evento.data,
    evento.horarioInicio,
    evento.horarioFim
  )
  const presencaAberta = isWithinPresenceWindow(
    evento.data,
    evento.horarioInicio,
    evento.horarioFim
  )
  const encerrado =
    evento.status === 'FINALIZADO' || evento.status === 'CANCELADO'
  const local = nomeDe(evento.local)
  const disciplina = nomeDe(evento.disciplina)

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <Ticket dia={partes.dia} mes={partes.mes} horario={partes.horario}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusBadgeVariant(evento.status)}>
              {getStatusLabel(evento.status)}
            </Badge>
            {presencaAberta && <Badge variant="success">Presença aberta</Badge>}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight mt-3">
            {evento.tema}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {[
              `${evento.horarioInicio?.slice(0, 5)} às ${evento.horarioFim?.slice(0, 5)}`,
              local,
              formatModalidade(evento.modalidade),
              disciplina,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {janela && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Presença: {formatPresenceWindow(janela).toLowerCase()}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {!encerrado && (
              <Link to={`/admin/eventos/${evento.id}/concluir`}>
                <Button leftIcon={<CheckCircleIcon size={16} />}>
                  Concluir evento
                </Button>
              </Link>
            )}
            <Button
              id="botao-qr-evento"
              variant="outline"
              leftIcon={<QrCodeIcon size={16} />}
              onClick={() => setQrAberto(true)}
            >
              QR Codes
            </Button>
            {evento.status !== 'CANCELADO' && (
              <Link to={`/admin/eventos/${evento.id}/editar`}>
                <Button
                  variant="ghost"
                  leftIcon={<Pencil className="size-4" />}
                >
                  Editar
                </Button>
              </Link>
            )}
          </div>
        </Ticket>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md bg-[var(--color-bg-surface)] p-5">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Inscritos
            </span>
            <b className="block font-display text-5xl font-extrabold leading-none mt-2">
              {inscritos.length}
            </b>
          </div>
          <div className="rounded-md bg-[var(--color-bg-surface)] p-5">
            <span className="text-sm text-[var(--color-text-secondary)]">
              Presentes
            </span>
            <b className="block font-display text-5xl font-extrabold leading-none mt-2">
              {presentes}
            </b>
            {inscritos.length > 0 && (
              <span className="block text-sm text-[var(--color-text-secondary)] mt-2">
                {Math.round((presentes / inscritos.length) * 100)}% dos
                inscritos
              </span>
            )}
          </div>
        </div>
      </div>

      <section
        aria-labelledby="inscritos-titulo"
        className="rounded-md bg-[var(--color-bg-surface)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-4">
          <h2 id="inscritos-titulo" className="font-display text-lg font-bold">
            Inscritos
          </h2>
          <FiltroSegmentado
            rotulo="Filtrar por presença"
            valor={filtro}
            onChange={(v) => {
              setFiltro(v)
              setPagina(1)
            }}
            opcoes={[
              { valor: 'TODOS', rotulo: 'Todos', total: inscritos.length },
              { valor: 'PRESENTES', rotulo: 'Presentes', total: presentes },
              {
                valor: 'AUSENTES',
                rotulo: 'Ausentes',
                total: inscritos.length - presentes,
              },
            ]}
          />
          <div className="relative lg:ml-auto lg:w-72">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <Input
              aria-label="Buscar inscrito"
              placeholder="Nome, email ou inscrição"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setPagina(1)
              }}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={exportar}
            disabled={inscritos.length === 0}
            leftIcon={<Download className="size-4" />}
          >
            Baixar CSV
          </Button>
        </div>

        {inscritos.length === 0 ? (
          <p className="px-4 pb-6 text-sm text-[var(--color-text-secondary)]">
            Ainda não há inscritos neste evento.
          </p>
        ) : visiveis.itens.length === 0 ? (
          <p className="px-4 pb-6 text-sm text-[var(--color-text-secondary)]">
            Nenhum inscrito corresponde à busca.
          </p>
        ) : (
          <>
            <Table className="min-w-[640px]">
              <TableHeader className="bg-[var(--color-bg-subtle)]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4">Participante</TableHead>
                  <TableHead className="px-4">Inscrição</TableHead>
                  <TableHead className="px-4">Tipo</TableHead>
                  <TableHead className="px-4">Presença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiveis.itens.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="px-4 py-3">
                      <span className="block font-semibold">{i.nome}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {i.email}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 tabular-nums">
                      #{i.inscricao}
                    </TableCell>
                    <TableCell className="px-4 py-3">{i.tipo}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant={i.presente ? 'success' : 'default'}>
                        {i.presente ? 'Presente' : 'Ausente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <nav
              aria-label="Páginas de inscritos"
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
          </>
        )}
      </section>

      <EventoQrDialog
        evento={qrAberto ? evento : null}
        onClose={() => setQrAberto(false)}
        focoAoFechar={() => document.getElementById('botao-qr-evento')}
      />
    </div>
  )
}
