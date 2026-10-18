import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SPEEDS } from '@/hooks/use-simulation'
import type { LabId, Labs } from '@/lib/sim/labs'
import { cn } from '@/lib/utils'
import { LabChip } from './lab-value'

type Props = {
  day: number
  running: boolean
  speedIndex: number
  labs: Labs
  monitor: LabId[]
  onToggle: () => void
  onReset: () => void
  onSpeed: (index: number) => void
}

export function SimHeader({ day, running, speedIndex, labs, monitor, onToggle, onReset, onSpeed }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight text-balance">Simulador Endócrino</h1>
            <p className="font-mono text-xs text-muted-foreground tabular-nums" aria-live="off">
              Dia {Math.floor(day).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div role="radiogroup" aria-label="Velocidade da simulação" className="hidden rounded-lg bg-muted p-0.5 sm:flex">
              {SPEEDS.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  role="radio"
                  aria-checked={i === speedIndex}
                  onClick={() => onSpeed(i)}
                  className={cn(
                    'h-9 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors',
                    i === speedIndex && 'bg-card text-foreground shadow-sm',
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
              onClick={() => onSpeed((speedIndex + 1) % SPEEDS.length)}
              aria-label={`Velocidade: ${SPEEDS[speedIndex].label}. Toque para alterar`}
            >
              <span className="font-mono text-xs">{['1×', '5×', '10×'][speedIndex]}</span>
            </Button>
            <Button variant="outline" size="icon" className="size-11" onClick={onReset} aria-label="Reiniciar simulação">
              <RotateCcw className="size-4" />
            </Button>
            <Button size="icon" className="size-11" onClick={onToggle} aria-label={running ? 'Pausar' : 'Continuar'}>
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2" aria-label="Exames principais do eixo">
          {monitor.map((id) => (
            <LabChip key={id} id={id} value={labs[id]} />
          ))}
        </div>
      </div>
    </header>
  )
}
