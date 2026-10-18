import { Link2, MinusCircle, PlusCircle } from 'lucide-react'
import type { AxisConfig, Feedback } from '@/lib/sim/axes'
import { computeLabs, type LabId, type Labs } from '@/lib/sim/labs'
import { BASELINE_STATE, DEFAULT_PARAMS } from '@/lib/sim/model'
import { LabChip } from './lab-value'

const BASELINE = computeLabs(BASELINE_STATE, DEFAULT_PARAMS)

function SignalArrow({ label, signal, labs }: { label: string; signal: LabId; labs: Labs }) {
  const ratio = Math.max(0, labs[signal] / Math.max(BASELINE[signal], 1e-6))
  const width = Math.min(9, Math.max(1, 3 * Math.sqrt(ratio)))
  const duration = ratio < 0.05 ? 0 : Math.min(4, Math.max(0.25, 1 / ratio))

  return (
    <div className="flex items-center gap-3 py-1 pl-5">
      <svg width="20" height="40" viewBox="0 0 20 40" aria-hidden className="shrink-0 text-primary">
        <line
          x1="10"
          y1="0"
          x2="10"
          y2="30"
          stroke="currentColor"
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray="2 6"
          className="signal-flow"
          style={{ animationDuration: duration ? `${duration}s` : undefined, animationPlayState: duration ? 'running' : 'paused', opacity: ratio < 0.05 ? 0.25 : 1 }}
        />
        <path d="M4 30 L10 38 L16 30 Z" fill="currentColor" opacity={ratio < 0.05 ? 0.25 : 1} />
      </svg>
      <span className="text-xs text-muted-foreground">
        {label}{' '}
        <span className="font-mono tabular-nums text-foreground">
          {'('}
          {ratio.toLocaleString('pt-BR', { maximumFractionDigits: ratio < 10 ? 2 : 0 })}
          {'× basal)'}
        </span>
      </span>
    </div>
  )
}

const FEEDBACK_ICON: Record<Feedback['type'], typeof MinusCircle> = {
  negativa: MinusCircle,
  positiva: PlusCircle,
  integração: Link2,
}

const FEEDBACK_LABEL: Record<Feedback['type'], string> = {
  negativa: 'Retroalimentação negativa',
  positiva: 'Retroalimentação positiva',
  integração: 'Integração entre eixos',
}

export function AxisDiagram({ axis, labs }: { axis: AxisConfig; labs: Labs }) {
  return (
    <section aria-labelledby="axis-title" className="rounded-xl border bg-card p-4">
      <h2 id="axis-title" className="text-lg font-semibold leading-tight text-balance">
        {axis.name}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">{axis.summary}</p>

      <ol className="mt-4 flex flex-col">
        {axis.stages.map((stage, i) => (
          <li key={stage.title}>
            <div className="flex flex-col gap-2.5 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs text-background">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-tight">{stage.title}</h3>
                  <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:shrink-0">
                {stage.labs.map((id) => (
                  <LabChip key={id} id={id} value={labs[id]} />
                ))}
              </div>
            </div>
            {stage.arrow && <SignalArrow label={stage.arrow.label} signal={stage.arrow.signal} labs={labs} />}
          </li>
        ))}
      </ol>

      <ul className="mt-4 flex flex-col gap-2 border-t pt-4">
        {axis.feedback.map((f) => {
          const Icon = FEEDBACK_ICON[f.type]
          return (
            <li key={f.text} className="flex gap-2.5 text-sm">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p className="text-pretty">
                <span className="font-medium">{FEEDBACK_LABEL[f.type]}: </span>
                <span className="text-muted-foreground">{f.text}</span>
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
