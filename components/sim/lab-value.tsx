import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatLab, LAB_DEFS, labStatus, type LabId } from '@/lib/sim/labs'
import { cn } from '@/lib/utils'

export { formatLab }

export const STATUS_STYLES = {
  baixo: 'bg-low/10 text-low',
  alto: 'bg-high/10 text-high',
  normal: 'bg-muted text-foreground',
} as const

export function StatusIcon({ id, value, className }: { id: LabId; value: number; className?: string }) {
  const status = labStatus(id, value)
  if (status === 'baixo') return <ArrowDown className={cn('size-3.5', className)} aria-label="baixo" />
  if (status === 'alto') return <ArrowUp className={cn('size-3.5', className)} aria-label="alto" />
  return null
}

export function LabChip({ id, value }: { id: LabId; value: number }) {
  const def = LAB_DEFS[id]
  const status = labStatus(id, value)
  return (
    <div className={cn('flex min-w-0 flex-col rounded-lg px-2.5 py-1.5', STATUS_STYLES[status])}>
      <span className="text-[11px] font-medium leading-tight opacity-80">{def.short}</span>
      <span className="flex items-center gap-0.5 font-mono text-sm font-semibold tabular-nums leading-tight">
        {formatLab(id, value)}
        <StatusIcon id={id} value={value} />
      </span>
      <span className="text-[10px] leading-tight opacity-70">{def.unit}</span>
    </div>
  )
}
