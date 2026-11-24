export type StatKey =
  | 'might'
  | 'agility'
  | 'intellect'
  | 'perception'
  | 'charm'
  | 'will'

export type Stats = Record<StatKey, number>

export type TraitVector = Record<string, number>

export interface TraitDef {
  key: string
  label: string
  low: string
  high: string
}

export interface Archetype {
  id: string
  title: string
  motto: string
  desc: string
  profile: TraitVector
  bias?: number
}

export interface ScaleDef {
  labels: string[]
  values: number[]
}

export interface Question {
  id: string
  text: string
  deltas: TraitVector
}

export interface Race {
  id: string
  name: string
  talent: string
  desc: string
  profile: TraitVector
  bias?: number
}

export interface Job {
  id: string
  name: string
  skill: string
  desc: string
  profile: TraitVector
  bias?: number
}

export interface Faction {
  id: string
  name: string
  crest: string
  desc: string
  profile: TraitVector
  bias?: number
}

export type ElementKey = 'fire' | 'earth' | 'air' | 'water'

export interface Element {
  key: ElementKey
  name: string
  glyph: string
  trait: string
}

export interface Zodiac {
  id: string
  name: string
  element: ElementKey
  deltas: TraitVector
}

export interface TarotCard {
  index: number
  id: string
  name: string
  keyword: string
  hook: string
  deltas: TraitVector
}

export type CardPosition = 'past' | 'present' | 'future'

export interface DrawnCard {
  position: CardPosition
  card: TarotCard
}

export interface PositionDef {
  key: CardPosition
  label: string
}

export interface StatsConfig {
  base: number
  min: number
  max: number
  scale: number
  intensityRef: number
}

export interface WeaknessVariants {
  high: string
  low: string
}

export interface TraitPhrase {
  high: string
  low: string
}

export interface NarrativeTemplates {
  opener: Record<string, string>
  tension: string
  progression: string
  trait: string
  context: string
  origin: Record<string, string>
  closing: string
  secondary: string
}

export interface NarrativeConfig {
  lines: string[]
  thresholds: { tension: number }
  connectors: { same: string; opposite: string }
  phrases: Record<string, TraitPhrase>
  templates: NarrativeTemplates
  elements: Record<string, string>
}

export interface CombineConfig {
  weights: {
    answers: number
    zodiac: number
    tarot: number
  }
  normalize: string
  match: string
  secondaryGap: number
  stats: StatsConfig
  weaknessPick: string
  storyOrder: CardPosition[]
  serialPrefix: string
  serialLength: number
}

export interface PersonaContent {
  version: number
  scale: ScaleDef
  traits: TraitDef[]
  questions: Question[]
  archetypes: Archetype[]
  races: Race[]
  jobs: Job[]
  factions: Faction[]
  elements: Record<ElementKey, Element>
  zodiacs: Zodiac[]
  tarot: TarotCard[]
  positions: PositionDef[]
  statLabels: Record<StatKey, string>
  weaknesses: Record<StatKey, WeaknessVariants>
  weaknessTraits: Record<StatKey, string>
  weaknessTails: Record<StatKey, string>
  narrative: NarrativeConfig
  statsMapping: Record<StatKey, TraitVector>
  combine: CombineConfig
}

export interface PersonaCard {
  serial: string
  type: Archetype
  similarity: number
  secondary: { title: string; similarity: number } | null
  race: Race
  job: Job
  faction: Faction
  element: Element
  zodiac: Zodiac
  cards: DrawnCard[]
  stats: Stats
  traits: TraitVector
  talent: string
  skill: string
  weakness: string
  story: string
  weakKey: StatKey
}

export interface BuildInput {
  answers: Record<string, number>
  zodiacId: string
  seed?: string
  cards?: DrawnCard[]
}