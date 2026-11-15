import React from 'react'
import { m } from 'motion/react'
// Arquivos importados direto, sem o índice do módulo de medalhas: ele também
// depende do de eventos, e o índice criaria um ciclo.
import { MoedaTrilha } from '../../../medalhas/ui/MoedaTrilha'
import { MedalhaEspecial } from '../../../medalhas/ui/MedalhaEspecial'
import type { Especial, Trilha } from '../../../medalhas/domain/conquistas'
import { Revelar } from './movimento'

// Exemplos para ilustrar: as regras são as mesmas do cálculo real das medalhas.
const MOEDAS: { trilha: Trilha; legenda: string }[] = [
  {
    legenda: 'Bronze em Participação',
    trilha: {
      chave: 'geral',
      titulo: 'Participação',
      metrica: 'PRESENCAS',
      valor: 4,
      nivel: 'BRONZE',
      proximoNivel: 'PRATA',
      proximoMarco: 10,
      marcos: [1, 10, 25],
    },
  },
  {
    legenda: 'Prata em Banco de Dados',
    trilha: {
      chave: 'disciplina:Banco de Dados',
      titulo: 'Banco de Dados',
      metrica: 'PRESENCAS',
      valor: 7,
      nivel: 'PRATA',
      proximoNivel: 'OURO',
      proximoMarco: 10,
      marcos: [1, 5, 10],
    },
  },
  {
    legenda: 'Ouro em horas',
    trilha: {
      chave: 'horas',
      titulo: 'Horas',
      metrica: 'HORAS',
      valor: 60,
      nivel: 'OURO',
      proximoNivel: null,
      proximoMarco: null,
      marcos: [10, 30, 60],
    },
  },
]

const ESPECIAIS: { especial: Especial; quem: string }[] = [
  {
    quem: 'Quem mais foi a eventos no semestre',
    especial: {
      tipo: 'DIAMANTE',
      titulo: 'Diamante',
      descricao: '',
      semestre: null,
    },
  },
  {
    quem: 'Quem mais foi a eventos de uma disciplina',
    especial: {
      tipo: 'ESPECIALISTA',
      titulo: 'Especialista em Banco de Dados',
      descricao: '',
      semestre: null,
    },
  },
  {
    quem: 'Quem palestrou ou organizou um evento',
    especial: {
      tipo: 'PALESTRANTE',
      titulo: 'Palestrante',
      descricao: '',
      semestre: null,
    },
  },
]

const TRILHAS = [
  ['Participação', '1, 10 e 25 presenças'],
  ['Cada disciplina', '1, 5 e 10 presenças'],
  ['Horas de evento', '10, 30 e 60 horas'],
] as const

export const SecaoMedalhas: React.FC = () => (
  <section aria-labelledby="medalhas-titulo" className="py-20 lg:py-28">
    <div className="grid items-center gap-14 lg:grid-cols-2">
      <Revelar>
        <h2
          id="medalhas-titulo"
          className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl"
        >
          Cada presença vira medalha
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Quando um evento é concluído, sua presença conta para as trilhas. Ao
          bater um marco, a medalha sobe de bronze para prata e de prata para
          ouro.
        </p>
        <dl className="mt-8 divide-y divide-[var(--color-border-subtle)] rounded-md bg-[var(--color-bg-surface)]">
          {TRILHAS.map(([trilha, marcos]) => (
            <div
              key={trilha}
              className="flex items-baseline justify-between gap-4 px-5 py-3.5"
            >
              <dt className="font-semibold">{trilha}</dt>
              <dd className="text-sm text-[var(--color-text-secondary)]">
                {marcos}
              </dd>
            </div>
          ))}
        </dl>
      </Revelar>

      <ul
        aria-label="Exemplos de medalhas de trilha"
        className="flex flex-wrap items-end justify-center gap-6 sm:gap-10"
      >
        {MOEDAS.map(({ trilha, legenda }, i) => (
          <m.li
            key={legenda}
            className="flex flex-col items-center gap-3 text-center"
            style={{ transformPerspective: 700 }}
            initial={{ opacity: 0, rotateY: 180, y: 30 }}
            whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 14,
              delay: 0.15 + i * 0.15,
            }}
          >
            <MoedaTrilha trilha={trilha} tamanho={i === 1 ? 128 : 104} />
            <span className="text-sm font-semibold">{legenda}</span>
          </m.li>
        ))}
      </ul>
    </div>

    <Revelar className="mt-20">
      <h3 className="font-display text-2xl font-bold sm:text-3xl">
        E as especiais, no fim de cada semestre
      </h3>
      <p className="mt-2 max-w-2xl text-[var(--color-text-secondary)]">
        Para entrar na disputa é preciso ter pelo menos 3 presenças no semestre.
        Empates premiam todo mundo.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {ESPECIAIS.map(({ especial, quem }) => (
          <li
            key={especial.tipo}
            className={`especial especial--${especial.tipo.toLowerCase()} flex items-center gap-4 rounded-md p-5`}
          >
            <MedalhaEspecial especial={especial} tamanho={84} />
            <span className="min-w-0">
              <span className="block font-display text-lg font-bold leading-tight">
                {especial.tipo === 'ESPECIALISTA'
                  ? 'Especialista'
                  : especial.titulo}
              </span>
              <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">
                {quem}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Revelar>
  </section>
)
