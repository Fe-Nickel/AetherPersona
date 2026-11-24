import { buildCard, tarotByIndex } from '../tmp/derive.mjs'

const zodiacIds = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
]
const positions = ['past', 'present', 'future']

let seed = 987654321
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 2147483648
}

function drawThree() {
  const pool = Array.from({ length: 22 }, (_, i) => i)
  const picked = []
  while (picked.length < 3) {
    const at = Math.floor(rand() * pool.length)
    picked.push(pool.splice(at, 1)[0])
  }
  return picked.map((index, i) => ({
    position: positions[i],
    card: tarotByIndex(index),
  }))
}

const N = 3000
const archetype = {}
const race = {}
const job = {}
const faction = {}
const statsMin = {}
const statsMax = {}
let simMin = 1
let simMax = -1
let simSum = 0
let secondaryCount = 0

for (let i = 0; i < N; i += 1) {
  const answers = {}
  for (let q = 1; q <= 24; q += 1) answers[`q${q}`] = Math.floor(rand() * 5)
  const zodiacId = zodiacIds[Math.floor(rand() * zodiacIds.length)]
  const card = buildCard({ answers, zodiacId, cards: drawThree() })

  archetype[card.type.title] = (archetype[card.type.title] || 0) + 1
  race[card.race.name] = (race[card.race.name] || 0) + 1
  job[card.job.name] = (job[card.job.name] || 0) + 1
  faction[card.faction.name] = (faction[card.faction.name] || 0) + 1

  for (const [key, value] of Object.entries(card.stats)) {
    statsMin[key] = Math.min(statsMin[key] ?? 99, value)
    statsMax[key] = Math.max(statsMax[key] ?? -99, value)
  }
  simMin = Math.min(simMin, card.similarity)
  simMax = Math.max(simMax, card.similarity)
  simSum += card.similarity
  if (card.secondary) secondaryCount += 1
}

console.log('samples', N)
console.log('archetypes covered', Object.keys(archetype).length, '/ 16')
console.log(
  Object.entries(archetype)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `${key}:${value}`)
    .join('  '),
)
console.log('races', JSON.stringify(race))
console.log('jobs', JSON.stringify(job))
console.log('factions', JSON.stringify(faction))
console.log('stats min', JSON.stringify(statsMin))
console.log('stats max', JSON.stringify(statsMax))
console.log(
  'similarity',
  simMin.toFixed(3),
  simMax.toFixed(3),
  'avg',
  (simSum / N).toFixed(3),
)
console.log('secondary ratio', (secondaryCount / N).toFixed(3))

const fixedAnswers = {}
for (let q = 1; q <= 24; q += 1) fixedAnswers[`q${q}`] = q % 2 === 0 ? 4 : 0
const variety = new Set()
for (let a = 0; a < 22; a += 1) {
  for (let b = 0; b < 22; b += 1) {
    if (a === b) continue
    const cards = [a, b, 17].map((index, i) => ({
      position: positions[i],
      card: tarotByIndex(index),
    }))
    variety.add(
      buildCard({ answers: fixedAnswers, zodiacId: 'leo', cards }).type.title,
    )
  }
}
console.log('tarot changes archetype:', variety.size, [...variety].join(' / '))