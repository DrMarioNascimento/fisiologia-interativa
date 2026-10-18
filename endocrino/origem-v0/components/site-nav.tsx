import Link from 'next/link'
import { Baby, CalendarDays, Network } from 'lucide-react'
import type { Mode } from '@/lib/cycle/model'
import { cn } from '@/lib/utils'

type NavKey = 'eixos' | Mode

const LINKS: { key: NavKey; href: string; label: string; Icon: typeof Baby }[] = [
  { key: 'eixos', href: '/', label: 'Eixos hipofisários', Icon: Network },
  { key: 'ciclo', href: '/ciclo?modo=ciclo', label: 'Ciclo menstrual', Icon: CalendarDays },
  { key: 'gestacao', href: '/ciclo?modo=gestacao', label: 'Gestação', Icon: Baby },
]

type Props = {
  current: NavKey
  onModeChange?: (mode: Mode) => void
}

export function SiteNav({ current, onModeChange }: Props) {
  return (
    <nav aria-label="Simuladores" className="border-b bg-muted/60">
      <ul className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5 [scrollbar-width:none]">
        {LINKS.map(({ key, href, label, Icon }) => {
          const active = key === current
          const className = cn(
            'flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
            active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )
          const content = (
            <>
              <Icon className="size-3.5" aria-hidden />
              {label}
            </>
          )
          return (
            <li key={key} className={cn('shrink-0', key === 'ciclo' && 'ml-1 border-l pl-2')}>
              {key !== 'eixos' && onModeChange ? (
                <button type="button" aria-pressed={active} onClick={() => onModeChange(key)} className={className}>
                  {content}
                </button>
              ) : (
                <Link href={href} aria-current={active ? 'page' : undefined} className={className}>
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
