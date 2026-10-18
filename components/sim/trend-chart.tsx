'use client'

import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HistoryPoint } from '@/hooks/use-simulation'
import type { AxisConfig } from '@/lib/sim/axes'
import { computeLabs, LAB_DEFS } from '@/lib/sim/labs'
import { BASELINE_STATE, DEFAULT_PARAMS } from '@/lib/sim/model'

const BASELINE = computeLabs(BASELINE_STATE, DEFAULT_PARAMS)
const LOG_TICKS = [0.1, 0.25, 0.5, 1, 2, 4, 10, 25]
const MIN_RATIO = 0.05
const MAX_RATIO = 40

const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

export function TrendChart({ axis, history }: { axis: AxisConfig; history: HistoryPoint[] }) {
  const { chart } = axis
  const relative = chart.mode === 'relative'

  const data = useMemo(
    () =>
      history.map((h) => {
        const row: Record<string, number> = { t: h.t }
        for (const s of chart.series) {
          row[s.lab] = relative
            ? Math.min(MAX_RATIO, Math.max(MIN_RATIO, h[s.lab] / Math.max(BASELINE[s.lab], 1e-6)))
            : h[s.lab]
        }
        return row
      }),
    [history, chart.series, relative],
  )

  return (
    <section aria-labelledby="chart-title" className="rounded-xl border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="chart-title" className="text-base font-semibold">
          Evolução temporal
        </h2>
        <span className="text-xs text-muted-foreground">
          {relative ? 'escala log · × basal' : chart.unit}
        </span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {chart.series.map((s) => (
          <li key={s.lab} className="flex items-center gap-1.5 text-xs">
            <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} aria-hidden />
            {LAB_DEFS[s.lab].short}
            {!relative && <span className="text-muted-foreground">({LAB_DEFS[s.lab].unit})</span>}
          </li>
        ))}
      </ul>
      <div className="mt-3 h-56 w-full" role="img" aria-label="Gráfico da evolução dos hormônios do eixo ao longo dos dias">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v: number) => `d${Math.round(v)}`}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              stroke="var(--border)"
              tickCount={5}
            />
            {relative ? (
              <YAxis
                scale="log"
                domain={[MIN_RATIO, MAX_RATIO]}
                ticks={LOG_TICKS}
                allowDataOverflow
                tickFormatter={fmt}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                stroke="var(--border)"
              />
            ) : (
              <YAxis
                domain={chart.domain}
                allowDataOverflow
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                stroke="var(--border)"
              />
            )}
            {relative && <ReferenceLine y={1} stroke="var(--muted-foreground)" strokeDasharray="4 4" />}
            <Tooltip
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(v) => `Dia ${Math.floor(Number(v))}`}
              formatter={(value, name) => [
                relative ? `${fmt(Number(value))}× basal` : fmt(Number(value)),
                LAB_DEFS[name as keyof typeof LAB_DEFS]?.short ?? String(name),
              ]}
            />
            {chart.series.map((s) => (
              <Line
                key={s.lab}
                dataKey={s.lab}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
