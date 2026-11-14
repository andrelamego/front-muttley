import React, { useCallback, useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { getMinhasConquistasApi } from '../api/conquistasApi'
import {
  NOME_NIVEL,
  faltam,
  separarDisputas,
  unidade,
  type Conquistas,
  type Disputa,
  type Nivel,
  type Trilha,
} from '../domain/conquistas'
import { Alert, Button, ButtonLink } from '../../../shared/ui'
import { PARTICIPANT_EVENTS_PATH } from '../../eventos'
import { MedalGridSkeleton } from './skeletons'
import { MoedaTrilha } from './MoedaTrilha'
import { MedalhaEspecial } from './MedalhaEspecial'

const COR_NIVEL: Record<Nivel, string> = {
  BRONZE: 'var(--color-medal-bronze)',
  PRATA: 'var(--color-medal-prata)',
  OURO: 'var(--color-medal-ouro)',
}

const ordinal = (n: number) => `${n}º`
const PRESENCAS = { metrica: 'PRESENCAS' } as const

const CartaoTrilha: React.FC<{ trilha: Trilha }> = ({ trilha }) => (
  <li className="rounded-md bg-[var(--color-bg-surface)] p-4 flex items-center gap-4">
    <MoedaTrilha trilha={trilha} />
    <div className="min-w-0 flex-1">
      <h3 className="font-display text-lg font-bold leading-tight break-words">
        {trilha.titulo}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
        {trilha.nivel ? NOME_NIVEL[trilha.nivel] : 'Ainda sem medalha'},{' '}
        {unidade(trilha, trilha.valor)}
      </p>
      {/* Os três marcos da trilha; os alcançados ganham a cor do metal */}
      <ol className="flex gap-1.5 mt-2.5" aria-label="Marcos da trilha">
        {(['BRONZE', 'PRATA', 'OURO'] as const).map((n, i) => {
          const alcancado = trilha.valor >= trilha.marcos[i]
          return (
            <li
              key={n}
              className="rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
              style={
                alcancado
                  ? {
                      background: COR_NIVEL[n],
                      color: 'var(--color-signal-ink)',
                    }
                  : {
                      background: 'var(--color-bg-muted)',
                      color: 'var(--color-text-muted)',
                    }
              }
              title={`${NOME_NIVEL[n]}: ${unidade(trilha, trilha.marcos[i])}`}
            >
              {trilha.metrica === 'HORAS'
                ? `${trilha.marcos[i]} h`
                : trilha.marcos[i]}
            </li>
          )
        })}
      </ol>
      <p className="text-xs text-[var(--color-text-muted)] mt-2">
        {trilha.proximoNivel && trilha.proximoMarco !== null
          ? `${faltam(trilha, trilha.proximoMarco - trilha.valor)} para ${NOME_NIVEL[trilha.proximoNivel].toLowerCase()}`
          : 'Nível máximo alcançado'}
      </p>
    </div>
  </li>
)

const LinhaDisputa: React.FC<{ disputa: Disputa }> = ({ disputa }) => {
  const falta = disputa.minimo - disputa.valor
  return (
    <li className="flex items-center gap-3 py-3">
      <Trophy
        className="size-5 shrink-0 text-[var(--color-primary-text)]"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold break-words">{disputa.titulo}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {falta > 0
            ? `${faltam(PRESENCAS, falta)} para entrar na disputa`
            : `Você está em ${ordinal(disputa.posicao)} lugar`}{' '}
          · {unidade(PRESENCAS, disputa.valor)}
        </p>
      </div>
    </li>
  )
}

export const UserMedalsPage: React.FC = () => {
  const [dados, setDados] = useState<Conquistas | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    setErro(null)
    getMinhasConquistasApi()
      .then(setDados)
      .catch((e: unknown) =>
        setErro(
          e instanceof Error
            ? e.message
            : 'Não foi possível carregar suas medalhas.'
        )
      )
  }, [])

  useEffect(() => {
    let ativo = true
    getMinhasConquistasApi()
      .then((d) => ativo && setDados(d))
      .catch((e: unknown) => {
        if (ativo)
          setErro(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar suas medalhas.'
          )
      })
    return () => {
      ativo = false
    }
  }, [])

  const semPresenca = dados?.trilhas.every((t) => t.valor === 0) ?? false

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Medalhas</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">
          Cada presença em evento concluído faz suas medalhas subirem de nível.
          As especiais saem no fim de cada semestre.
        </p>
      </div>

      {erro && (
        <Alert variant="error" title="Não foi possível carregar">
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
      )}

      {!dados && !erro && <MedalGridSkeleton />}

      {dados && semPresenca && (
        <section className="rounded-md bg-[var(--color-bg-surface)] p-6 flex flex-col items-start gap-3">
          <h2 className="font-display text-xl font-bold">
            Sua primeira medalha está a um evento de distância
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Inscreva-se, confirme presença no dia e, quando o evento for
            concluído, a medalha de bronze em Participação é sua.
          </p>
          <ButtonLink to={PARTICIPANT_EVENTS_PATH}>
            Ver eventos abertos
          </ButtonLink>
        </section>
      )}

      {dados && dados.especiais.length > 0 && (
        <section aria-labelledby="especiais" className="space-y-3">
          <h2 id="especiais" className="font-display text-xl font-bold">
            Especiais
          </h2>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dados.especiais.map((e) => {
              const nome = e.semestre
                ? e.titulo.replace(` ${e.semestre}`, '')
                : e.titulo
              const [ano, periodo] = e.semestre?.split('/') ?? []
              return (
                <li
                  key={e.titulo}
                  className={`especial especial--${e.tipo.toLowerCase()} rounded-md p-5 flex items-center gap-5`}
                >
                  <MedalhaEspecial especial={e} />
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-bold leading-tight break-words">
                      {nome}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {e.descricao}
                    </p>
                    {ano && (
                      <p className="mt-2.5 inline-block rounded-full bg-[var(--color-bg-muted)] px-2.5 py-0.5 text-xs font-semibold">
                        {periodo}º semestre de {ano}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {dados && dados.disputas.length > 0 && (
        <section
          aria-labelledby="disputa"
          className="rounded-md bg-[var(--color-bg-surface)] p-5"
        >
          <h2 id="disputa" className="font-display text-xl font-bold">
            Disputa do semestre {dados.disputas[0].semestre}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Quem tiver mais presenças até o fim do semestre leva a medalha
            especial. Empates premiam todos.
          </p>
          {(() => {
            const { principais, outras } = separarDisputas(dados.disputas)
            return (
              <>
                {principais.length > 0 && (
                  <ul className="divide-y mt-2">
                    {principais.map((d) => (
                      <LinhaDisputa key={d.titulo} disputa={d} />
                    ))}
                  </ul>
                )}
                {outras.length > 0 && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-3 pt-3 border-t">
                    Em{' '}
                    {outras.length === 1
                      ? 'outra disciplina'
                      : `outras ${outras.length} disciplinas`}{' '}
                    você ainda precisa de mais presenças para entrar na disputa
                    de Especialista.
                  </p>
                )}
              </>
            )
          })()}
        </section>
      )}

      {dados && !semPresenca && (
        <section aria-labelledby="trilhas" className="space-y-3">
          <h2 id="trilhas" className="font-display text-xl font-bold">
            Trilhas
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dados.trilhas.map((t) => (
              <CartaoTrilha key={t.chave} trilha={t} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
