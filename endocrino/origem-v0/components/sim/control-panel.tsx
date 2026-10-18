import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatParam, PARAM_DEFS, type AxisConfig } from '@/lib/sim/axes'
import { DEFAULT_PARAMS, type ParamKey, type Params } from '@/lib/sim/model'
import { cn } from '@/lib/utils'

type Props = {
  axis: AxisConfig
  params: Params
  onChange: (key: ParamKey, value: number) => void
  onResetAll: () => void
}

const PARAM_KEYS = Object.keys(DEFAULT_PARAMS) as ParamKey[]

export function ControlPanel({ axis, params, onChange, onResetAll }: Props) {
  const changed = PARAM_KEYS.some((k) => params[k] !== DEFAULT_PARAMS[k])
  const changedElsewhere = PARAM_KEYS.some((k) => !axis.params.includes(k) && params[k] !== DEFAULT_PARAMS[k])

  return (
    <section aria-labelledby="controls-title" className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="controls-title" className="flex items-center gap-2 text-base font-semibold">
          <SlidersHorizontal className="size-4 text-primary" aria-hidden />
          Intervenções
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-11 text-muted-foreground"
          disabled={!changed}
          onClick={onResetAll}
          aria-label="Restaurar todos os parâmetros para o normal"
        >
          Restaurar tudo
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">
        Ajuste e acompanhe o eixo buscar um novo equilíbrio ao longo dos dias.
      </p>
      {changedElsewhere && (
        <p className="mt-2 rounded-md bg-accent px-2.5 py-1.5 text-xs text-accent-foreground text-pretty">
          Há parâmetros alterados em outros eixos que também influenciam este.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-5">
        {axis.params.map((key) => {
          const def = PARAM_DEFS[key]
          const value = params[key]
          const isDefault = value === DEFAULT_PARAMS[key]
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium leading-snug">{def.label}</span>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums',
                    isDefault ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground',
                  )}
                >
                  {formatParam(key, value)}
                </span>
              </div>
              <div className="flex h-11 items-center">
                <Slider
                  value={[value]}
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  thumbLabel={def.label}
                  onValueChange={(v) => onChange(key, Array.isArray(v) ? v[0] : v)}
                />
              </div>
              <p className="-mt-1.5 text-xs text-muted-foreground">{def.hint}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
