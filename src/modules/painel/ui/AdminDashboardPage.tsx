import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboardData } from '../api/painelApi'
import type { AdminDashboardData } from '../domain/painelTypes'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Alert,
  Spinner,
} from '../../../shared/ui'

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const result = await getAdminDashboardData()
      setData(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao carregar indicadores administrativos.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getAdminDashboardData()
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
              : 'Falha ao carregar indicadores administrativos.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Barra de Título e Ações Principais do Administrador */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Administração Geral
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Painel de Controle
          </h1>
          <p className="text-sm text-slate-500">
            Visão consolidada dos eventos acadêmicos, presença e emissão de
            certificados
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={loadData}
            isLoading={isLoading}
          >
            Atualizar
          </Button>
          <Link to="/admin/eventos/novo">
            <Button variant="primary" size="md">
              + Novo Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerta de erro */}
      {error && (
        <Alert variant="error" title="Erro de integração com a API">
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
          className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500"
          role="status"
        >
          <Spinner size="lg" className="text-blue-600" />
          <p className="text-sm font-medium">
            Carregando indicadores do servidor...
          </p>
        </div>
      )}

      {/* Indicadores Operacionais */}
      {!isLoading && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Eventos Ativos
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-900">
                  {data.eventosAtivos}
                </span>
                <Badge variant="info">Total</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Cadastrados em andamento ou futuros
              </p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Eventos nos Próximos 7 Dias
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-blue-600">
                  {data.eventosAtivosNaSemana}
                </span>
                <Badge variant="warning">Próximos</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Exigem preparação de local e presença
              </p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Certificados (30 dias)
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-900">
                  {data.certificadosUltimos30Dias}
                </span>
                <Badge
                  variant={
                    data.variacaoCertificadosUltimos30Dias >= 0
                      ? 'success'
                      : 'danger'
                  }
                >
                  {data.variacaoCertificadosUltimos30Dias >= 0 ? '+' : ''}
                  {data.variacaoCertificadosUltimos30Dias}%
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Variação em relação aos 30 dias anteriores
              </p>
            </Card>

            <Card className="p-5 bg-white border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ações Rápidas
              </span>
              <div className="flex flex-col gap-2.5 mt-2">
                <Link
                  to="/admin/eventos/novo"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>+</span> Cadastrar Novo Evento
                </Link>
                <Link
                  to="/admin/eventos"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>&rarr;</span> Gerenciar Todos os Eventos
                </Link>
                <Link
                  to="/eventos"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>&rarr;</span> Acessar Catálogo Público
                </Link>
              </div>
            </Card>
          </div>

          {/* Próximos Eventos Operacionais */}
          <section aria-labelledby="tabela-proximos-eventos">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle as="h2" id="tabela-proximos-eventos">
                    Próximos Eventos Programados
                  </CardTitle>
                  <CardDescription>
                    Eventos ordenados cronologicamente por horário de início
                  </CardDescription>
                </div>

                <Link to="/admin/eventos">
                  <Button variant="ghost" size="sm">
                    Ver todos os eventos →
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto">
                {data.proximosEventos.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Nenhum evento futuro programado no momento.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase">
                        <th scope="col" className="py-3 px-4">
                          Tema do Evento
                        </th>
                        <th scope="col" className="py-3 px-4">
                          Data e Horário
                        </th>
                        <th scope="col" className="py-3 px-4">
                          Modalidade
                        </th>
                        <th scope="col" className="py-3 px-4">
                          Status
                        </th>
                        <th scope="col" className="py-3 px-4 text-right">
                          Operações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.proximosEventos.map((evt) => (
                        <tr
                          key={evt.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-slate-900">
                            <div className="font-semibold text-slate-900 line-clamp-1">
                              {evt.tema}
                            </div>
                            <div className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-1">
                              {evt.disciplina && (
                                <span className="font-medium text-slate-600">
                                  {evt.disciplina} &bull;{' '}
                                </span>
                              )}
                              {evt.local ||
                                (evt.modalidade === 'ONLINE'
                                  ? 'Online'
                                  : 'Presencial')}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs">
                            <span className="font-semibold text-slate-800">
                              {evt.data}
                            </span>
                            <div className="text-slate-500">
                              {evt.horarioInicio || '--:--'} às{' '}
                              {evt.horarioFim || '--:--'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="default" size="sm">
                              {evt.modalidade}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                evt.status === 'EM_ANDAMENTO'
                                  ? 'warning'
                                  : evt.status === 'FINALIZADO'
                                    ? 'success'
                                    : 'default'
                              }
                              size="sm"
                            >
                              {evt.status === 'CRIADO'
                                ? 'Programado'
                                : evt.status === 'EM_ANDAMENTO'
                                  ? 'Em Andamento'
                                  : evt.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Link to={`/admin/eventos/${evt.id}/editar`}>
                                <Button variant="outline" size="sm">
                                  Editar
                                </Button>
                              </Link>
                              {evt.status === 'EM_ANDAMENTO' && (
                                <Link to={`/admin/eventos/${evt.id}/concluir`}>
                                  <Button variant="primary" size="sm">
                                    Concluir
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Gráficos de Desempenho e Medalhas com dados reais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certificados por Evento */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle as="h3">Certificados Emitidos por Evento</CardTitle>
                <CardDescription>
                  Eventos com maior volume de certificados gerados
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-3">
                {data.certificadosPorEvento.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Nenhum certificado emitido até o momento.
                  </p>
                ) : (
                  data.certificadosPorEvento.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span className="truncate max-w-[240px] sm:max-w-xs">
                          {item.rotulo}
                        </span>
                        <span className="font-bold text-slate-900">
                          {item.total}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, item.percentual)}%`,
                          }}
                          role="progressbar"
                          aria-valuenow={item.percentual}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Medalhas por Participante */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle as="h3">Medalhas por Participante</CardTitle>
                <CardDescription>
                  Alunos e participantes com maior engajamento acadêmico
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-3">
                {data.medalhasPorParticipante.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Nenhuma medalha registrada até o momento.
                  </p>
                ) : (
                  data.medalhasPorParticipante.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span className="truncate max-w-[240px] sm:max-w-xs">
                          {item.rotulo}
                        </span>
                        <span className="font-bold text-amber-700">
                          {item.total} medalhas
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, item.percentual)}%`,
                          }}
                          role="progressbar"
                          aria-valuenow={item.percentual}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
