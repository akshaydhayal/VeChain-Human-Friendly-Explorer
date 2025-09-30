import { ReactNode } from 'react'
import clsx from 'clsx'

type StatCardProps = {
  title: string
  value: ReactNode
  subtitle?: string
  className?: string
}

export function StatCard({ title, value, subtitle, className }: StatCardProps) {
  return (
    <div className={clsx('card p-4', className)}>
      <div className="text-xs uppercase tracking-wide text-neutral-400">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-neutral-400">{subtitle}</div> : null}
    </div>
  )
}


