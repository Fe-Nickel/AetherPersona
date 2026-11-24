import type { ReactNode } from 'react'

type GlyphProps = {
  id: string
  size?: number
  className?: string
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const raceShapes: Record<string, ReactNode> = {
  human: (
    <>
      <circle cx="12" cy="6.4" r="2.3" />
      <path d="M12 8.7v6.4M12 11.4 8.4 14M12 11.4 15.6 14M9.4 21 12 15.1l2.6 5.9" />
    </>
  ),
  elf: (
    <>
      <path d="M15 3.4a8 7.6 0 1 0 0 17.2 6.2 6 0 1 1 0-17.2" />
      <path d="M17.4 8.2l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7z" />
    </>
  ),
  dwarf: (
    <>
      <path d="M3.6 18.6 8 11.4l3 3.1 4-7.4 5.4 11.5z" />
      <path d="M6 21h12" />
    </>
  ),
  orc: (
    <>
      <path d="M7 5.6c2.2 4.2 2.2 8.6 0 12.8M12 4.4c2.6 4.7 2.6 10.5 0 15.2M17 5.6c1.9 4.2 1.9 8.6 0 12.8" />
    </>
  ),
  dragonkin: (
    <>
      <circle cx="12" cy="4.6" r="1.5" />
      <path d="M12 6.6v13.8M12 9.4C9.2 9.4 6.2 7.6 4.8 4.6c2.8 0 5.6 1 7.2 4.8M12 9.4c2.8 0 5.8-1.8 7.2-4.8-2.8 0-5.6 1-7.2 4.8M12 20.4l-3.4-3.6M12 20.4l3.4-3.6" />
    </>
  ),
  automaton: (
    <>
      <path d="M12 2.8 19 6.9v8.2l-7 4.1-7-4.1V6.9z" />
      <circle cx="12" cy="11" r="2.6" />
      <path d="M12 5.4v3M12 13.6v2.2" />
    </>
  ),
}

const jobShapes: Record<string, ReactNode> = {
  ranger: (
    <>
      <path d="M8.6 3.6c5.6 2 5.6 14.8 0 16.8" />
      <path d="M8.6 3.6v16.8" />
      <path d="M4 12h13" />
      <path d="M14 9.6 18.4 12 14 14.4" />
    </>
  ),
  knight: (
    <>
      <path d="M12 2.8v13.4M8 7.6h8M9 16.2h6M12 16.2v4.4M7.4 20.6h9.2" />
    </>
  ),
  mage: (
    <>
      <path d="M7.2 21.2 15 7.6" />
      <circle cx="17.2" cy="5.2" r="2.4" />
      <path d="M17.2 1.6v1.2M21.2 5.2h1.2M14.4 1.6l.8.8" />
    </>
  ),
  cleric: (
    <>
      <circle cx="12" cy="8.4" r="4" />
      <path d="M12 12.4v8.2M8 20.6h8M12 2.4v1.2" />
    </>
  ),
  artisan: (
    <>
      <path d="M4.6 6.2h9.2l3.6 3.6-2.2 2.2H4.6z" />
      <path d="M10 12v8.6M7.6 20.6h4.8" />
    </>
  ),
  shadow: (
    <>
      <path d="M12 3.2l2.6 8.8h-5.2z" />
      <path d="M12 12v8.6M9 12v-1.4M15 12v-1.4" />
    </>
  ),
}

const factionShapes: Record<string, ReactNode> = {
  council: (
    <>
      <path d="M12 3 19 5.2v6.2c0 4-3 7.6-7 9.2-4-1.6-7-5.2-7-9.2V5.2z" />
      <path d="M12 7.6v7.2M9.4 12.6h5.2" />
    </>
  ),
  guild: (
    <>
      <path d="M12 3v15.6M9 21h6M4.4 7.6h15.2" />
      <path d="M4.4 7.6 2.4 12.2a2.9 2.9 0 0 0 5.8 0L6.2 7.6M19.6 7.6l-2 4.6a2.9 2.9 0 0 0 5.8 0l-2-4.6" />
    </>
  ),
  tide: (
    <>
      <path d="M6.4 7.6a2.2 2.2 0 1 1 2.4 2.5L17.6 18M6.4 7.6l2.4 2.5L17.6 18" />
      <path d="M18.2 15.4a2.2 2.2 0 1 0 2.4 2.5M5.6 4.8a2.2 2.2 0 1 0 2.4 2.5" />
    </>
  ),
  watchers: (
    <>
      <path d="M2.4 12c3-4.8 6.6-7.2 9.6-7.2s6.6 2.4 9.6 7.2c-3 4.8-6.6 7.2-9.6 7.2S5.4 16.8 2.4 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
}

const elementShapes: Record<string, ReactNode> = {
  fire: <path d="M12 3.4 20 19H4z" />,
  air: (
    <>
      <path d="M12 3.4 20 19H4z" />
      <path d="M6 14.6h12" />
    </>
  ),
  earth: (
    <>
      <path d="M12 20.6 4 5h16z" />
      <path d="M6 9.4h12" />
    </>
  ),
  water: <path d="M12 20.6 4 5h16z" />,
}

const tarotGlyphs: string[] = [
  'M12 20.4V8.2M8.8 4.6 12 7.4l3.2-2.8M7 20.4h10',
  'M12 3v18M5.6 8.4h12.8',
  'M15.2 3.6a8.2 7.6 0 1 0 0 16.8 6.4 6 0 1 1 0-16.8',
  'M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2',
  'M5.8 5.8h12.4v12.4H5.8zM5.8 18.2 18.2 5.8',
  'M7 20.6V11a5 5 0 0 1 10 0v9.6M4 20.6h16',
  'M9 9a3 3 0 1 0 .01 0M15 9a3 3 0 1 0 .01 0M9 15.6a3 3 0 1 0 .01 0M15 15.6a3 3 0 1 0 .01 0',
  'M12 2.8 20 16.2H4z',
  'M8 12a2.5 2.5 0 1 1 5 0 2.5 2.5 0 1 1-5 0M11 12a2.5 2.5 0 1 1 5 0 2.5 2.5 0 1 1-5 0',
  'M12 3.4v17.2M7.4 8.2 12 3.4l4.6 4.8M8 20.6h8',
  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 6v12M6 12h12M7.8 7.8l8.4 8.4M16.2 7.8l-8.4 8.4',
  'M12 2.8v16.8M5 7.6h14M5 7.6 2.8 12h4.4zM19 7.6 21.2 12h-4.4zM8.4 20.6h7.2',
  'M6 3.6h12L12 18.4zM7.4 20.6h9.2',
  'M4.4 4.4c8.4 1.6 12.8 6 14.4 14.4M5.6 5.6l1.8 1.8',
  'M6 6h5.6v5.6H6zM12.4 12.6h5.6V18.2h-5.6z',
  'M12 3.6 19.4 16H4.6zM12 9.4v5M12 15.6l2.6 2.6',
  'M8.4 20.4V6.2h7.2v14.2M5 20.4h14M12 6.2V2.4M12 9.4l3.2 3.2-3.2 3.2',
  'M12 2.8 14.6 9.4 21.4 10 16.2 14.6 17.6 21.4 12 17.8 6.4 21.4 7.8 14.6 2.6 10 9.4 9.4z',
  'M15.2 3.6a8.2 7.6 0 1 0 0 16.8 6.4 6 0 1 1 0-16.8M6.4 8.2 5.4 9.2M4.4 13.4h1.2',
  'M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6M12 1.6v2M12 20.4v2M1.6 12h2M20.4 12h2M4.7 4.7l1.4 1.4M17.9 17.9l1.4 1.4M19.3 4.7l-1.4 1.4M6.1 17.9l-1.4 1.4',
  'M6 3.6v16.8M12 3.6v16.8M18 3.6v16.8M6 3.6h12',
  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8',
]

export function RaceGlyph({ id, size = 40, className }: GlyphProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...strokeProps}>
      {raceShapes[id] ?? raceShapes.human}
    </svg>
  )
}

export function JobGlyph({ id, size = 40, className }: GlyphProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...strokeProps}>
      {jobShapes[id] ?? jobShapes.knight}
    </svg>
  )
}

export function FactionGlyph({ id, size = 40, className }: GlyphProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...strokeProps}>
      {factionShapes[id] ?? factionShapes.council}
    </svg>
  )
}

export function ElementGlyph({ id, size = 40, className }: GlyphProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...strokeProps}>
      {elementShapes[id] ?? elementShapes.fire}
    </svg>
  )
}

export function TarotGlyph({
  index,
  size = 40,
  className,
}: {
  index: number
  size?: number
  className?: string
}) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" {...strokeProps}>
      <path d={tarotGlyphs[index] ?? tarotGlyphs[0]} />
    </svg>
  )
}