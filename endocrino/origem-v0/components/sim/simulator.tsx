'use client'

import { useState } from 'react'
import { SiteNav } from '@/components/site-nav'
import { useSimulation } from '@/hooks/use-simulation'
import { AXIS_MAP, type AxisId } from '@/lib/sim/axes'
import { interpret } from '@/lib/sim/interpret'
import type { Scenario } from '@/lib/sim/scenarios'
import { AxisDiagram } from './axis-diagram'
import { AxisTabs } from './axis-tabs'
import { ControlPanel } from './control-panel'
import { InterpretationCard } from './interpretation-card'
import { LabPanel } from './lab-panel'
import { ScenarioPicker } from './scenario-picker'
import { SimHeader } from './sim-header'
import { TrendChart } from './trend-chart'

export function Simulator() {
  const sim = useSimulation()
  const [axisId, setAxisId] = useState<AxisId>('tireoide')
  const axis = AXIS_MAP[axisId]
  const result = interpret(axisId, sim.labs, sim.params)

  const selectScenario = (scenario: Scenario) => {
    sim.applyScenario(scenario)
    if (scenario.id !== 'normal') setAxisId(scenario.axis)
  }

  return (
    <div className="min-h-dvh">
      <SiteNav current="eixos" />
      <SimHeader
        day={sim.sim.t}
        running={sim.running}
        speedIndex={sim.speedIndex}
        labs={sim.labs}
        monitor={axis.monitor}
        onToggle={sim.toggle}
        onReset={sim.reset}
        onSpeed={sim.setSpeed}
      />
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:col-start-1">
          <AxisTabs value={axisId} onChange={setAxisId} />
          <ScenarioPicker axis={axisId} activeId={sim.scenarioId} onSelect={selectScenario} />
        </div>
        <div className="lg:col-start-1">
          <AxisDiagram axis={axis} labs={sim.labs} />
        </div>
        <div className="lg:col-start-1">
          <InterpretationCard result={result} />
        </div>
        <aside className="lg:sticky lg:top-36 lg:col-start-2 lg:row-span-5 lg:row-start-1 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto">
          <ControlPanel axis={axis} params={sim.params} onChange={sim.setParam} onResetAll={sim.resetParams} />
        </aside>
        <div className="lg:col-start-1">
          <TrendChart axis={axis} history={sim.history} />
        </div>
        <div className="lg:col-start-1">
          <LabPanel ids={axis.panel} labs={sim.labs} />
        </div>
        <footer className="pb-6 text-xs text-muted-foreground text-pretty lg:col-start-1">
          Modelo didático simplificado de fisiologia endócrina. Os valores de referência são aproximados e não substituem
          avaliação clínica.
          <p className="mt-3 font-semibold">Simuladores interativos utilizados nas disciplinas de Fisiologia Humana do Prof. Dr. Mário César Nascimento ©</p>
        </footer>
      </main>
    </div>
  )
}
