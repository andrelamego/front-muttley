import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth'
import { getParticipantDashboardData } from '../api/painelApi'
import type {
  ParticipantDashboardData,
  ParticipacaoResumo,
} from '../domain/painelTypes'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Alert,
  Spinner,
  CalendarIcon,
} from '../../../shared/ui'

const parseEventDateTime = (dateStr: string, timeStr: string): Date | null => {
  if (!dateStr || !timeStr) return null
  // Evitar desvios de timezone: assumir partes YYYY-MM-DD e HH:mm
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, hours || 0, minutes || 0)
}

const isWithinPresenceWindow = (
  dateStr?: string,
  inicioStr?: string,
  fimStr?: string
): boolean => {
  if (!dateStr || !inicioStr || !fimStr) return false
  const inicio = parseEventDateTime(dateStr, inicioStr)
  const fim = parseEventDateTime(dateStr, fimStr)
  if (!inicio || !fim) return false

  const agora = new Date()
  const dezMinAntes = new Date(inicio.getTime() - 10 * 60 * 1000)
  const dezMinDepois = new Date(fim.getTime() + 10 * 60 * 1000)

  return agora >= dezMinAntes && agora <= dezMinDepois
}

export const ParticipantDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [data, setData] = useState<ParticipantDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const result = await getParticipantDashboardData()
      setData(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao carregar os dados de suas participações.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getParticipantDashboardData()
      .then((result) => {
        if (isMounted) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Falha ao carregar os dados de suas participações.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Identifica o próximo evento ordenando inscrições por data e horário
  const proximasParticipacoes = (data?.participacoes || [])
    .filter((p) => p.evento && p.evento.status !== 'CANCELADO')
    .sort((a, b) => {
      const dateA =
        a.evento?.data && a.evento?.horarioInicio
          ? `${a.evento.data}T${a.evento.horarioInicio}`
          : ''
      const dateB =
        b.evento?.data && b.evento?.horarioInicio
          ? `${b.evento.data}T${b.evento.horarioInicio}`
          : ''
      return dateA.localeCompare(dateB)
    })

  const proxima = proximasParticipacoes[0] as ParticipacaoResumo | undefined
  const proximoEvento = proxima?.evento

  const presencaDisponivel = proximoEvento
    ? isWithinPresenceWindow(
        proximoEvento.data,
        proximoEvento.horarioInicio,
        proximoEvento.horarioFim
      )
    : false

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Saudação e Perfil */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Olá, {user?.nome?.split(' ')[0] || 'Participante'}!
          </h1>
          <p className="text-sm text-slate-600">
            Acompanhe seus eventos, confirmações de presença e certificados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="info" size="md">
            {user?.role === 'ADMIN' ? 'Administrador' : 'Participante'}
          </Badge>
          <Link to="/eventos">
            <Button variant="outline" size="sm">
              Explorar Eventos
            </Button>
          </Link>
        </div>
      </header>

      {/* Alerta de erro */}
      {error && (
        <Alert variant="error" title="Erro ao carregar dados">
          <div className="flex flex-col gap-2">
            <p>{error}</p>
            <div>
              <Button variant="secondary" size="sm" onClick={loadData}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Estado de Carregamento */}
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500"
          role="status"
        >
          <Spinner size="lg" className="text-blue-600" />
          <p className="text-sm font-medium">Carregando suas informações...</p>
        </div>
      )}

      {/* Conteúdo Principal */}
      {!isLoading && data && (
        <>
          {/* Próximo Compromisso / Evento em Destaque */}
          <section aria-labelledby="proximo-evento-titulo">
            <h2
              id="proximo-evento-titulo"
              className="text-base font-bold text-slate-900 mb-3"
            >
              Próximo Compromisso
            </h2>

            {proximoEvento ? (
              <Card className="border-blue-200 bg-white shadow-sm hover:border-blue-300 transition-all">
                <CardHeader className="bg-blue-50/50 flex-row items-center justify-between">
                  <Badge variant="info">{proximoEvento.modalidade}</Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    Inscrição #{proxima?.inscricao}
                  </span>
                </CardHeader>
                <CardContent className="p-5 flex flex-col gap-4">
                  <div>
                    <CardTitle as="h3" className="text-lg text-slate-900">
                      {proximoEvento.tema}
                    </CardTitle>
                    {proximoEvento.descricao && (
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {proximoEvento.descricao}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg">
                    <div>
                      <span className="block text-slate-400 font-medium">
                        Data:
                      </span>
                      <strong className="text-slate-800">
                        {proximoEvento.data}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">
                        Horário:
                      </span>
                      <strong className="text-slate-800">
                        {proximoEvento.horarioInicio} às{' '}
                        {proximoEvento.horarioFim}
                      </strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="block text-slate-400 font-medium">
                        Local / Disciplina:
                      </span>
                      <strong className="text-slate-800">
                        {proximoEvento.local ||
                          proximoEvento.disciplina ||
                          'Campus FATEC'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                    <Link
                      to={`/eventos/${proximoEvento.id}`}
                      className="sm:w-auto w-full"
                    >
                      <Button variant="outline" size="md" fullWidth>
                        Ver Detalhes
                      </Button>
                    </Link>

                    {presencaDisponivel ? (
                      <Link
                        to={`/eventos/${proximoEvento.id}/confirmar-presenca`}
                        className="sm:w-auto w-full"
                      >
                        <Button
                          variant="primary"
                          size="md"
                          fullWidth
                          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-600"
                        >
                          Confirmar Presença Agora
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="secondary"
                        size="md"
                        disabled
                        title="A confirmação de presença abre 10 minutos antes do início do evento."
                      >
                        Presença Indisponível
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-dashed border-slate-300 p-8 text-center">
                <div className="max-w-sm mx-auto flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarIcon size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Nenhuma inscrição ativa
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Você ainda não se inscreveu em nenhum evento programado.
                    Consulte a lista de eventos abertos para garantir sua vaga.
                  </p>
                  <Link to="/eventos" className="mt-2">
                    <Button variant="primary" size="md">
                      Explorar Eventos Disponíveis
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </section>

          {/* Resumo de Participações e Conquistas */}
          <section aria-labelledby="metricas-resumo-titulo">
            <h2
              id="metricas-resumo-titulo"
              className="text-base font-bold text-slate-900 mb-3"
            >
              Minhas Conquistas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-white">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Inscrições Totais
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {data.participacoes.length}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Participações registradas
                </p>
              </Card>

              <Link
                to="/user/certificados"
                className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
              >
                <Card className="p-4 bg-white transition-all group-hover:border-blue-300 group-hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Certificados
                    </span>
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                      Ver todos &rarr;
                    </span>
                  </div>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    {data.certificados.length}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Emitidos e disponíveis para download
                  </p>
                </Card>
              </Link>

              <Link
                to="/user/medalhas"
                className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
              >
                <Card className="p-4 bg-white transition-all group-hover:border-amber-300 group-hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Medalhas
                    </span>
                    <span className="text-xs font-semibold text-amber-600 group-hover:underline">
                      Ver todas &rarr;
                    </span>
                  </div>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {data.medalhas.length}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Reconhecimentos de participação
                  </p>
                </Card>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
