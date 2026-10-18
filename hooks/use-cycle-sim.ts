'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ExerciseLevel } from '@/lib/cycle/exercise'
import { type Mode, PREGNANCY_TOTAL_DAYS, totalDays } from '@/lib/cycle/model'

export const CYCLE_SPEEDS: Record<Mode, { label: string; rate: number }[]> = {
  ciclo: [
    { label: '1×', rate: 0.5 },
    { label: '2×', rate: 1 },
    { label: '4×', rate: 2 },
  ],
  gestacao: [
    { label: '1×', rate: 2 },
    { label: '2×', rate: 5 },
    { label: '4×', rate: 10 },
  ],
}

const TICK_MS = 100

type Clock = { day: number; cycle: number }

export function useCycleSim(initialMode: Mode = 'ciclo') {
  const [mode, setModeState] = useState<Mode>(initialMode)
  const [clock, setClock] = useState<Clock>({ day: 0, cycle: 1 })
  const [running, setRunning] = useState(true)
  const [speedIndex, setSpeedIndex] = useState(0)
  const [cycleLength, setCycleLengthState] = useState(28)
  const [breastfeeding, setBreastfeeding] = useState(true)
  const [exercise, setExerciseState] = useState<ExerciseLevel | null>(null)

  const total = totalDays({ mode, cycleLength })

  useEffect(() => {
    if (!running) return
    const rate = CYCLE_SPEEDS[mode][speedIndex].rate
    const id = setInterval(() => {
      setClock((c) => {
        const next = c.day + (rate * TICK_MS) / 1000
        if (mode === 'ciclo') {
          return next >= cycleLength ? { day: next - cycleLength, cycle: c.cycle + 1 } : { ...c, day: next }
        }
        return { ...c, day: Math.min(next, PREGNANCY_TOTAL_DAYS - 0.01) }
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [running, mode, speedIndex, cycleLength])

  const finished = mode === 'gestacao' && clock.day >= PREGNANCY_TOTAL_DAYS - 0.01
  useEffect(() => {
    if (finished) setRunning(false)
  }, [finished])

  const setMode = useCallback((m: Mode) => {
    setModeState(m)
    window.history.replaceState(null, '', `?modo=${m}`)
    setClock({ day: 0, cycle: 1 })
    setExerciseState(null)
    setRunning(true)
  }, [])

  const setExercise = useCallback((level: ExerciseLevel | null) => {
    setExerciseState(level)
    if (level) setRunning(false)
  }, [])

  const setCycleLength = useCallback((len: number) => {
    setCycleLengthState(len)
    setClock((c) => ({ ...c, day: Math.min(c.day, len - 0.01) }))
  }, [])

  const seek = useCallback(
    (day: number) => setClock((c) => ({ ...c, day: Math.min(Math.max(0, day), total - 0.01) })),
    [total],
  )

  const toggle = useCallback(() => {
    if (finished) {
      setClock({ day: 0, cycle: 1 })
      setRunning(true)
      return
    }
    if (!running) setExerciseState(null)
    setRunning((r) => !r)
  }, [finished, running])

  const reset = useCallback(() => {
    setClock({ day: 0, cycle: 1 })
    setExerciseState(null)
  }, [])

  return {
    mode,
    day: clock.day,
    cycle: clock.cycle,
    total,
    running,
    speedIndex,
    cycleLength,
    breastfeeding,
    exercise,
    setMode,
    setExercise,
    setCycleLength,
    setBreastfeeding,
    setSpeed: setSpeedIndex,
    seek,
    toggle,
    reset,
  }
}

export type CycleSim = ReturnType<typeof useCycleSim>
