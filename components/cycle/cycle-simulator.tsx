'use client'

import { SiteNav } from '@/components/site-nav'
import { useCycleSim } from '@/hooks/use-cycle-sim'
import {
  CYCLE_HORMONES,
  formatHormone,
  GLAND_COLOR,
  GLAND_LABEL,
  HORMONES,
  type HormoneId,
  PREGNANCY_HORMONES,
  snapshotAt,
  TERM_DAY,
} from '@/lib/cycle/model'
import { describePhase } from '@/lib/cycle/phases'
import { applyExercise } from '@/lib/cycle/exercise'
import { CycleControls } from './cycle-controls'
import { ExercisePanel } from './exercise-panel'
import { CycleHeader } from './cycle-header'
import { HormoneCharts } from './hormone-charts'
import { type Trend, trendOf } from './hormone-chip'
import { HormoneFlow } from './hormone-flow'
import { PhaseCard } from './phase-card'
import { PhaseTimeline } from './phase-timeline'

export function CycleSimulator() {
  const sim = useCycleSim()
  const settings = { mode: sim.mode, cycleLength: sim.cycleLength, breastfeeding: sim.breastfeeding }
  const rest = snapshotAt(sim.day, settings)
  const snap = sim.exercise ? applyExercise(rest, sim.exercise) : rest
  const before = sim.exercise ? rest : snapshotAt(Math.max(0, sim.day - (sim.mode === 'ciclo' ? 0.25 : 1)), settings)
  const ids = sim.mode === 'ciclo' ? CYCLE_HORMONES : PREGNANCY_HORMONES
  const trends = Object.fromEntries(PREGNANCY_HORMONES.map((id) => [id, trendOf(snap[id], before[id])])) as Record<
    HormoneId,
    Trend
  >
  const phase = describePhase(sim.mode, sim.day, sim.cycleLength, sim.breastfeeding)
  const placentaSource = sim.mode === 'gestacao' && sim.day >= 63 && sim.day < TERM_DAY
  const monitor: HormoneId[] =
    sim.mode === 'ciclo' ? ['lh', 'e2', 'p4'] : sim.day >= 21 && sim.day < TERM_DAY + 14 ? ['hcg', 'e2', 'p4'] : ['prl', 'oxt', 'lh']

  return (
    <div className="min-h-dvh">
      <SiteNav current="/ciclo" />
      <CycleHeader sim={sim} snap={snap} trends={trends} monitor={monitor} />
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
        <div className="lg:col-start-1">
          <PhaseTimeline sim={sim} />
        </div>
        <div className="lg:col-start-1">
          <HormoneFlow
            mode={sim.mode}
            day={sim.day}
            snap={snap}
            trends={trends}
            phase={phase}
            breastfeeding={sim.breastfeeding}
          />
        </div>
        <div className="lg:col-start-1">
          <PhaseCard phase={phase} />
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-52 lg:col-start-2 lg:row-span-5 lg:row-start-1 lg:max-h-[calc(100dvh-14rem)] lg:overflow-y-auto">
          <ExercisePanel sim={sim} rest={rest} active={snap} ids={ids} />
          <CycleControls sim={sim} />
          <section aria-labelledby="all-title" className="rounded-xl border bg-card p-4">
            <h2 id="all-title" className="text-base font-semibold">
              Painel hormonal
            </h2>
            <ul className="mt-3 flex flex-col divide-y">
              {ids.map((id) => {
                const def = HORMONES[id]
                return (
                  <li key={id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{def.short}</p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="size-1.5 rounded-full" style={{ background: GLAND_COLOR[def.gland] }} aria-hidden />
                        {placentaSource && (id === 'e2' || id === 'p4') ? 'Placenta' : GLAND_LABEL[def.gland]}
                      </p>
                    </div>
                    <p className="shrink-0 text-right font-mono text-sm tabular-nums">
                      {formatHormone(id, snap[id])}{' '}
                      <span className="text-xs text-muted-foreground">{def.unit}</span>
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        </aside>
        <div className="lg:col-start-1">
          <HormoneCharts
            mode={sim.mode}
            ids={ids}
            total={sim.total}
            day={sim.day}
            cycleLength={sim.cycleLength}
            breastfeeding={sim.breastfeeding}
            snap={snap}
          />
        </div>
        <footer className="pb-6 text-xs text-muted-foreground text-pretty lg:col-start-1">
          Modelo didático baseado em perfis hormonais médios de referência. Os valores variam entre pessoas e laboratórios e
          não substituem avaliação clínica.
        </footer>
      </main>
    </div>
  )
}
