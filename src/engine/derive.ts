import { content } from '../data/content'
import type {
  BuildInput,
  DrawnCard,
  PersonaCard,
  StatKey,
  Stats,
  TarotCard,
  TraitVector,
} from '../data/types'

export const statKeys = Object.keys(content.statLabels) as StatKey[]
export const statLabels = content.statLabels
export const traitDefs = content.traits

export interface TraitSources {
  answers: TraitVector
  zodiac: TraitVector
  tarot: TraitVector
}

export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function zeroVector(): TraitVector {
  const vector: TraitVector = {}
  for (const trait of content.traits) vector[trait.key] = 0
  return vector
}

function addVector(target: TraitVector, deltas: TraitVector, weight = 1): void {
  for (const [key, value] of Object.entries(deltas)) {
    target[key] = (target[key] ?? 0) + value * weight
  }
}

function magnitude(vector: TraitVector): number {
  let sum = 0
  for (const value of Object.values(vector)) sum += value * value
  return Math.sqrt(sum)
}

export function computeSources(
  answers: Record<string, number>,
  zodiacId: string,
  cards: DrawnCard[],
): TraitSources {
  const answersVector = zeroVector()
  const scaleValues = content.scale.values
  for (const question of content.questions) {
    const picked = answers[question.id]
    if (picked === undefined || picked === null) continue
    const weight = scaleValues[picked]
    if (typeof weight !== 'number') continue
    addVector(answersVector, question.deltas, weight)
  }

  const zodiacVector = zeroVector()
  const zodiac = content.zodiacs.find((entry) => entry.id === zodiacId)
  if (zodiac) addVector(zodiacVector, zodiac.deltas)

  const tarotVector = zeroVector()
  for (const drawn of cards) addVector(tarotVector, drawn.card.deltas)

  return {
    answers: answersVector,
    zodiac: zodiacVector,
    tarot: tarotVector,
  }
}

export function combineSources(sources: TraitSources): TraitVector {
  const weights = content.combine.weights
  const total = zeroVector()
  addVector(total, normalizeVector(sources.answers), weights.answers)
  addVector(total, normalizeVector(sources.zodiac), weights.zodiac)
  addVector(total, normalizeVector(sources.tarot), weights.tarot)
  return total
}

export function normalizeVector(vector: TraitVector): TraitVector {
  const length = magnitude(vector)
  if (length < 1e-6) return { ...vector }

  const result: TraitVector = {}
  for (const [key, value] of Object.entries(vector)) result[key] = value / length
  return result
}

export function cosine(a: TraitVector, b: TraitVector): number {
  const na = normalizeVector(a)
  const nb = normalizeVector(b)
  let dot = 0
  for (const key of Object.keys(nb)) dot += (na[key] ?? 0) * nb[key]
  return dot
}

export function scoreProfile(
  sources: TraitSources,
  profile: TraitVector,
): number {
  const weights = content.combine.weights
  let total = 0
  let weightSum = 0

  const parts: Array<[TraitVector, number]> = [
    [sources.answers, weights.answers],
    [sources.zodiac, weights.zodiac],
    [sources.tarot, weights.tarot],
  ]

  for (const [vector, weight] of parts) {
    if (magnitude(vector) < 1e-6) continue
    total += cosine(vector, profile) * weight
    weightSum += weight
  }

  return weightSum > 0 ? total / weightSum : 0
}

function bestMatch<T extends { profile: TraitVector; bias?: number }>(
  sources: TraitSources,
  items: T[],
): { item: T; score: number } {
  let best = items[0]
  let bestScore = Number.NEGATIVE_INFINITY
  for (const item of items) {
    const score = scoreProfile(sources, item.profile) + (item.bias ?? 0)
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }
  return { item: best, score: bestScore }
}

function deriveStats(raw: TraitVector, intensity = 1): Stats {
  const config = content.combine.stats
  const stats = {} as Stats

  for (const key of statKeys) {
    const mapping = content.statsMapping[key] ?? {}
    let total = config.base
    for (const [trait, weight] of Object.entries(mapping)) {
      total += (raw[trait] ?? 0) * weight * config.scale * intensity
    }
    stats[key] = Math.max(config.min, Math.min(config.max, Math.round(total)))
  }

  return stats
}

export function tarotByIndex(index: number): TarotCard {
  return content.tarot.find((card) => card.index === index) ?? content.tarot[0]
}

export function drawCards(seed: string): DrawnCard[] {
  const rand = mulberry32(hashString(seed))
  const pool = content.tarot.map((card) => card.index)
  const picked: number[] = []
  while (picked.length < 3 && pool.length > 0) {
    const at = Math.floor(rand() * pool.length)
    picked.push(pool.splice(at, 1)[0])
  }
  return content.combine.storyOrder.map((position, i) => ({
    position,
    card: tarotByIndex(picked[i]),
  }))
}

export function shuffleDeck(seed: string): TarotCard[] {
  const rand = mulberry32(hashString(seed))
  const deck = [...content.tarot]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const swap = deck[i]
    deck[i] = deck[j]
    deck[j] = swap
  }
  return deck
}

export function buildCard(input: BuildInput): PersonaCard {
  const seedKey = `${input.zodiacId}|${input.seed ?? 'default'}|${JSON.stringify(input.answers)}`
  const cards = input.cards ?? drawCards(seedKey)

  const sources = computeSources(input.answers, input.zodiacId, cards)
  const combined = combineSources(sources)
  const unit = normalizeVector(combined)

  const ranked = content.archetypes
    .map((archetype) => ({
      archetype,
      similarity:
        scoreProfile(sources, archetype.profile) + (archetype.bias ?? 0),
    }))
    .sort((a, b) => b.similarity - a.similarity)

  const top = ranked[0]
  const second = ranked[1]
  const type = top.archetype
  const secondary =
    second && top.similarity - second.similarity < content.combine.secondaryGap
      ? { title: second.archetype.title, similarity: second.similarity }
      : null

  const zodiac =
    content.zodiacs.find((entry) => entry.id === input.zodiacId) ??
    content.zodiacs[0]
  const element = content.elements[zodiac.element]

  const race = bestMatch(sources, content.races).item
  const job = bestMatch(sources, content.jobs).item
  const faction = bestMatch(sources, content.factions).item

  const intensity = Math.max(
    0.7,
    Math.min(
      1.35,
      magnitude(sources.answers) / content.combine.stats.intensityRef,
    ),
  )
  const stats = deriveStats(combined, intensity)

  let weakKey: StatKey = statKeys[0]
  for (const key of statKeys) {
    if (stats[key] < stats[weakKey]) weakKey = key
  }

  const hash = hashString(
    `${seedKey}|${cards.map((entry) => entry.card.index).join(',')}|${type.id}`,
  )
  const serial =
    content.combine.serialPrefix +
    hash
      .toString(16)
      .toUpperCase()
      .padStart(8, '0')
      .slice(0, content.combine.serialLength)

  const rankedTraits = content.traits
    .map((trait) => ({ key: trait.key, value: combined[trait.key] ?? 0 }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

  const voice = content.narrative

  const phraseOf = (entry: { key: string; value: number }): string => {
    const group = voice.phrases[entry.key]
    if (!group) return ''
    return entry.value >= 0 ? group.high : group.low
  }

  const strongestPositive = rankedTraits.find((entry) => entry.value > 0)
  const strongestNegative = rankedTraits.find((entry) => entry.value < 0)
  const pastCard = cards.find((entry) => entry.position === 'past') ?? cards[0]

  const renderSlot = (slot: string): string => {
    if (slot === 'opener') return voice.templates.opener[type.id] ?? ''

    if (slot === 'tension') {
      const tension = voice.thresholds.tension
      if (
        strongestPositive &&
        strongestNegative &&
        Math.abs(strongestNegative.value) >= tension
      ) {
        return voice.templates.tension
          .replace('{a}', phraseOf(strongestPositive))
          .replace('{b}', phraseOf(strongestNegative))
          .replace('{opposite}', voice.connectors.opposite)
      }
      const first = rankedTraits[0]
      const second = rankedTraits[1]
      if (!first || !second) return ''
      return voice.templates.progression
        .replace('{a}', phraseOf(first))
        .replace('{b}', phraseOf(second))
        .replace('{same}', voice.connectors.same)
    }

    if (slot === 'trait') {
      const third = rankedTraits[2]
      if (!third) return ''
      return voice.templates.trait.replace('{a}', phraseOf(third))
    }

    if (slot === 'context') {
      return voice.templates.context
        .replace('{job}', job.name)
        .replace('{faction}', faction.name)
    }

    if (slot === 'origin') {
      return voice.templates.origin[race.id] ?? ''
    }

    if (slot === 'closing') {
      return voice.templates.closing
        .replace('{element}', voice.elements[element.key] ?? '')
        .replace('{past}', pastCard?.card.keyword ?? '')
    }

    if (slot === 'secondary') {
      return secondary
        ? voice.templates.secondary.replace('{title}', secondary.title)
        : ''
    }

    return ''
  }

  const story = voice.lines.map(renderSlot).filter(Boolean).join('')

  const sortedStats = [...statKeys].sort((a, b) => stats[a] - stats[b])
  const secondKey = sortedStats[1] ?? weakKey
  const relatedTrait = content.weaknessTraits[weakKey]
  const relatedValue = relatedTrait ? (combined[relatedTrait] ?? 0) : 0
  const variants = content.weaknesses[weakKey]
  const core = relatedValue >= 0 ? variants.high : variants.low
  const weakness = core + (content.weaknessTails[secondKey] ?? '')

  return {
    serial,
    type,
    similarity: top.similarity,
    secondary,
    race,
    job,
    faction,
    element,
    zodiac,
    cards,
    stats,
    traits: unit,
    talent: race.talent,
    skill: job.skill,
    weakness,
    story,
    weakKey,
  }
}