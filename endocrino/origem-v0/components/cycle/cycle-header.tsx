import { Activity, Baby, CalendarDays, Pause, Play, RotateCcw } from 'lucide-react'
import { EXERCISE } from '@/lib/cycle/exercise'
import { Button } from '@/components/ui/button'
import { CYCLE_SPEEDS, type CycleSim } from '@/hooks/use-cycle-sim'
import { formatTime, type HormoneId, type Mode, type Snapshot } from '@/lib/cycle/model'
import { cn } from '@/lib/utils'
import { HormoneChip, type Trend } from './hormone-chip'

const MODES: { id: Mode; label: string; Icon: typeof Baby }[] = [
  { id: 'ciclo', label: 'Ciclo menstrual', Icon: CalendarDays },
  { id: 'gestacao', label: 'Gestação', Icon: Baby },
]

type Props = {
  sim: CycleSim
  snap: Snapshot
  trends: Record<HormoneId, Trend>
  monitor: HormoneId[]
}

export function CycleHeader({ sim, snap, trends, monitor }: Props) {
  const speeds = CYCLE_SPEEDS[sim.mode]
  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight text-balance">Ciclo e Gestação</h1>
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {formatTime(sim.mode, sim.day, sim.cycleLength)}
              {sim.mode === 'ciclo' && ` · Ciclo ${sim.cycle}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div role="radiogroup" aria-label="Velocidade da simulação" className="hidden rounded-lg bg-muted p-0.5 sm:flex">
              {speeds.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  role="radio"
                  aria-checked={i === sim.speedIndex}
                  onClick={() => sim.setSpeed(i)}
                  className={cn(
                    'h-9 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors',
                    i === sim.speedIndex && 'bg-card text-foreground shadow-sm',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-11 sm:hidden"
              onClick={() => sim.setSpeed((sim.speedIndex + 1) % speeds.length)}
              aria-label={`Velocidade: ${speeds[sim.speedIndex].label}. Toque para alterar`}
            >
              <span className="font-mono text-xs">{speeds[sim.speedIndex].label}</span>
            </Button>
            <Button variant="outline" size="icon" className="size-11" onClick={sim.reset} aria-label="Voltar ao início">
              <RotateCcw className="size-4" />
            </Button>
            <Button size="icon" className="size-11" onClick={sim.toggle} aria-label={sim.running ? 'Pausar' : 'Continuar'}>
              {sim.running ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={sim.mode === 'gestacao'}
          aria-label={`Modo: ${sim.mode === 'ciclo' ? 'Ciclo menstrual' : 'Gestação'}. Toque para alternar`}
          onClick={() => sim.setMode(sim.mode === 'ciclo' ? 'gestacao' : 'ciclo')}
          className="relative grid h-12 w-full grid-cols-2 rounded-xl bg-muted p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden
            className={cn(
              'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-foreground shadow-sm transition-transform duration-300 motion-reduce:transition-none',
              sim.mode === 'gestacao' && 'translate-x-full',
            )}
          />
          {MODES.map(({ id, label, Icon }) => (
            <span
              key={id}
              className={cn(
                'relative flex items-center justify-center gap-2 text-sm font-medium transition-colors',
                sim.mode === id ? 'text-background' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </span>
          ))}
        </button>

        {sim.exercise && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-primary px-3 py-1.5 text-primary-foreground">
            <p className="flex min-w-0 items-center gap-2 text-xs font-medium">
              <Activity className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                Exercício de intensidade {EXERCISE[sim.exercise].label.toLowerCase()} · valores pós-treino
              </span>
            </p>
            <button
              type="button"
              onClick={() => sim.setExercise(null)}
              className="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold underline-offset-2 hover:underline"
            >
              Repouso
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2" aria-label="Hormônios principais">
          {monitor.map((id) => (
            <HormoneChip key={id} id={id} value={snap[id]} trend={trends[id]} />
          ))}
        </div>
      </div>
    </header>
  )
}
