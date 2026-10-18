import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Stethoscope, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CycleSim } from '@/hooks/use-cycle-sim'
import { EXERCISE, EXERCISE_LEVELS } from '@/lib/cycle/exercise'
import { formatHormone, HORMONES, type HormoneId, type Snapshot } from '@/lib/cycle/model'
import { cn } from '@/lib/utils'

const LEVEL_BARS = { baixa: 1, moderada: 2, alta: 3 } as const

type Props = {
  sim: CycleSim
  rest: Snapshot
  active: Snapshot
  ids: HormoneId[]
}

export function ExercisePanel({ sim, rest, active, ids }: Props) {
  const def = sim.exercise ? EXERCISE[sim.exercise] : null

  return (
    <section aria-labelledby="exercise-title" className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="exercise-title" className="flex items-center gap-2 text-base font-semibold">
          <Activity className="size-4 text-primary" aria-hidden />
          Exercício físico
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Resposta aguda
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground text-pretty">
        Aplica o efeito de uma sessão de 45–60 min no momento atual da simulação. O tempo pausa para comparar com o
        repouso.
      </p>

      <div role="radiogroup" aria-label="Intensidade do exercício" className="mt-3 grid grid-cols-3 gap-2">
        {EXERCISE_LEVELS.map((level) => {
          const selected = sim.exercise === level
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => sim.setExercise(selected ? null : level)}
              className={cn(
                'flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm font-medium transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:border-primary/50',
              )}
            >
              <span className="flex items-end gap-0.5" aria-hidden>
                {[1, 2, 3].map((b) => (
                  <span
                    key={b}
                    className={cn(
                      'w-1.5 rounded-sm',
                      b <= LEVEL_BARS[level] ? (selected ? 'bg-primary-foreground' : 'bg-primary') : 'bg-current opacity-20',
                    )}
                    style={{ height: 4 + b * 4 }}
                  />
                ))}
              </span>
              {EXERCISE[level].label}
            </button>
          )
        })}
      </div>

      {def ? (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium">{def.intensity}</p>
            <p className="text-xs text-muted-foreground">{def.examples}</p>
          </div>

          <table className="w-full text-sm">
            <caption className="sr-only">Hormônios em repouso e após o exercício</caption>
            <thead>
              <tr className="text-left text-[11px] text-muted-foreground">
                <th scope="col" className="pb-1 font-medium">
                  Hormônio
                </th>
                <th scope="col" className="pb-1 text-right font-medium">
                  Repouso
                </th>
                <th scope="col" className="pb-1 text-right font-medium">
                  Pós-treino
                </th>
                <th scope="col" className="pb-1 text-right font-medium">
                  Δ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ids.map((id) => {
                const delta = rest[id] > 1e-6 ? (active[id] - rest[id]) / rest[id] : 0
                const pct = Math.round(delta * 100)
                const Icon = pct > 1 ? ArrowUpRight : pct < -1 ? ArrowDownRight : ArrowRight
                return (
                  <tr key={id}>
                    <th scope="row" className="py-1.5 text-left font-medium">
                      {HORMONES[id].short}
                    </th>
                    <td className="py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                      {formatHormone(id, rest[id])}
                    </td>
                    <td className="py-1.5 text-right font-mono font-semibold tabular-nums">
                      {formatHormone(id, active[id])}
                    </td>
                    <td
                      className={cn(
                        'py-1.5 text-right font-mono text-xs tabular-nums',
                        pct > 1 && 'text-high',
                        pct < -1 && 'text-low',
                        Math.abs(pct) <= 1 && 'text-muted-foreground',
                      )}
                    >
                      <span className="inline-flex items-center justify-end gap-0.5">
                        <Icon className="size-3" aria-hidden />
                        {pct > 0 ? '+' : ''}
                        {pct}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <p className="text-sm text-pretty">{def.summary}</p>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-xs text-muted-foreground">
            {def.mechanisms.map((m) => (
              <li key={m} className="text-pretty">
                {m}
              </li>
            ))}
          </ul>

          <div className="flex gap-2 rounded-lg bg-accent p-3 text-accent-foreground">
            <Stethoscope className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="text-xs font-semibold">Aplicação clínica</p>
              <p className="mt-0.5 text-xs text-pretty">{def.clinical[sim.mode]}</p>
            </div>
          </div>

          <Button variant="outline" className="h-11 w-full" onClick={() => sim.setExercise(null)}>
            <X className="size-4" aria-hidden />
            Voltar ao repouso
          </Button>
        </div>
      ) : null}
    </section>
  )
}
