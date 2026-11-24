import { buildCard, tarotByIndex } from '../tmp/derive.mjs'

const positions = ['past', 'present', 'future']

function fullAnswers(value, mixed = false) {
  const answers = {}
  for (let i = 1; i <= 24; i += 1) {
    answers[`q${i}`] = mixed ? (i % 2 === 0 ? 4 : 0) : value
  }
  return answers
}

const cases = [
  {
    name: '全选「很符合」/ 狮子 / 愚者·隐者·星星',
    answers: fullAnswers(4),
    zodiacId: 'leo',
    cards: [0, 9, 17],
  },
  {
    name: '全选「很不符合」/ 双鱼 / 女祭司·月亮·皇帝',
    answers: fullAnswers(0),
    zodiacId: 'pisces',
    cards: [2, 18, 4],
  },
  {
    name: '奇偶交替 / 摩羯 / 命运之轮·死神·审判',
    answers: fullAnswers(2, true),
    zodiacId: 'capricorn',
    cards: [10, 13, 20],
  },
]

for (const item of cases) {
  const cards = item.cards.map((index, i) => ({
    position: positions[i],
    card: tarotByIndex(index),
  }))
  const card = buildCard({
    answers: item.answers,
    zodiacId: item.zodiacId,
    cards,
  })
  console.log('===', item.name)
  console.log(
    '称号：',
    card.type.title,
    '|',
    card.race.name,
    '·',
    card.job.name,
    '·',
    card.faction.name,
  )
  console.log(`叙述（${card.story.length} 字）：`, card.story)
  console.log(`弱点（${card.weakness.length} 字）：`, card.weakness)
  console.log('属性：', JSON.stringify(card.stats))
  console.log('')
}