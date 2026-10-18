import Link from 'next/link'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/', label: 'Eixos hipofisários' },
  { href: '/ciclo', label: 'Ciclo menstrual e gestação' },
] as const

export function SiteNav({ current }: { current: (typeof LINKS)[number]['href'] }) {
  return (
    <nav aria-label="Simuladores" className="border-b bg-muted/60">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-1.5 [scrollbar-width:none]">
        {LINKS.map((link) => {
          const active = link.href === current
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-9 items-center rounded-md px-3 text-xs font-medium transition-colors',
                  active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
