import fs from 'node:fs'

const file = 'src/data/persona.json'
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const weights = data.combine.weights
const scaleValues = data.scale.values

function mag(vector) {
  let sum = 0
  for (const key in vector) sum += vector[key] * vector[key]
  return Math.sqrt(sum)
}

function normalize(vector) {
  const length = mag(vector)
  if (length < 1e-9) return { ...vector }
  const out = {}
  for (const key in vector) out[key] = vector[key] / length
  return out
}

function dot(a, b) {
  let total = 0
  for (const key in b) total += (a[key] || 0) * b[key]
  return total
}

const profiles = new Map()
for (const group of [data.archetypes, data.races, data.jobs, data.factions]) {
  for (const item of group) profiles.set(item, normalize(item.profile))
}


let seed = 20260101
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 2147483648
}

const SAMPLE = 20000
const samples = []
for (let i = 0; i < SAMPLE; i += 1) {
  const vector = {}
  for (const question of data.questions) {
    const choice = Math.floor(rand() * 5)
    const weight = scaleValues[choice]
    for (const [key, value] of Object.entries(question.deltas)) {
      vector[key] = (vector[key] || 0) + value * weight
    }
  }
  const answerUnit = normalize(vector)
  const zodiac = data.zodiacs[Math.floor(rand() * data.zodiacs.length)]
  const zodiacUnit = normalize(zodiac.deltas)

  const pool = data.tarot.map((card) => card.index)
  const drawn = []
  while (drawn.length < 3) {
    drawn.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  const tarotVector = {}
  for (const index of drawn) {
    const card = data.tarot.find((entry) => entry.index === index)
    for (const [key, value] of Object.entries(card.deltas)) {
      tarotVector[key] = (tarotVector[key] || 0) + value
    }
  }
  const tarotUnit = normalize(tarotVector)

  samples.push([
    [answerUnit, weights.answers],
    [zodiacUnit, weights.zodiac],
    [tarotUnit, weights.tarot],
  ])
}

function score(sample, profile) {
  let total = 0
  let weightSum = 0
  for (const [vector, weight] of sample) {
    total += dot(vector, profile) * weight
    weightSum += weight
  }
  return weightSum > 0 ? total / weightSum : 0
}

function pick(group, sample) {
  let best = group[0]
  let bestScore = Number.NEGATIVE_INFINITY
  for (const item of group) {
    const value = score(sample, profiles.get(item)) + (item.bias || 0)
    if (value > bestScore) {
      bestScore = value
      best = item
    }
  }
  return best
}

const groups = [
  { name: 'archetype', list: data.archetypes },
  { name: 'race', list: data.races },
  { name: 'job', list: data.jobs },
  { name: 'faction', list: data.factions },
]

let learningRate = 0.5
for (let round = 0; round < 80; round += 1) {
  const counts = new Map()
  for (const group of groups) {
    for (const item of group.list) counts.set(item, 0)
  }

  for (const sample of samples) {
    for (const group of groups) {
      const winner = pick(group.list, sample)
      counts.set(winner, counts.get(winner) + 1)
    }
  }

  for (const group of groups) {
    const size = group.list.length
    const target = 1 / size
    for (const item of group.list) {
      const actual = counts.get(item) / SAMPLE
      const next = (item.bias || 0) + learningRate * (target - actual)
      item.bias = Math.max(-0.35, Math.min(0.35, Number(next.toFixed(4))))
    }
  }

  learningRate *= 0.93
}

const finalCounts = new Map()
for (const group of groups) {
  for (const item of group.list) finalCounts.set(item, 0)
}
for (const sample of samples) {
  for (const group of groups) {
    const winner = pick(group.list, sample)
    finalCounts.set(winner, finalCounts.get(winner) + 1)
  }
}

console.log('calibrated on', SAMPLE, 'samples')
for (const group of groups) {
  const parts = group.list.map(
    (item) =>
      `${item.id}:${((finalCounts.get(item) / SAMPLE) * 100).toFixed(1)}%`,
  )
  console.log(group.name, parts.join('  '))
}

fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)