import { Baby, CalendarDays, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import type { CycleSim } from '@/hooks/use-cycle-sim'
import { LUTEAL_LENGTH, ovulationDay } from '@/lib/cycle/model'
import { cn } from '@/lib/utils'

export function CycleControls({ sim }: { sim: CycleSim }) {
  return (
    <section aria-labelledby="controls-title" className="rounded-xl border bg-card p-4">
      <h2 id="controls-title" className="flex items-center gap-2 text-base font-semibold">
        <SlidersHorizontal className="size-4 text-primary" aria-hidden />
        Parâmetros
      </h2>

      {sim.mode === 'ciclo' ? (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <label id="cycle-length-label" className="text-sm font-medium">
                Duração do ciclo
              </label>
              <span className="font-mono text-sm tabular-nums">{sim.cycleLength} dias</span>
            </div>
            <div className="mt-3 px-1">
              <Slider
                value={[sim.cycleLength]}
                min={21}
                max={35}
                step={1}
                thumbLabel="Duração do ciclo"
                aria-labelledby="cycle-length-label"
                onValueChange={(v) => sim.setCycleLength(Array.isArray(v) ? v[0] : v)}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-pretty">
              A fase lútea é relativamente fixa (~{LUTEAL_LENGTH} dias); o que varia é a fase folicular. Ovulação no dia{' '}
              {ovulationDay(sim.cycleLength) + 1}.
            </p>
          </div>
          <div className="rounded-lg bg-accent p-3">
            <p className="text-sm font-medium text-accent-foreground">E se houver fecundação?</p>
            <p className="mt-1 text-xs text-accent-foreground/80 text-pretty">
              Acompanhe o resgate do corpo lúteo pelo hCG, a placenta assumindo a produção hormonal, o parto e o puerpério.
            </p>
            <Button className="mt-3 h-11 w-full" onClick={() => sim.setMode('gestacao')}>
              <Baby className="size-4" aria-hidden />
              Simular gestação
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <p id="bf-label" className="text-sm font-medium">
            Amamentação no puerpério
          </p>
          <div role="radiogroup" aria-labelledby="bf-label" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-0.5">
            {[
              { value: true, label: 'Amamenta' },
              { value: false, label: 'Não amamenta' },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                role="radio"
                aria-checked={sim.breastfeeding === o.value}
                onClick={() => sim.setBreastfeeding(o.value)}
                className={cn(
                  'h-10 rounded-md text-sm font-medium text-muted-foreground transition-colors',
                  sim.breastfeeding === o.value && 'bg-card text-foreground shadow-sm',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-pretty">
            Muda prolactina, ocitocina e o retorno do GnRH, FSH e LH após o parto. O tempo é contado em semanas desde a data
            da última menstruação (DUM); a ovulação ocorre na semana 2.
          </p>
          <Button variant="outline" className="mt-2 h-11 w-full" onClick={() => sim.setMode('ciclo')}>
            <CalendarDays className="size-4" aria-hidden />
            Voltar ao ciclo menstrual
          </Button>
        </div>
      )}
    </section>
  )
}
