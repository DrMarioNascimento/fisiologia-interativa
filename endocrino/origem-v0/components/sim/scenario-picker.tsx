import { FlaskConical } from 'lucide-react'
import type { AxisId } from '@/lib/sim/axes'
import { SCENARIOS, type Scenario } from '@/lib/sim/scenarios'
import { cn } from '@/lib/utils'

type Props = {
  axis: AxisId
  activeId: string
  onSelect: (scenario: Scenario) => void
}

export function ScenarioPicker({ axis, activeId, onSelect }: Props) {
  const options = SCENARIOS.filter((s) => s.id === 'normal' || s.axis === axis)
  const active = SCENARIOS.find((s) => s.id === activeId)

  return (
    <section aria-labelledby="scenario-title" className="flex flex-col gap-2.5">
      <h2 id="scenario-title" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <FlaskConical className="size-3.5" aria-hidden />
        Casos clínicos
      </h2>
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
        <div className="flex w-max gap-2">
          {options.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === activeId}
              onClick={() => onSelect(s)}
              className={cn(
                'h-11 shrink-0 rounded-lg border px-3 text-sm transition-colors',
                s.id === activeId
                  ? 'border-primary bg-accent font-medium text-accent-foreground'
                  : 'border-dashed bg-transparent text-muted-foreground hover:border-solid hover:text-foreground',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground text-pretty">
        {activeId === 'custom'
          ? 'Parâmetros personalizados — observe como o eixo busca um novo equilíbrio.'
          : active?.description}
      </p>
    </section>
  )
}
