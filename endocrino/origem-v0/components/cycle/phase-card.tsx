import { ArrowRightCircle, MinusCircle, PlusCircle } from 'lucide-react'
import type { FeedbackType, PhaseInfo } from '@/lib/cycle/phases'

const ICON: Record<FeedbackType, typeof MinusCircle> = {
  negativa: MinusCircle,
  positiva: PlusCircle,
  estímulo: ArrowRightCircle,
}

const LABEL: Record<FeedbackType, string> = {
  negativa: 'Retroalimentação negativa',
  positiva: 'Retroalimentação positiva',
  estímulo: 'Estímulo',
}

export function PhaseCard({ phase }: { phase: PhaseInfo }) {
  return (
    <section aria-labelledby="phase-title" aria-live="polite" className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{phase.period}</p>
      <h2 id="phase-title" className="mt-0.5 text-base font-semibold leading-tight text-balance">
        {phase.title}
      </h2>
      <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed">
        {phase.text.map((t) => (
          <p key={t} className="text-pretty">
            {t}
          </p>
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2 border-t pt-4">
        {phase.feedback.map((f) => {
          const Icon = ICON[f.type]
          return (
            <li key={f.text} className="flex gap-2.5 text-sm">
              <Icon
                className={f.type === 'positiva' ? 'mt-0.5 size-4 shrink-0 text-high' : 'mt-0.5 size-4 shrink-0 text-primary'}
                aria-hidden
              />
              <p className="text-pretty">
                <span className="font-medium">{LABEL[f.type]}: </span>
                <span className="text-muted-foreground">{f.text}</span>
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
