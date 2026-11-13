import React, { useState, useEffect, useId } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  getAdminEventoByIdApi,
  salvarAdminEventoApi,
  getAuxiliaresEventoApi,
} from '../api/adminEventosApi'
import type {
  ModalidadeEvento,
  DisciplinaOption,
  LocalOption,
  PatrocinadorOption,
} from '../domain/adminEventoTypes'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Alert,
  toast,
  CalendarIcon,
} from '../../../shared/ui'
import { AdminEventFormSkeleton } from './skeletons'
import { HistoryBackButton } from '../../../shared/navigation'
import { ptBR } from 'react-day-picker/locale'
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

const NENHUM = 'nenhum'
const rotuloClasse =
  'block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5'
const campoClasse =
  'w-full h-11 rounded-sm border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-3 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]'
const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })

export const AdminEventFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  // IDs para acessibilidade de formulário
  const temaId = useId()
  const descricaoId = useId()
  const dataId = useId()
  const inicioId = useId()
  const fimId = useId()
  const modalidadeId = useId()
  const localIdSelect = useId()
  const disciplinaIdSelect = useId()
  const patrocinadorIdSelect = useId()

  // Campos do formulário
  const [tema, setTema] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [calendarioAberto, setCalendarioAberto] = useState(false)
  const dataSelecionada = deDataIso(data)
  const [horarioInicio, setHorarioInicio] = useState('')
  const [horarioFim, setHorarioFim] = useState('')
  const [modalidade, setModalidade] = useState<ModalidadeEvento>('PRESENCIAL')
  const [localId, setLocalId] = useState<string>('')
  const [disciplinaId, setDisciplinaId] = useState<string>('')
  const [patrocinadorId, setPatrocinadorId] = useState<string>('')

  // Listas auxiliares
  const [locais, setLocais] = useState<LocalOption[]>([])
  const [disciplinas, setDisciplinas] = useState<DisciplinaOption[]>([])
  const [patrocinadores, setPatrocinadores] = useState<PatrocinadorOption[]>([])

  // Estados de controle
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const aux = await getAuxiliaresEventoApi()
        if (!isMounted) return
        setLocais(aux.locais)
        setDisciplinas(aux.disciplinas)
        setPatrocinadores(aux.patrocinadores)

        if (id) {
          const evt = await getAdminEventoByIdApi(id)
          if (!isMounted) return
          setTema(evt.tema || '')
          setDescricao(evt.descricao || '')
          setData(evt.data || '')
          setHorarioInicio(evt.horarioInicio || '')
          setHorarioFim(evt.horarioFim || '')
          setModalidade(evt.modalidade || 'PRESENCIAL')
          setLocalId(evt.localId ? String(evt.localId) : '')
          setDisciplinaId(evt.disciplinaId ? String(evt.disciplinaId) : '')
          setPatrocinadorId(
            evt.patrocinadorId ? String(evt.patrocinadorId) : ''
          )
        }
      } catch (err: unknown) {
        if (!isMounted) return
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Falha ao carregar dados do evento.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const errs: string[] = []

    if (!tema.trim()) {
      errs.push('O tema/título do evento é obrigatório.')
    }
    if (!data) {
      errs.push('A data do evento é obrigatória.')
    }
    if (!horarioInicio) {
      errs.push('O horário de início é obrigatório.')
    }
    if (!horarioFim) {
      errs.push('O horário de término é obrigatório.')
    }

    if (horarioInicio && horarioFim && horarioInicio >= horarioFim) {
      errs.push('O horário de término deve ser posterior ao horário de início.')
    }

    if (errs.length > 0) {
      setValidationErrors(errs)
      return
    }

    setValidationErrors([])
    setIsSaving(true)

    try {
      await salvarAdminEventoApi({
        id: id ? Number(id) : null,
        tema: tema.trim(),
        descricao: descricao.trim() || '-',
        data,
        horarioInicio,
        horarioFim,
        modalidade,
        localId: localId ? Number(localId) : null,
        disciplinaId: disciplinaId ? Number(disciplinaId) : null,
        patrocinadorId: patrocinadorId ? Number(patrocinadorId) : null,
      })

      toast.success(id ? 'Evento atualizado' : 'Evento criado')
      navigate('/admin/eventos')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao salvar evento. Verifique os dados informados.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Navegação superior e Título */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
        <HistoryBackButton label="Voltar para a página anterior" />
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
          {isEditing ? 'Editar evento' : 'Criar evento'}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Preencha os dados abaixo com o planejamento de data, horário, local e
          modalidade.
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="error" title="Erro ao salvar evento">
          {error}
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="warning" title="Atenção aos campos">
          <ul className="list-disc pl-5 text-xs space-y-1 mt-1">
            {validationErrors.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Estado de carregamento inicial */}
      {isLoading ? (
        <AdminEventFormSkeleton />
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="surface-depth bg-[var(--color-bg-surface)] border-[var(--color-border)] shadow-xs">
            <CardHeader className="border-b border-[var(--color-border-subtle)]">
              <CardTitle className="text-base font-bold text-[var(--color-text-primary)]">
                Informações Principais
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Tema */}
              <div>
                <label htmlFor={temaId} className={rotuloClasse}>
                  Tema do evento *
                </label>
                <Input
                  id={temaId}
                  type="text"
                  placeholder="Ex.: Semana de Engenharia de Software 2026"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor={descricaoId} className={rotuloClasse}>
                  Descrição
                </label>
                <Textarea
                  id={descricaoId}
                  rows={4}
                  placeholder="Programação, palestrantes e tópicos que serão abordados"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              {/* Data e horários */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor={dataId} className={rotuloClasse}>
                    Data *
                  </label>
                  <Popover
                    open={calendarioAberto}
                    onOpenChange={setCalendarioAberto}
                  >
                    <PopoverTrigger asChild>
                      <button
                        id={dataId}
                        type="button"
                        className={`${campoClasse} flex items-center justify-between gap-2 text-left`}
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
                        onSelect={(dia) => {
                          setData(dia ? paraDataIso(dia) : '')
                          setCalendarioAberto(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label htmlFor={inicioId} className={rotuloClasse}>
                    Início *
                  </label>
                  <Input
                    id={inicioId}
                    type="time"
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor={fimId} className={rotuloClasse}>
                    Término *
                  </label>
                  <Input
                    id={fimId}
                    type="time"
                    value={horarioFim}
                    onChange={(e) => setHorarioFim(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Modalidade e local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={modalidadeId} className={rotuloClasse}>
                    Modalidade *
                  </label>
                  <Select
                    value={modalidade}
                    onValueChange={(v) => setModalidade(v as ModalidadeEvento)}
                  >
                    <SelectTrigger id={modalidadeId} className={campoClasse}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor={localIdSelect} className={rotuloClasse}>
                    Local
                  </label>
                  <Select
                    value={localId || NENHUM}
                    onValueChange={(v) => setLocalId(v === NENHUM ? '' : v)}
                  >
                    <SelectTrigger id={localIdSelect} className={campoClasse}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NENHUM}>Sem local definido</SelectItem>
                      {locais.map((loc) => (
                        <SelectItem key={loc.id} value={String(loc.id)}>
                          {loc.nome}
                          {loc.capacidade ? ` · ${loc.capacidade} lugares` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Disciplina e patrocinador */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={disciplinaIdSelect} className={rotuloClasse}>
                    Disciplina (opcional)
                  </label>
                  <Select
                    value={disciplinaId || NENHUM}
                    onValueChange={(v) =>
                      setDisciplinaId(v === NENHUM ? '' : v)
                    }
                  >
                    <SelectTrigger
                      id={disciplinaIdSelect}
                      className={campoClasse}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NENHUM}>Nenhuma</SelectItem>
                      {disciplinas.map((disc) => (
                        <SelectItem key={disc.id} value={String(disc.id)}>
                          {disc.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor={patrocinadorIdSelect}
                    className={rotuloClasse}
                  >
                    Patrocinador (opcional)
                  </label>
                  <Select
                    value={patrocinadorId || NENHUM}
                    onValueChange={(v) =>
                      setPatrocinadorId(v === NENHUM ? '' : v)
                    }
                  >
                    <SelectTrigger
                      id={patrocinadorIdSelect}
                      className={campoClasse}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NENHUM}>Nenhum</SelectItem>
                      {patrocinadores.map((pat) => (
                        <SelectItem key={pat.id} value={String(pat.id)}>
                          {pat.razaoSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-[var(--color-bg-subtle)]/70 border-t border-[var(--color-border-subtle)] flex items-center justify-between p-4 sm:px-6">
              <Link to="/admin/eventos">
                <Button variant="outline" size="md" type="button">
                  Cancelar
                </Button>
              </Link>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isSaving}
                isLoading={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar Evento'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}
