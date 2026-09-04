import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getEventosPublicosApi } from '../api/eventosApi'
import type { EventoPublico } from '../domain/eventoTypes'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Alert,
  Spinner,
  Input,
  SearchIcon,
} from '../../../shared/ui'

export const PublicEventListPage: React.FC = () => {
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadEventos = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const data = await getEventosPublicosApi()
      setEventos(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Falha ao carregar a lista pública de eventos.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getEventosPublicosApi()
      .then((data) => {
        if (isMounted) {
          setEventos(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Falha ao carregar a lista pública de eventos.'
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredEventos = eventos.filter((evt) => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      evt.tema.toLowerCase().includes(term) ||
      (evt.descricao && evt.descricao.toLowerCase().includes(term)) ||
      (evt.disciplina && evt.disciplina.toLowerCase().includes(term)) ||
      (evt.local && evt.local.toLowerCase().includes(term))
    )
  })

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Hero / Cabeçalho da página pública */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#ddc0ba]/60">
        <div>
          <span className="font-mono text-xs font-semibold text-[#6b1705] uppercase tracking-wider">
            Compêndio Acadêmico • Catálogo Geral
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1c1a] tracking-tight mt-1">
            Programação Aberta
          </h1>
          <p className="text-sm text-[#57423d] mt-1">
            Inscreva-se em palestras, workshops e simpósios com emissão de
            certificados
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            type="search"
            placeholder="Buscar por tema ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar eventos abertos"
          />
        </div>
      </div>

      {/* Alerta de erro */}
      {error && (
        <Alert variant="error" title="Não foi possível obter os eventos">
          <div className="flex flex-col gap-2">
            <p>{error}</p>
            <div>
              <Button variant="secondary" size="sm" onClick={loadEventos}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Estado de Carregamento */}
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500"
          role="status"
        >
          <Spinner size="lg" className="text-blue-600" />
          <p className="text-sm font-medium">Buscando eventos disponíveis...</p>
        </div>
      )}

      {/* Grid de Eventos */}
      {!isLoading && (
        <>
          {filteredEventos.length === 0 ? (
            <Card className="bg-white border-dashed border-slate-300 p-12 text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <SearchIcon size={24} />
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  Nenhum evento encontrado
                </h2>
                <p className="text-sm text-slate-500">
                  {searchTerm
                    ? 'Nenhum evento corresponde à busca informada. Tente outros termos.'
                    : 'Não há eventos abertos para inscrição no momento. Volte em breve!'}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpar filtro de busca
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEventos.map((evt) => (
                <Card
                  key={evt.id}
                  className="bg-white border-[#ddc0ba] flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex-row items-center justify-between gap-2 border-b border-[#f0edea]">
                    <Badge
                      variant={evt.inscricoesEncerradas ? 'danger' : 'success'}
                    >
                      {evt.inscricoesEncerradas
                        ? 'Inscrições Encerradas'
                        : 'Inscrições Abertas'}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {evt.modalidade}
                    </Badge>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3">
                    <CardTitle
                      as="h2"
                      className="text-xl text-[#1c1c1a] font-serif"
                    >
                      {evt.tema}
                    </CardTitle>

                    {evt.descricao && (
                      <p className="text-xs text-[#57423d] line-clamp-3 leading-relaxed">
                        {evt.descricao}
                      </p>
                    )}

                    <div className="bg-[#f6f3ef] rounded p-3 grid grid-cols-2 gap-2 text-xs text-[#57423d] mt-2 font-mono">
                      <div>
                        <span className="block text-[#8a726c] font-medium uppercase text-[10px]">
                          Data:
                        </span>
                        <strong className="text-[#1c1c1a]">{evt.data}</strong>
                      </div>
                      <div>
                        <span className="block text-[#8a726c] font-medium uppercase text-[10px]">
                          Horário:
                        </span>
                        <strong className="text-[#1c1c1a]">
                          {evt.horarioInicio} às {evt.horarioFim}
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[#8a726c] font-medium uppercase text-[10px]">
                          Local / Polo:
                        </span>
                        <span className="text-[#1c1c1a] truncate block font-sans">
                          {evt.local || evt.disciplina || 'Campus FATEC'}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-[#f6f3ef] border-t border-[#f0edea]">
                    <Link to={`/eventos/${evt.id}`} className="w-full">
                      <Button
                        variant={
                          evt.inscricoesEncerradas ? 'outline' : 'primary'
                        }
                        size="md"
                        fullWidth
                      >
                        {evt.inscricoesEncerradas
                          ? 'Ver Informações'
                          : 'Inscrever-se no Evento →'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
