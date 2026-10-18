import { corpusLuteumShare, type HormoneId, type Mode, type Snapshot, TERM_DAY } from '@/lib/cycle/model'
import type { PhaseInfo } from '@/lib/cycle/phases'
import { HormoneChip, type Trend } from './hormone-chip'

function FlowArrow({ label, intensity }: { label: string; intensity: number }) {
  const i = Math.min(1, Math.max(0, intensity))
  const width = 1.5 + 6 * i
  const duration = i < 0.05 ? 0 : 3 - 2.5 * i
  return (
    <div className="flex items-center gap-3 py-1 pl-5">
      <svg width="20" height="36" viewBox="0 0 20 36" aria-hidden className="shrink-0 text-primary">
        <line
          x1="10"
          y1="0"
          x2="10"
          y2="26"
          stroke="currentColor"
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray="2 6"
          className="signal-flow"
          style={{
            animationDuration: duration ? `${duration}s` : undefined,
            animationPlayState: duration ? 'running' : 'paused',
            opacity: 0.3 + 0.7 * i,
          }}
        />
        <path d="M4 26 L10 34 L16 26 Z" fill="currentColor" opacity={0.3 + 0.7 * i} />
      </svg>
      <span className="text-xs text-muted-foreground text-pretty">{label}</span>
    </div>
  )
}

type StageProps = {
  step: number
  title: string
  subtitle: string
  ids: HormoneId[]
  snap: Snapshot
  trends: Record<HormoneId, Trend>
  extra?: { label: string; value: string }[]
}

function Stage({ step, title, subtitle, ids, snap, trends, extra }: StageProps) {
  return (
    <div className="flex h-full flex-col gap-2.5 rounded-lg border bg-background p-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs text-background">
          {step}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground text-pretty">{subtitle}</p>
        </div>
      </div>
      {(ids.length > 0 || extra) && (
        <div className="grid grid-cols-3 gap-1.5">
          {ids.map((id) => (
            <HormoneChip key={id} id={id} value={snap[id]} trend={trends[id]} />
          ))}
          {extra?.map((e) => (
            <div key={e.label} className="flex min-w-0 flex-col rounded-lg bg-muted px-2.5 py-1.5">
              <span className="truncate text-[11px] font-medium leading-tight text-muted-foreground">{e.label}</span>
              <span className="truncate font-mono text-sm font-semibold tabular-nums leading-tight">{e.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const fmt1 = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

export function HormoneFlow({
  mode,
  day,
  snap,
  trends,
  phase,
  breastfeeding,
}: {
  mode: Mode
  day: number
  snap: Snapshot
  trends: Record<HormoneId, Trend>
  phase: PhaseInfo
  breastfeeding: boolean
}) {
  const pregnant = mode === 'gestacao' && day >= 21
  const postpartum = mode === 'gestacao' && day >= TERM_DAY
  const placentaActive = pregnant && !postpartum
  const clShare = corpusLuteumShare(day)

  const pulseInterval = Math.round(1440 / Math.max(snap.gnrh, 0.5))
  const gonadTitle = placentaActive ? (clShare > 0.5 ? 'Corpo lúteo + trofoblasto' : 'Placenta') : 'Ovário'
  const gonadIds: HormoneId[] = placentaActive || (postpartum && snap.hcg > 5) ? ['hcg', 'e2', 'p4'] : ['e2', 'p4']

  let targets: { label: string; value: string }[]
  let targetSubtitle: string
  if (mode === 'ciclo' || day < 21) {
    targets = [
      { label: 'Endométrio', value: `${fmt1(snap.endometrium ?? 0)} mm` },
      { label: 'Temp. basal', value: `${fmt1(snap.temperature ?? 36.5)} °C` },
    ]
    targetSubtitle = 'Endométrio, muco cervical e centro termorregulador'
  } else if (!postpartum) {
    targets = [
      { label: 'Miométrio', value: day >= TERM_DAY - 1.5 ? 'Contrações' : 'Quiescente' },
      { label: 'Mamas', value: 'Lactogênese I' },
    ]
    targetSubtitle = 'Decídua, miométrio e glândula mamária'
  } else {
    targets = [
      { label: 'Útero', value: 'Involução' },
      { label: 'Mamas', value: breastfeeding ? 'Lactação' : 'Involução' },
    ]
    targetSubtitle = breastfeeding ? 'Sucção estimula prolactina e ocitocina' : 'Sem estímulo de sucção'
  }

  const gonadotropinDrive = Math.min(1, (snap.lh + snap.fsh) / 25)
  const steroidSignal = Math.min(1, Math.log10(1 + snap.e2 / 30 + snap.p4) / 2.5)

  return (
    <section aria-labelledby="flow-title" className="rounded-xl border bg-card p-4">
      <h2 id="flow-title" className="text-lg font-semibold leading-tight text-balance">
        {placentaActive ? 'Eixo hipotálamo–hipófise–placenta' : 'Eixo hipotálamo–hipófise–ovário'}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">{phase.title}</p>

      <ol className="mt-4 flex flex-col">
        <li>
          <Stage
            step={1}
            title="Hipotálamo"
            subtitle={`Núcleo arqueado: GnRH pulsátil (~1 pulso a cada ${pulseInterval} min). Dopamina inibe a prolactina. Núcleos supraóptico e paraventricular sintetizam ocitocina.`}
            ids={['gnrh']}
            snap={snap}
            trends={trends}
          />
          <FlowArrow label="Sistema porta (GnRH, dopamina) e axônios para a neuro-hipófise" intensity={snap.gnrh / 22} />
        </li>
        <li className="grid gap-2 sm:grid-cols-[1fr_2fr]">
          <Stage
            step={2}
            title="Neuro-hipófise"
            subtitle="Armazena e libera ocitocina"
            ids={['oxt']}
            snap={snap}
            trends={trends}
          />
          <Stage
            step={3}
            title="Adeno-hipófise"
            subtitle="Gonadotrofos (FSH, LH) e lactotrofos (prolactina)"
            ids={['fsh', 'lh', 'prl']}
            snap={snap}
            trends={trends}
          />
        </li>
        <li>
          <FlowArrow
            label={placentaActive ? 'FSH/LH suprimidos; hCG placentário sustenta a esteroidogênese' : 'FSH e LH na circulação'}
            intensity={placentaActive ? Math.min(1, snap.hcg / 50000) : gonadotropinDrive}
          />
          <Stage step={4} title={gonadTitle} subtitle={phase.ovary + ' · ' + phase.gonadSubtitle} ids={gonadIds} snap={snap} trends={trends} />
          <FlowArrow label="Estradiol e progesterona nos tecidos-alvo" intensity={steroidSignal} />
          <Stage step={5} title="Órgãos-alvo" subtitle={targetSubtitle} ids={[]} snap={snap} trends={trends} extra={targets} />
        </li>
      </ol>
    </section>
  )
}
