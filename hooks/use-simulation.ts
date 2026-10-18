'use client'

import { useEffect, useReducer } from 'react'
import { advance, BASELINE_STATE, DEFAULT_PARAMS, type ParamKey, type Params, type SimState } from '@/lib/sim/model'
import { computeLabs, type Labs } from '@/lib/sim/labs'
import type { Scenario } from '@/lib/sim/scenarios'

export type HistoryPoint = Labs & { t: number }

export const SPEEDS = [
  { label: '1 dia/s', daysPerTick: 0.1 },
  { label: '5 dias/s', daysPerTick: 0.5 },
  { label: '10 dias/s', daysPerTick: 1 },
] as const

const TICK_MS = 100
const MAX_HISTORY = 400

type SimStore = {
  sim: SimState
  params: Params
  history: HistoryPoint[]
  running: boolean
  speedIndex: number
  scenarioId: string
}

type Action =
  | { type: 'tick' }
  | { type: 'toggle' }
  | { type: 'reset' }
  | { type: 'speed'; index: number }
  | { type: 'param'; key: ParamKey; value: number }
  | { type: 'scenario'; scenario: Scenario }

const point = (sim: SimState, params: Params): HistoryPoint => ({ t: sim.t, ...computeLabs(sim, params) })

function initialStore(): SimStore {
  return {
    sim: BASELINE_STATE,
    params: DEFAULT_PARAMS,
    history: [point(BASELINE_STATE, DEFAULT_PARAMS)],
    running: true,
    speedIndex: 1,
    scenarioId: 'normal',
  }
}

function reducer(store: SimStore, action: Action): SimStore {
  switch (action.type) {
    case 'tick': {
      const sim = advance(store.sim, store.params, SPEEDS[store.speedIndex].daysPerTick)
      const history = [...store.history, point(sim, store.params)]
      return { ...store, sim, history: history.length > MAX_HISTORY ? history.slice(-MAX_HISTORY) : history }
    }
    case 'toggle':
      return { ...store, running: !store.running }
    case 'reset':
      return { ...initialStore(), speedIndex: store.speedIndex }
    case 'speed':
      return { ...store, speedIndex: action.index }
    case 'param':
      return { ...store, params: { ...store.params, [action.key]: action.value }, scenarioId: 'custom' }
    case 'scenario': {
      const sim = { ...store.sim, ...action.scenario.statePatch }
      return {
        ...store,
        sim,
        params: { ...DEFAULT_PARAMS, ...action.scenario.params },
        scenarioId: action.scenario.id,
        running: true,
      }
    }
  }
}

export function useSimulation() {
  const [store, dispatch] = useReducer(reducer, undefined, initialStore)

  useEffect(() => {
    if (!store.running) return
    const id = window.setInterval(() => dispatch({ type: 'tick' }), TICK_MS)
    return () => window.clearInterval(id)
  }, [store.running])

  const labs = computeLabs(store.sim, store.params)

  return {
    ...store,
    labs,
    toggle: () => dispatch({ type: 'toggle' }),
    reset: () => dispatch({ type: 'reset' }),
    setSpeed: (index: number) => dispatch({ type: 'speed', index }),
    setParam: (key: ParamKey, value: number) => dispatch({ type: 'param', key, value }),
    applyScenario: (scenario: Scenario) => dispatch({ type: 'scenario', scenario }),
  }
}
