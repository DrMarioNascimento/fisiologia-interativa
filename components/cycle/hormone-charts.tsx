'use client'

import { memo, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import {
  buildSeries,
  formatHormone,
  GLAND_COLOR,
  HORMONES,
  type HormoneId,
  type Mode,
  type SeriesPoint,
  type Snapshot,
  TERM_DAY,
} from '@/lib/cycle/model'

const Y_AXIS_WIDTH = 44
const RIGHT_MARGIN = 8

const compact = (v: number) => {
  if (v >= 1000) return `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
  return v.toLocaleString('pt-BR', { maximumFractionDigits: v < 10 ? 1 : 0 })
}

type ChartProps = {
  id: HormoneId
  data: SeriesPoint[]
  total: number
  mode: Mode
  showAxis: boolean
}

const MiniChart = memo(function MiniChart({ id, data, total, mode, showAxis }: ChartProps) {
  const color = GLAND_COLOR[HORMONES[id].gland]
  const ticks =
    mode === 'ciclo'
      ? Array.from({ length: Math.floor(total / 7) + 1 }, (_, i) => i * 7).filter((t) => t < total)
      : Array.from({ length: Math.floor(total / 56) + 1 }, (_, i) => i * 56)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: RIGHT_MARGIN, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          domain={[0, total]}
          ticks={ticks}
          hide={!showAxis}
          tickFormatter={(v: number) => (mode === 'ciclo' ? `d${v + 1}` : `${Math.round(v / 7)}s`)}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          stroke="var(--border)"
        />
        <YAxis
          width={Y_AXIS_WIDTH}
          tickCount={3}
          tickFormatter={compact}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          stroke="var(--border)"
        />
        <Area
          type="monotone"
          dataKey={id}
          stroke={color}
          fill={color}
          fillOpacity={0.12}
          strokeWidth={2}
          isAnimationActive={false}
          dot={false}
          activeDot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
})

type Props = {
  mode: Mode
  ids: HormoneId[]
  total: number
  day: number
  cycleLength: number
  breastfeeding: boolean
  snap: Snapshot
}

export function HormoneCharts({ mode, ids, total, day, cycleLength, breastfeeding, snap }: Props) {
  const data = useMemo(() => buildSeries({ mode, cycleLength, breastfeeding }), [mode, cycleLength, breastfeeding])
  const fraction = Math.min(1, Math.max(0, day / total))
  const cursorLeft = `calc(${Y_AXIS_WIDTH}px + (100% - ${Y_AXIS_WIDTH + RIGHT_MARGIN}px) * ${fraction})`
  const termLeft = `calc(${Y_AXIS_WIDTH}px + (100% - ${Y_AXIS_WIDTH + RIGHT_MARGIN}px) * ${TERM_DAY / total})`

  return (
    <section aria-labelledby="charts-title" className="rounded-xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="charts-title" className="text-base font-semibold">
          Perfis hormonais
        </h2>
        <span className="text-xs text-muted-foreground">{mode === 'ciclo' ? 'dias do ciclo' : 'semanas desde a DUM'}</span>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {ids.map((id, i) => {
          const def = HORMONES[id]
          const last = i === ids.length - 1
          return (
            <li key={id}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="size-2 rounded-full" style={{ background: GLAND_COLOR[def.gland] }} aria-hidden />
                  {def.short}
                  <span className="font-normal text-muted-foreground">{def.unit}</span>
                </span>
                <span className="font-mono tabular-nums">{formatHormone(id, snap[id])}</span>
              </div>
              <div
                className={last ? 'relative mt-1 h-24' : 'relative mt-1 h-16'}
                role="img"
                aria-label={`Curva de ${def.name} ao longo do ${mode === 'ciclo' ? 'ciclo' : 'período gestacional e puerpério'}`}
              >
                <MiniChart id={id} data={data} total={total} mode={mode} showAxis={last} />
                {mode === 'gestacao' && (
                  <span
                    className="pointer-events-none absolute top-0 w-px bg-muted-foreground/40"
                    style={{ left: termLeft, bottom: last ? 30 : 0 }}
                    aria-hidden
                  />
                )}
                <span
                  className="pointer-events-none absolute top-0 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
                  style={{ left: cursorLeft, bottom: last ? 30 : 0 }}
                  aria-hidden
                />
              </div>
            </li>
          )
        })}
      </ul>
      {mode === 'gestacao' && (
        <p className="mt-3 text-xs text-muted-foreground text-pretty">
          A linha cinza marca o parto (40 semanas). Cada hormônio tem sua própria escala.
        </p>
      )}
    </section>
  )
}
