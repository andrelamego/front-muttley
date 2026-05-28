import type { ReactNode } from 'react'
import { cx } from './utils'

type DataTableProps = {
  children: ReactNode
  className?: string
}

export function DataTable({ children, className }: DataTableProps) {
  return <div className={cx('ui-table-wrap', className)}>{children}</div>
}
