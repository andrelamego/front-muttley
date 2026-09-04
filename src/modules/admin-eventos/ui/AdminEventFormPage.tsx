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
} from '../../../shared/ui'
import { AdminEventFormSkeleton } from './skeletons'
import { HistoryBackButton } from '../../../shared/navigation'

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
        <span className="text-xs font-semibold text-[var(--color-primary-text)] uppercase tracking-wider">
          {isEditing ? 'Atualização de Cadastro' : 'Novo Registro'}
        </span>
        <h1 className="text-2xl lg:text-3xl font-black text-[var(--color-text-primary)] mt-1">
          {isEditing ? 'Editar Evento Acadêmico' : 'Cadastrar Novo Evento'}
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
              {/* Tema / Título */}
              <div>
                <label
                  htmlFor={temaId}
                  className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                >
                  Tema / Título do Evento *
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
                <label
                  htmlFor={descricaoId}
                  className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                >
                  Descrição e Objetivos
                </label>
                <textarea
                  id={descricaoId}
                  rows={3}
                  className="w-full rounded-none border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
                  placeholder="Descreva a programação, palestrantes ou tópicos que serão abordados..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              {/* Grid: Data, Horário de Início e Horário de Fim */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor={dataId}
                    className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                  >
                    Data do Evento *
                  </label>
                  <Input
                    id={dataId}
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={inicioId}
                    className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                  >
                    Horário de Início *
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
                  <label
                    htmlFor={fimId}
                    className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                  >
                    Horário de Término *
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

              {/* Grid: Modalidade e Local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={modalidadeId}
                    className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                  >
                    Modalidade *
                  </label>
                  <select
                    id={modalidadeId}
                    value={modalidade}
                    onChange={(e) =>
                      setModalidade(e.target.value as ModalidadeEvento)
                    }
                    className="w-full h-10 rounded-none border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="ONLINE">Online</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={localIdSelect}
                    className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                  >
                    Local / Sala (Campus)
                  </label>
                  <select
                    id={localIdSelect}
                    value={localId}
                    onChange={(e) => setLocalId(e.target.value)}
                    className="w-full h-10 rounded-none border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
                  >
                    <option value="">Selecione um local cadastrado...</option>
                    {locais.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.nome}{' '}
                        {loc.capacidade
                          ? `(Capacidade: ${loc.capacidade})`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid: Disciplina e Patrocinador */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={disciplinaIdSelect}
                    className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                  >
                    Disciplina Vinculada (Opcional)
                  </label>
                  <select
                    id={disciplinaIdSelect}
                    value={disciplinaId}
                    onChange={(e) => setDisciplinaId(e.target.value)}
                    className="w-full h-10 rounded-none border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
                  >
                    <option value="">Nenhuma disciplina vinculada</option>
                    {disciplinas.map((disc) => (
                      <option key={disc.id} value={disc.id}>
                        {disc.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={patrocinadorIdSelect}
                    className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1"
                  >
                    Patrocinador / Parceiro (Opcional)
                  </label>
                  <select
                    id={patrocinadorIdSelect}
                    value={patrocinadorId}
                    onChange={(e) => setPatrocinadorId(e.target.value)}
                    className="w-full h-10 rounded-none border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
                  >
                    <option value="">Nenhum parceiro vinculado</option>
                    {patrocinadores.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.razaoSocial}
                      </option>
                    ))}
                  </select>
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
