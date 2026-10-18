import { Slider } from '@/components/ui/slider'
import type { CycleSim } from '@/hooks/use-cycle-sim'
import { formatTime } from '@/lib/cycle/model'
import { landmarks, segments } from '@/lib/cycle/phases'
import { cn } from '@/lib/utils'

export function PhaseTimeline({ sim }: { sim: CycleSim }) {
  const segs = segments(sim.mode, sim.cycleLength)
  const marks = landmarks(sim.mode, sim.cycleLength)

  return (
    <section aria-labelledby="timeline-title" className="rounded-xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="timeline-title" className="text-base font-semibold">
          {sim.mode === 'ciclo' ? 'Linha do tempo do ciclo' : 'Linha do tempo da gestação'}
        </h2>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatTime(sim.mode, sim.day, sim.cycleLength)}
        </span>
      </div>

      <ol className="mt-3 flex h-9 overflow-hidden rounded-lg border" aria-label="Fases">
        {segs.map((s) => {
          const active = sim.day >= s.start && sim.day < s.end
          return (
            <li
              key={s.label}
              style={{ flexGrow: s.end - s.start }}
              className={cn(
                'flex min-w-0 basis-0 items-center justify-center border-r px-1 text-[11px] font-medium last:border-r-0',
                active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
              )}
              aria-current={active ? 'step' : undefined}
            >
              <span className="truncate">{s.label}</span>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 px-1">
        <Slider
          value={[sim.day]}
          min={0}
          max={sim.total - 0.01}
          step={sim.mode === 'ciclo' ? 0.25 : 1}
          thumbLabel="Dia da simulação"
          onValueChange={(v) => sim.seek(Array.isArray(v) ? v[0] : v)}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Ir para um evento">
        {marks.map((m) => (
          <button
            key={m.label}
            type="button"
            onClick={() => sim.seek(m.day)}
            className="h-9 rounded-full border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {m.label}
          </button>
        ))}
      </div>
    </section>
  )
}
