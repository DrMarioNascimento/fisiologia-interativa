import { AXES, type AxisId } from '@/lib/sim/axes'
import { cn } from '@/lib/utils'

export function AxisTabs({ value, onChange }: { value: AxisId; onChange: (id: AxisId) => void }) {
  return (
    <nav aria-label="Eixos hormonais" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
      <div role="tablist" className="flex w-max gap-1.5">
        {AXES.map((axis) => {
          const active = axis.id === value
          return (
            <button
              key={axis.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(axis.id)}
              className={cn(
                'h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors',
                active
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {axis.tabLabel}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
