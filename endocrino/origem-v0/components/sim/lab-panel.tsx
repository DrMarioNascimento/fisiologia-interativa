import { LAB_DEFS, labStatus, type LabId, type Labs } from '@/lib/sim/labs'
import { cn } from '@/lib/utils'
import { formatLab, StatusIcon } from './lab-value'

function rangePosition(value: number, low: number, high: number) {
  const lo = Math.log(low / 2)
  const hi = Math.log(high * 2)
  return Math.min(1, Math.max(0, (Math.log(Math.max(value, 1e-6)) - lo) / (hi - lo)))
}

function RangeBar({ id, value }: { id: LabId; value: number }) {
  const { low, high } = LAB_DEFS[id]
  const status = labStatus(id, value)
  const markerColor = status === 'baixo' ? 'bg-low' : status === 'alto' ? 'bg-high' : 'bg-ok'

  if (low === undefined || high === undefined) {
    return (
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    )
  }
  const start = rangePosition(low, low, high) * 100
  const end = rangePosition(high, low, high) * 100
  const pos = rangePosition(value, low, high) * 100
  return (
    <div className="relative h-1.5 w-full rounded-full bg-muted" aria-hidden>
      <div className="absolute inset-y-0 rounded-full bg-ok/25" style={{ left: `${start}%`, width: `${end - start}%` }} />
      <div
        className={cn('absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card', markerColor)}
        style={{ left: `${pos}%` }}
      />
    </div>
  )
}

export function LabPanel({ ids, labs }: { ids: LabId[]; labs: Labs }) {
  return (
    <section aria-labelledby="labs-title" className="rounded-xl border bg-card p-4">
      <h2 id="labs-title" className="text-base font-semibold">
        Painel laboratorial
      </h2>
      <ul className="mt-3 flex flex-col divide-y">
        {ids.map((id) => {
          const def = LAB_DEFS[id]
          const status = labStatus(id, labs[id])
          return (
            <li key={id} className="flex flex-col gap-2 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm">{def.label}</span>
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-0.5 font-mono text-sm font-semibold tabular-nums',
                    status === 'baixo' && 'text-low',
                    status === 'alto' && 'text-high',
                  )}
                >
                  {formatLab(id, labs[id])}
                  <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">{def.unit}</span>
                  <StatusIcon id={id} value={labs[id]} />
                </span>
              </div>
              <RangeBar id={id} value={labs[id]} />
              {def.low !== undefined && def.high !== undefined && (
                <span className="-mt-1 text-[11px] text-muted-foreground">
                  {'Referência: '}
                  {def.low.toLocaleString('pt-BR')}–{def.high.toLocaleString('pt-BR')}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
