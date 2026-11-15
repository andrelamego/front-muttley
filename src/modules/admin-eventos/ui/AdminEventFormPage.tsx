import React, { useEffect, useId, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, CopyPlus, Info } from 'lucide-react'
import { ptBR } from 'react-day-picker/locale'
import {
  getAdminEventoByIdApi,
  getAdminEventosApi,
  getAuxiliaresEventoApi,
  salvarAdminEventoApi,
} from '../api/adminEventosApi'
import type {
  AdminEvento,
  DisciplinaOption,
  LocalOption,
  ModalidadeEvento,
  PatrocinadorOption,
  PessoaOption,
} from '../domain/adminEventoTypes'
import {
  ATALHOS_PERIODO,
  DURACOES,
  conflitos,
  consequencias,
  copiarDe,
  proximoDiaUtil,
  somarMinutos,
  validarEvento,
  type ValoresEvento,
} from '../domain/formularioEvento'
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  CalendarIcon,
  FiltroSegmentado,
  Input,
  Ticket,
  toast,
} from '../../../shared/ui'
import { HistoryBackButton } from '../../../shared/navigation'
import { deDataIso, paraDataIso } from '../../../shared/lib/datas'
import { Calendar } from '../../../shared/ui/shadcn/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/ui/shadcn/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/shadcn/select'
import { Textarea } from '../../../shared/ui/shadcn/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/shadcn/dialog'
import { formatModalidade, getTicketDateParts } from '../../eventos'
import { AdminEventFormSkeleton } from './skeletons'
import { SeletorPalestrantes } from './SeletorPalestrantes'

const VAZIO = '__vazio__'
const ULTIMO_LOCAL = 'muttley-ultimo-local'
// Mesmo estilo do rótulo do Input, para os campos não parecerem de famílias diferentes.
const rotuloClasse =
  'block text-sm font-medium text-[var(--color-text-primary)] mb-1.5'
/** "09:00" → "9h", "21:30" → "21h30". */
const hora = (hhmm: string) => {
  const [h, m] = hhmm.split(':')
  return `${Number(h)}h${m === '00' ? '' : m}`
}
const Obrigatorio = () => (
  <span className="text-[var(--color-danger-text)] ml-1" aria-hidden>
    *
  </span>
)
const campoClasse =
  'w-full h-11 rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-3 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] aria-[invalid=true]:border-[var(--color-danger-text)]'
const chipClasse =
  'rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]'
const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
const formatoCurto = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const lerUltimoLocal = () => {
  try {
    return localStorage.getItem(ULTIMO_LOCAL) ?? ''
  } catch {
    return ''
  }
}

const ORDEM_CAMPOS: Array<keyof ValoresEvento> = [
  'tema',
  'disciplinaId',
  'data',
  'horarioInicio',
  'horarioFim',
  'localId',
  'patrocinadorId',
]

/** Bloco do formulário que responde a uma pergunta: sobre o quê, quando, onde. */
const Secao: React.FC<{
  titulo: string
  children: React.ReactNode
}> = ({ titulo, children }) => (
  <section className="rounded-md bg-[var(--color-bg-surface)] p-5 sm:p-6 space-y-4">
    <h2 className="font-display text-lg font-bold">{titulo}</h2>
    {children}
  </section>
)

const Erro: React.FC<{ id: string; mensagem?: string }> = ({ id, mensagem }) =>
  mensagem ? (
    <p id={id} className="mt-1.5 text-xs text-[var(--color-danger-text)]">
      {mensagem}
    </p>
  ) : null

/** Seletor de cadastro obrigatório (disciplina, local, patrocinador). */
const SelectCadastro: React.FC<{
  id: string
  valor: string
  onChange: (v: string) => void
  placeholder: string
  opcoes: { valor: string; rotulo: string }[]
  erro?: string
}> = ({ id, valor, onChange, placeholder, opcoes, erro }) => (
  <>
    <Select
      value={valor || VAZIO}
      onValueChange={(v) => onChange(v === VAZIO ? '' : v)}
    >
      <SelectTrigger
        id={id}
        className={campoClasse}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `${id}-erro` : undefined}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={VAZIO} disabled>
          {placeholder}
        </SelectItem>
        {opcoes.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Erro id={`${id}-erro`} mensagem={erro} />
  </>
)

export const AdminEventFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const editando = Boolean(id)
  const navigate = useNavigate()
  const prefixo = useId()
  const idCampo = (c: string) => `${prefixo}-${c}`

  const [v, setV] = useState<ValoresEvento>(() => ({
    tema: '',
    descricao: '',
    data: editando ? '' : proximoDiaUtil(new Date()),
    horarioInicio: '',
    horarioFim: '',
    modalidade: 'PRESENCIAL',
    localId: editando ? '' : lerUltimoLocal(),
    disciplinaId: '',
    patrocinadorId: '',
  }))
  const [erros, setErros] = useState<
    Partial<Record<keyof ValoresEvento, string>>
  >({})
  const [calendarioAberto, setCalendarioAberto] = useState(false)
  const [copiando, setCopiando] = useState(false)
  const [buscaCopia, setBuscaCopia] = useState('')

  const [locais, setLocais] = useState<LocalOption[]>([])
  const [disciplinas, setDisciplinas] = useState<DisciplinaOption[]>([])
  const [patrocinadores, setPatrocinadores] = useState<PatrocinadorOption[]>([])
  const [pessoas, setPessoas] = useState<PessoaOption[]>([])
  // Fora de ValoresEvento: não entra em copiarDe, porque a palestra muda de um evento para outro.
  const [palestrantes, setPalestrantes] = useState<PessoaOption[]>([])
  const [eventos, setEventos] = useState<AdminEvento[]>([])

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    Promise.all([
      getAuxiliaresEventoApi(),
      // Para avisar de choque de horário e para copiar; sem a lista o formulário funciona igual.
      getAdminEventosApi().catch(() => [] as AdminEvento[]),
      id ? getAdminEventoByIdApi(id) : Promise.resolve(null),
    ])
      .then(([aux, lista, evt]) => {
        if (!ativo) return
        setLocais(aux.locais)
        setDisciplinas(aux.disciplinas)
        setPatrocinadores(aux.patrocinadores)
        setPessoas(aux.pessoas)
        setEventos(lista)
        if (evt) {
          setPalestrantes(evt.palestrantes ?? [])
          setV({
            ...copiarDe(evt),
            data: evt.data ?? '',
            descricao:
              evt.descricao && evt.descricao !== '-' ? evt.descricao : '',
          })
        } else {
          // O último local só vale se ainda existir.
          setV((atual) =>
            aux.locais.some((l) => String(l.id) === atual.localId)
              ? atual
              : { ...atual, localId: '' }
          )
        }
      })
      .catch((e: unknown) => {
        if (ativo)
          setErro(
            e instanceof Error ? e.message : 'Não foi possível abrir o evento.'
          )
      })
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [id])

  const alterar = <K extends keyof ValoresEvento>(
    campo: K,
    valor: ValoresEvento[K]
  ) => {
    setV((atual) => ({ ...atual, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  const usarPeriodo = (inicio: string, fim: string) => {
    setV((atual) => ({ ...atual, horarioInicio: inicio, horarioFim: fim }))
    setErros((e) => ({ ...e, horarioInicio: undefined, horarioFim: undefined }))
  }

  const usarDuracao = (minutos: number) => {
    const fim = v.horarioInicio ? somarMinutos(v.horarioInicio, minutos) : null
    if (fim) alterar('horarioFim', fim)
    else if (!v.horarioInicio)
      setErros((e) => ({ ...e, horarioInicio: 'Informe o início primeiro.' }))
    else toast.error('Essa duração passaria da meia-noite.')
  }

  const copiar = (evento: AdminEvento) => {
    setV((atual) => ({ ...atual, ...copiarDe(evento) }))
    setErros({})
    setCopiando(false)
    setBuscaCopia('')
    toast.success(`Dados copiados de “${evento.tema}”. Confira a data.`)
  }

  const local = locais.find((l) => String(l.id) === v.localId)
  const disciplina = disciplinas.find((d) => String(d.id) === v.disciplinaId)
  const efeitos = consequencias(v)
  const choques = useMemo(
    () => conflitos(eventos, v, id ? Number(id) : undefined),
    [eventos, v, id]
  )
  const anteriores = useMemo(() => {
    const termo = buscaCopia.trim().toLowerCase()
    return [...eventos]
      .filter((e) => e.status !== 'CANCELADO')
      .filter((e) => !termo || e.tema.toLowerCase().includes(termo))
      .sort((a, b) => (b.data ?? '').localeCompare(a.data ?? ''))
      .slice(0, 30)
  }, [eventos, buscaCopia])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    const encontrados = validarEvento(v, new Date())
    if (Object.keys(encontrados).length) {
      flushSync(() => setErros(encontrados))
      const primeiro = ORDEM_CAMPOS.find((c) => encontrados[c])
      if (primeiro) document.getElementById(idCampo(primeiro))?.focus()
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const resultado = await salvarAdminEventoApi({
        id: id ? Number(id) : null,
        tema: v.tema.trim(),
        descricao: v.descricao.trim() || '-',
        data: v.data,
        horarioInicio: v.horarioInicio,
        horarioFim: v.horarioFim,
        modalidade: v.modalidade,
        localId: Number(v.localId),
        disciplinaId: Number(v.disciplinaId),
        patrocinadorId: Number(v.patrocinadorId),
        palestrantes: palestrantes.map((p) => p.id),
      })
      try {
        localStorage.setItem(ULTIMO_LOCAL, v.localId)
      } catch {
        // Lembrar o local é só conveniência.
      }
      toast.success(editando ? 'Evento atualizado' : 'Evento criado')
      // O evento é o próximo passo: link de inscrição, QR Codes e telão ficam lá.
      navigate(
        resultado.id ? `/admin/eventos/${resultado.id}` : '/admin/eventos'
      )
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : 'Não foi possível salvar o evento.'
      )
    } finally {
      setSalvando(false)
    }
  }

  const dataSelecionada = deDataIso(v.data)
  const partes = v.data
    ? getTicketDateParts(v.data, v.horarioInicio || null)
    : null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  return (
    <div className="w-full max-w-[76rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <HistoryBackButton label="Voltar" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {editando ? 'Editar evento' : 'Criar evento'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            A prévia ao lado mostra o evento como os participantes vão ver.
          </p>
        </div>
        {!editando && eventos.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CopyPlus className="size-4" />}
            onClick={() => setCopiando(true)}
          >
            Copiar de um evento anterior
          </Button>
        )}
      </div>

      {erro && (
        <Alert
          variant="error"
          title="Não foi possível salvar"
          onClose={() => setErro(null)}
        >
          {erro}
        </Alert>
      )}

      {carregando ? (
        <AdminEventFormSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6 items-start">
          <form noValidate onSubmit={salvar} className="flex flex-col gap-6">
            <Secao titulo="Sobre o quê?">
              <Input
                id={idCampo('tema')}
                label="Tema"
                required
                placeholder="Ex.: Oficina de Git para iniciantes"
                value={v.tema}
                error={erros.tema}
                onChange={(e) => alterar('tema', e.target.value)}
              />
              <div>
                <label htmlFor={idCampo('descricao')} className={rotuloClasse}>
                  Descrição
                </label>
                <Textarea
                  id={idCampo('descricao')}
                  rows={3}
                  placeholder="O que vai acontecer, quem vai falar e para quem é"
                  value={v.descricao}
                  onChange={(e) => alterar('descricao', e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor={idCampo('disciplinaId')}
                  className={rotuloClasse}
                >
                  Disciplina
                  <Obrigatorio />
                </label>
                <SelectCadastro
                  id={idCampo('disciplinaId')}
                  valor={v.disciplinaId}
                  onChange={(x) => alterar('disciplinaId', x)}
                  placeholder="Escolha a disciplina"
                  opcoes={disciplinas.map((d) => ({
                    valor: String(d.id),
                    rotulo: d.nome,
                  }))}
                  erro={erros.disciplinaId}
                />
                <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                  A presença conta para a medalha dessa disciplina.
                </p>
              </div>
            </Secao>

            <Secao titulo="Quando?">
              <div>
                <label htmlFor={idCampo('data')} className={rotuloClasse}>
                  Data
                  <Obrigatorio />
                </label>
                <Popover
                  open={calendarioAberto}
                  onOpenChange={setCalendarioAberto}
                >
                  <PopoverTrigger asChild>
                    <button
                      id={idCampo('data')}
                      type="button"
                      aria-invalid={Boolean(erros.data)}
                      aria-describedby={
                        erros.data ? `${idCampo('data')}-erro` : undefined
                      }
                      className={`${campoClasse} flex items-center justify-between gap-2 text-left sm:max-w-xs`}
                    >
                      <span
                        className={
                          dataSelecionada
                            ? ''
                            : 'text-[var(--color-text-muted)]'
                        }
                      >
                        {dataSelecionada
                          ? formatoData.format(dataSelecionada)
                          : 'Escolha a data'}
                      </span>
                      <CalendarIcon
                        size={16}
                        className="shrink-0 text-[var(--color-text-muted)]"
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={dataSelecionada}
                      defaultMonth={dataSelecionada}
                      disabled={{ before: hoje }}
                      onSelect={(dia) => {
                        alterar('data', dia ? paraDataIso(dia) : '')
                        setCalendarioAberto(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Erro id={`${idCampo('data')}-erro`} mensagem={erros.data} />
              </div>

              <div>
                <span className={rotuloClasse}>Horário</span>
                <div
                  className="flex flex-wrap gap-2 mb-3"
                  role="group"
                  aria-label="Períodos comuns"
                >
                  {ATALHOS_PERIODO.map((p) => {
                    const ativo =
                      v.horarioInicio === p.inicio && v.horarioFim === p.fim
                    return (
                      <button
                        key={p.rotulo}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => usarPeriodo(p.inicio, p.fim)}
                        className={`${chipClasse} ${ativo ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary-text)]' : ''}`}
                      >
                        {p.rotulo}{' '}
                        <span className="text-[var(--color-text-muted)] tabular-nums">
                          {hora(p.inicio)}–{hora(p.fim)}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                  <Input
                    id={idCampo('horarioInicio')}
                    label="Início"
                    type="time"
                    required
                    value={v.horarioInicio}
                    error={erros.horarioInicio}
                    onChange={(e) => alterar('horarioInicio', e.target.value)}
                  />
                  <Input
                    id={idCampo('horarioFim')}
                    label="Término"
                    type="time"
                    required
                    value={v.horarioFim}
                    error={erros.horarioFim}
                    onChange={(e) => alterar('horarioFim', e.target.value)}
                  />
                </div>
                <div
                  className="flex flex-wrap items-center gap-2 mt-3"
                  role="group"
                  aria-label="Duração a partir do início"
                >
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Duração:
                  </span>
                  {DURACOES.map((d) => (
                    <button
                      key={d.rotulo}
                      type="button"
                      onClick={() => usarDuracao(d.minutos)}
                      className={chipClasse}
                    >
                      {d.rotulo}
                    </button>
                  ))}
                </div>
              </div>

              {efeitos && (
                <ul className="flex flex-col gap-1.5 rounded-md bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-text-secondary)]">
                  <li className="flex gap-2">
                    <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {efeitos.inscricoes}
                  </li>
                  <li className="flex gap-2">
                    <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {efeitos.presenca}
                  </li>
                </ul>
              )}
            </Secao>

            <Secao titulo="Onde?">
              <div>
                <span className={rotuloClasse}>Modalidade</span>
                <FiltroSegmentado<ModalidadeEvento>
                  rotulo="Modalidade do evento"
                  valor={v.modalidade}
                  onChange={(m) => alterar('modalidade', m)}
                  opcoes={[
                    { valor: 'PRESENCIAL', rotulo: 'Presencial' },
                    { valor: 'ONLINE', rotulo: 'On-line' },
                    { valor: 'HIBRIDO', rotulo: 'Híbrido' },
                  ]}
                />
              </div>
              <div className="sm:max-w-md">
                <label htmlFor={idCampo('localId')} className={rotuloClasse}>
                  Local
                  <Obrigatorio />
                </label>
                <SelectCadastro
                  id={idCampo('localId')}
                  valor={v.localId}
                  onChange={(x) => alterar('localId', x)}
                  placeholder="Escolha o local"
                  opcoes={locais.map((l) => ({
                    valor: String(l.id),
                    rotulo: l.capacidade
                      ? `${l.nome} · ${l.capacidade} vagas`
                      : l.nome,
                  }))}
                  erro={erros.localId}
                />
                {local && !erros.localId && (
                  <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                    {local.capacidade
                      ? `As inscrições fecham ao atingir ${local.capacidade} vagas, a capacidade do local.`
                      : 'Esse local não tem capacidade cadastrada.'}
                  </p>
                )}
              </div>
              {choques.length > 0 && (
                <Alert variant="warning" title="Choque de horário">
                  <p className="flex gap-2">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    <span>
                      {local?.nome ?? 'O local'} já tem{' '}
                      {choques.map((c) => `“${c.tema}”`).join(', ')} nesse
                      horário. Dá para salvar mesmo assim.
                    </span>
                  </p>
                </Alert>
              )}
            </Secao>

            <Secao titulo="Quem apresenta?">
              <div className="sm:max-w-md">
                <label
                  htmlFor={idCampo('palestrantes')}
                  className={rotuloClasse}
                >
                  Palestrantes
                </label>
                <SeletorPalestrantes
                  id={idCampo('palestrantes')}
                  descricaoId={idCampo('palestrantes-ajuda')}
                  pessoas={pessoas}
                  selecionados={palestrantes}
                  onChange={setPalestrantes}
                />
                <p
                  id={idCampo('palestrantes-ajuda')}
                  className="mt-1.5 text-xs text-[var(--color-text-muted)]"
                >
                  Opcional. Quem palestra não ocupa vaga da plateia e, com a
                  presença marcada na conclusão, ganha a medalha de Palestrante.
                </p>
              </div>
            </Secao>

            <Secao titulo="Quem apoia?">
              <div className="sm:max-w-md">
                <label
                  htmlFor={idCampo('patrocinadorId')}
                  className={rotuloClasse}
                >
                  Patrocinador
                  <Obrigatorio />
                </label>
                <SelectCadastro
                  id={idCampo('patrocinadorId')}
                  valor={v.patrocinadorId}
                  onChange={(x) => alterar('patrocinadorId', x)}
                  placeholder="Escolha o patrocinador"
                  opcoes={patrocinadores.map((p) => ({
                    valor: String(p.id),
                    rotulo: p.nome,
                  }))}
                  erro={erros.patrocinadorId}
                />
              </div>
            </Secao>

            <div className="flex flex-wrap justify-end gap-3">
              <ButtonLink
                to={id ? `/admin/eventos/${id}` : '/admin/eventos'}
                variant="ghost"
              >
                Cancelar
              </ButtonLink>
              <Button
                type="submit"
                isLoading={salvando}
                loadingText="Salvando…"
              >
                {editando ? 'Salvar alterações' : 'Criar evento'}
              </Button>
            </div>
          </form>

          <aside
            aria-label="Prévia do evento"
            className="flex flex-col gap-3 lg:sticky lg:top-6"
          >
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Como o participante vai ver
            </p>
            <Ticket
              dia={partes?.dia ?? '–'}
              mes={partes?.mes ?? 'data'}
              horario={partes?.horario ?? null}
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Inscrições abertas</Badge>
                {formatModalidade(v.modalidade) && (
                  <Badge variant="default">
                    {formatModalidade(v.modalidade)}
                  </Badge>
                )}
              </div>
              <p
                className={`font-display text-xl font-bold leading-tight mt-3 break-words ${v.tema.trim() ? '' : 'text-[var(--color-text-muted)]'}`}
              >
                {v.tema.trim() || 'Tema do evento'}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
                {[
                  v.horarioInicio && v.horarioFim
                    ? `${v.horarioInicio} às ${v.horarioFim}`
                    : 'Horário a definir',
                  local?.nome ?? 'Local a definir',
                ].join(' · ')}
              </p>
              {disciplina && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {disciplina.nome}
                </p>
              )}
            </Ticket>
          </aside>
        </div>
      )}

      <Dialog open={copiando} onOpenChange={setCopiando}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Copiar de um evento anterior</DialogTitle>
            <DialogDescription>
              Tema, descrição, horários, local, disciplina e patrocinador vêm
              preenchidos. A data fica para você escolher.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="search"
            placeholder="Buscar pelo tema"
            aria-label="Buscar evento pelo tema"
            value={buscaCopia}
            onChange={(e) => setBuscaCopia(e.target.value)}
          />
          <ul className="max-h-80 overflow-y-auto divide-y -mx-2">
            {anteriores.map((e) => {
              const dia = deDataIso(e.data ?? '')
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => copiar(e)}
                    className="w-full rounded-sm px-2 py-2.5 text-left hover:bg-[var(--color-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
                  >
                    <span className="block font-semibold break-words">
                      {e.tema}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {[
                        dia ? formatoCurto.format(dia) : null,
                        e.horarioInicio?.slice(0, 5),
                        typeof e.local === 'object' ? e.local?.nome : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </button>
                </li>
              )
            })}
            {anteriores.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-[var(--color-text-muted)]">
                Nenhum evento com esse tema.
              </li>
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  )
}
