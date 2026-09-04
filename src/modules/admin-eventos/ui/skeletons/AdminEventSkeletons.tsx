import React from 'react'
import {
  SkeletonBlock,
  SkeletonRegion,
  SkeletonText,
} from '../../../../shared/ui'

export const AdminEventListSkeleton: React.FC = () => (
  <SkeletonRegion label="Carregando eventos acadêmicos">
    <div className="surface-depth overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="hidden grid-cols-5 gap-6 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-4 md:grid">
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonBlock key={index} className="h-3 w-4/5" />
        ))}
      </div>
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {Array.from({ length: 5 }, (_, row) => (
          <div
            key={row}
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
            <SkeletonBlock className="hidden h-6 w-24 md:block" />
            <SkeletonBlock className="hidden h-6 w-20 md:block" />
            <div className="col-span-2 flex justify-end gap-2 md:col-span-1">
              <SkeletonBlock className="h-9 w-9" />
              <SkeletonBlock className="h-9 w-9" />
              <SkeletonBlock className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonRegion>
)

export const AdminEventFormSkeleton: React.FC = () => (
  <SkeletonRegion label="Carregando dados do evento">
    <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="border-b border-[var(--color-border-subtle)] p-5">
        <SkeletonBlock className="h-6 w-52" />
      </div>
      <div className="space-y-5 p-6">
        <div>
          <SkeletonBlock className="mb-2 h-3 w-44" />
          <SkeletonBlock className="h-11 w-full border border-[var(--color-border)]" />
        </div>
        <div>
          <SkeletonBlock className="mb-2 h-3 w-40" />
          <SkeletonBlock className="h-24 w-full border border-[var(--color-border)]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
              <SkeletonBlock className="mb-2 h-3 w-28" />
              <SkeletonBlock className="h-11 w-full border border-[var(--color-border)]" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <SkeletonBlock className="mb-2 h-3 w-32" />
              <SkeletonBlock className="h-11 w-full border border-[var(--color-border)]" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5">
        <SkeletonBlock className="h-11 w-24" />
        <SkeletonBlock className="h-11 w-36" />
      </div>
    </div>
  </SkeletonRegion>
)

export const AdminEventConcludeSkeleton: React.FC = () => (
  <SkeletonRegion
    label="Carregando dados para conclusão"
    className="flex flex-col gap-6"
  >
    <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="flex-1 space-y-3">
          <SkeletonBlock className="h-7 w-3/5" />
          <SkeletonText lines={2} widths={['70%', '52%']} />
        </div>
        <SkeletonBlock className="h-20 w-full sm:w-48" />
      </div>
    </div>
    <div className="surface-depth border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] p-5">
        <SkeletonBlock className="h-6 w-56" />
        <SkeletonBlock className="h-9 w-36" />
      </div>
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid grid-cols-12 items-center gap-4 p-4">
            <SkeletonBlock className="col-span-1 h-5 w-5" />
            <div className="col-span-7 space-y-2">
              <SkeletonBlock className="h-4 w-3/5" />
              <SkeletonBlock className="h-3 w-2/5" />
            </div>
            <SkeletonBlock className="col-span-4 h-6 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 sm:grid-cols-2">
        <SkeletonBlock className="h-24 w-full" />
        <div className="flex items-end justify-end gap-3">
          <SkeletonBlock className="h-11 w-24" />
          <SkeletonBlock className="h-11 w-52" />
        </div>
      </div>
    </div>
  </SkeletonRegion>
)
