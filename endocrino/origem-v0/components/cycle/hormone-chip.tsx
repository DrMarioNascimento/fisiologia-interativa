import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { formatHormone, GLAND_COLOR, HORMONES, type HormoneId } from '@/lib/cycle/model'
import { cn } from '@/lib/utils'

export type Trend = -1 | 0 | 1

export function trendOf(now: number, before: number): Trend {
  const rel = (now - before) / Math.max(Math.abs(before), 1e-3)
  if (rel > 0.02) return 1
  if (rel < -0.02) return -1
  return 0
}

const TREND = {
  1: { Icon: ArrowUpRight, label: 'subindo' },
  0: { Icon: ArrowRight, label: 'estável' },
  [-1]: { Icon: ArrowDownRight, label: 'caindo' },
} as const

export function HormoneChip({
  id,
  value,
  trend,
  className,
}: {
  id: HormoneId
  value: number
  trend: Trend
  className?: string
}) {
  const def = HORMONES[id]
  const { Icon, label } = TREND[trend]
  return (
    <div className={cn('flex min-w-0 flex-col rounded-lg bg-muted px-2.5 py-1.5', className)}>
      <span className="flex items-center gap-1.5 text-[11px] font-medium leading-tight text-muted-foreground">
        <span className="size-1.5 shrink-0 rounded-full" style={{ background: GLAND_COLOR[def.gland] }} aria-hidden />
        <span className="truncate">{def.short}</span>
      </span>
      <span className="flex items-center gap-0.5 font-mono text-sm font-semibold tabular-nums leading-tight">
        {formatHormone(id, value)}
        <Icon
          className={cn('size-3.5 shrink-0', trend === 1 && 'text-high', trend === -1 && 'text-low', trend === 0 && 'text-muted-foreground')}
          aria-label={label}
        />
      </span>
      <span className="truncate text-[10px] leading-tight text-muted-foreground">{def.unit}</span>
    </div>
  )
}
