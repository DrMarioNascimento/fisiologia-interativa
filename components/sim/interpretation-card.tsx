import { Activity, AlertTriangle } from 'lucide-react'
import type { Interpretation } from '@/lib/sim/interpret'
import { cn } from '@/lib/utils'

export function InterpretationCard({ result }: { result: Interpretation }) {
  const alert = result.tone === 'alerta'
  const Icon = alert ? AlertTriangle : Activity
  return (
    <section
      aria-live="polite"
      aria-labelledby="interp-title"
      className={cn('rounded-xl border p-4', alert ? 'border-high/30 bg-high/5' : 'border-ok/30 bg-ok/5')}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interpretação</p>
      <h2 id="interp-title" className="mt-1 flex items-center gap-2 text-base font-semibold leading-tight">
        <Icon className={cn('size-4 shrink-0', alert ? 'text-high' : 'text-ok')} aria-hidden />
        {result.title}
      </h2>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {result.points.map((p) => (
          <li key={p} className="flex gap-2 text-sm leading-relaxed text-pretty">
            <span className={cn('mt-2 size-1.5 shrink-0 rounded-full', alert ? 'bg-high' : 'bg-ok')} aria-hidden />
            {p}
          </li>
        ))}
      </ul>
    </section>
  )
}
