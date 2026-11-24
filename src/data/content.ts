import raw from './persona.json'
import type { PersonaContent } from './types'

export const content = raw as unknown as PersonaContent

export const traits = content.traits
export const scale = content.scale
export const questions = content.questions
export const archetypes = content.archetypes
export const zodiacs = content.zodiacs
export const positions = content.positions
export const tarot = content.tarot
export const races = content.races
export const jobs = content.jobs
export const factions = content.factions
export const elements = content.elements