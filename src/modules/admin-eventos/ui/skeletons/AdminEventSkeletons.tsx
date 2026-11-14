import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  TicketSkeleton,
} from '../../../../shared/ui'

const superficie = 'rounded-md bg-[var(--color-bg-surface)]'

/** Campo com rótulo, do jeito que aparece nos formulários. */
const Campo: React.FC<{ largura?: string }> = ({ largura = 'w-full' }) => (
  <div className={largura}>
    <SkeletonBlock className="mb-2 h-3.5 w-24" />
    <SkeletonBlock className="h-11 w-full rounded-sm" />
  </div>
)

export const AdminEventListSkeleton: React.FC = () => (
  <SkeletonRegion label="Carregando eventos acadêmicos">
    <div className={`${superficie} overflow-hidden`}>
      <div className="hidden grid-cols-5 gap-6 bg-[var(--color-bg-subtle)] px-4 py-3.5 md:grid">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonBlock key={i} className="h-3.5 w-3/4" />
        ))}
      </div>
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {Array.from({ length: 6 }, (_, linha) => (
          <div
            key={linha}
            className="grid grid-cols-2 gap-4 p-4 md:grid-cols-5 md:items-center"
          >
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-4/5" />
              <SkeletonBlock className="h-3 w-2/3" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
            <SkeletonBlock className="hidden h-6 w-24 rounded-full md:block" />
            <SkeletonBlock className="hidden h-6 w-20 rounded-full md:block" />
            <div className="col-span-2 flex justify-end gap-2 md:col-span-1">
              <SkeletonBlock className="h-9 w-24" />
              <SkeletonBlock className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonRegion>
)

/** Formulário em seções por pergunta, com a prévia do ingresso ao lado. */
export const AdminEventFormSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando dados do evento"
    className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_22rem]"
  >
    <div className="flex flex-col gap-6">
      {[3, 3, 2].map((campos, i) => (
        <div key={i} className={`${superficie} space-y-4 p-5 sm:p-6`}>
          <SkeletonBlock className="h-6 w-32" />
          {Array.from({ length: campos }, (_, j) => (
            <Campo
              key={j}
              largura={j === 0 ? 'w-full' : 'w-full sm:max-w-md'}
            />
          ))}
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-3">
      <SkeletonBlock className="h-4 w-44" />
      <TicketSkeleton compact={false} />
    </div>
  </SkeletonRegion>
)

/** Conclusão: cabeçalho com o ingresso, presenças à esquerda, assinatura e resumo à direita. */
export const AdminEventConcludeSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando dados para conclusão"
    className="flex flex-col gap-6"
  >
    <div className="space-y-4">
      <SkeletonBlock className="h-4 w-16" />
      <SkeletonBlock className="h-9 w-56" />
      <SkeletonBlock className="h-4 w-96 max-w-full" />
    </div>
    <TicketSkeleton />
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <div className={`${superficie} p-5 sm:p-6`}>
        <div className="mb-5 flex items-start gap-3">
          <SkeletonBlock circular className="size-7 shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="h-3.5 w-72 max-w-full" />
          </div>
        </div>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
          <SkeletonBlock className="h-10 w-full sm:max-w-xs" />
          <SkeletonBlock className="h-10 w-72 max-w-full rounded-full" />
        </div>
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 py-3.5">
              <SkeletonBlock className="size-5 shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-1/2" />
                <SkeletonBlock className="h-3 w-1/3" />
              </div>
              <SkeletonBlock className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className={`${superficie} space-y-4 p-5 sm:p-6`}>
          <SkeletonBlock className="h-5 w-32" />
          <div className="h-32 rounded-md border-2 border-dashed border-[var(--color-border-strong)]" />
        </div>
        <div className={`${superficie} space-y-4 p-5 sm:p-6`}>
          <div className="grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </div>
    </div>
  </SkeletonRegion>
)
