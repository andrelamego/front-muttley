import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getEventoPublicoPorIdApi,
  criarInscricaoPublicaApi,
} from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import { useAuth } from '../../auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Input,
  Alert,
  Spinner,
} from '../../../shared/ui'

export const PublicEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuth()

  const [evento, setEvento] = useState<EventoPublico | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Formulário de Inscrição
  const [nome, setNome] = useState(user?.nome || '')
  const [cpf, setCpf] = useState(user?.cpf || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<{
    message: string
    inscricao: number
  } | null>(null)

  const loadEvento = useCallback(async () => {
    if (!id) return
    setError(null)
    setIsLoading(true)
    try {
      const data = await getEventoPublicoPorIdApi(id)
      setEvento(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Não foi possível encontrar as informações deste evento.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    let isMounted = true
    getEventoPublicoPorIdApi(id)
      .then((data) => {
        if (isMounted) {
          setEvento(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível encontrar as informações deste evento.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const handleInscricao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const result = await criarInscricaoPublicaApi(id, {
        nomeCompleto: nome.trim(),
        cpf: cpf.trim(),
        email: email.trim().toLowerCase(),
      })

      setSuccessInfo({
        message: result.message || 'Inscrição realizada com sucesso!',
        inscricao: result.inscricao,
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError(
          'Falha ao concluir a inscrição. Verifique os dados informados.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Botão de Retorno */}
      <div>
        <Link
          to="/eventos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1 py-0.5"
        >
          ← Voltar para lista de eventos
        </Link>
      </div>

      {/* Alerta de erro de carregamento */}
      {error && (
        <Alert variant="error" title="Evento não encontrado">
          <div className="flex flex-col gap-2">
            <p>{error}</p>
            <div>
              <Button variant="secondary" size="sm" onClick={loadEvento}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Carregando */}
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500"
          role="status"
        >
          <Spinner size="lg" className="text-blue-600" />
          <p className="text-sm font-medium">
            Carregando detalhes do evento...
          </p>
        </div>
      )}

      {!isLoading && evento && (
        <div className="flex flex-col gap-6">
          {/* Cartão de Detalhes do Evento */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge
                  variant={evento.inscricoesEncerradas ? 'danger' : 'success'}
                >
                  {evento.inscricoesEncerradas
                    ? 'Inscrições Encerradas'
                    : 'Inscrições Abertas'}
                </Badge>
                <Badge variant="default">{evento.modalidade}</Badge>
              </div>

              <Link to={`/eventos/${evento.id}/confirmar-presenca`}>
                <Button variant="ghost" size="sm">
                  Confirmar Presença no Evento →
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-6 flex flex-col gap-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {evento.tema}
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {evento.descricao || 'Sem descrição adicional fornecida.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl text-sm border border-slate-100">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Data Programada
                  </span>
                  <strong className="text-slate-900 mt-1 block">
                    {evento.data}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Horário
                  </span>
                  <strong className="text-slate-900 mt-1 block">
                    {evento.horarioInicio} às {evento.horarioFim}
                  </strong>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Localização / Polo
                  </span>
                  <strong className="text-slate-900 mt-1 block truncate">
                    {evento.local || evento.disciplina || 'Campus FATEC'}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Inscrição */}
          <section aria-labelledby="inscricao-titulo">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle as="h2" id="inscricao-titulo">
                  Inscrição no Evento
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {successInfo ? (
                  <Alert
                    variant="success"
                    title="Inscrição Confirmada!"
                    className="p-5"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-base font-semibold">
                        Sua inscrição #{successInfo.inscricao} foi registrada
                        com sucesso.
                      </p>
                      <p className="text-sm">
                        Um email de confirmação foi enviado com os dados deste
                        evento. Guarde seu número de inscrição para a
                        confirmação de presença.
                      </p>
                      <div className="pt-2 flex gap-3">
                        {isAuthenticated ? (
                          <Link to="/user/inicio">
                            <Button variant="primary" size="sm">
                              Ir para Meu Painel
                            </Button>
                          </Link>
                        ) : (
                          <Link to="/login">
                            <Button variant="primary" size="sm">
                              Acessar Minha Conta
                            </Button>
                          </Link>
                        )}
                        <Link to={`/eventos/${evento.id}/confirmar-presenca`}>
                          <Button variant="outline" size="sm">
                            Tela de Presença
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Alert>
                ) : evento.inscricoesEncerradas ? (
                  <Alert
                    variant="warning"
                    title="Inscrições Encerradas"
                    className="p-5"
                  >
                    As vagas para este evento foram totalmente preenchidas ou o
                    período de inscrição foi finalizado pelo início da
                    atividade.
                  </Alert>
                ) : (
                  <form
                    onSubmit={handleInscricao}
                    className="flex flex-col gap-4 max-w-lg"
                  >
                    {submitError && (
                      <Alert
                        variant="error"
                        title="Falha na inscrição"
                        onClose={() => setSubmitError(null)}
                      >
                        {submitError}
                      </Alert>
                    )}

                    <Input
                      label="Nome Completo"
                      type="text"
                      name="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      disabled={isSubmitting}
                    />

                    <Input
                      label="CPF (apenas números ou formatado)"
                      type="text"
                      name="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      required
                      disabled={isSubmitting}
                    />

                    <Input
                      label="Email de Confirmação"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                      disabled={isSubmitting}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmitting}
                      loadingText="Processando inscrição..."
                      className="mt-2"
                    >
                      Confirmar Inscrição Gratuita
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  )
}
