import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CARD_H, CARD_W } from './components/Card'
import { TarotGlyph } from './components/Symbols'
import { questions, positions, scale, zodiacs } from './data/content'
import { buildCard, shuffleDeck, tarotByIndex } from './engine/derive'
import { exportCardPng } from './engine/exportPng'
import type { DrawnCard } from './data/types'

type Phase = 'intro' | 'zodiac' | 'quiz' | 'draw' | 'result'

const stepOf = (phase: Phase): number => {
  if (phase === 'intro') return 0
  if (phase === 'zodiac') return 1
  if (phase === 'quiz') return 2
  return 3
}

const steps = ['星座', '测评', '塔罗']

export default function App() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [zodiacId, setZodiacId] = useState<string>('cancer')
  const [picked, setPicked] = useState<number[]>([])
  const [cardScale, setCardScale] = useState(0.5)
  const [busy, setBusy] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  const answered = questions.filter(
    (question) => answers[question.id] !== undefined,
  ).length
  const complete = answered === questions.length

  const deckKey = `v1|${zodiacId}|${JSON.stringify(answers)}`
  const deck = useMemo(() => shuffleDeck(deckKey), [deckKey])

  const card = useMemo(() => {
    if (phase !== 'result' || picked.length !== 3) return null
    const drawn: DrawnCard[] = picked.map((index, i) => ({
      position: positions[i].key,
      card: tarotByIndex(index),
    }))
    return buildCard({ answers, zodiacId, cards: drawn })
  }, [phase, picked, answers, zodiacId])

  useEffect(() => {
    if (phase !== 'result') return
    const update = () => {
      const maxWidth = Math.min(window.innerWidth - 48, 760)
      const maxHeight = window.innerHeight - 200
      setCardScale(Math.min(maxWidth / CARD_W, maxHeight / CARD_H, 0.72))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [phase])

  const pick = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const drawCard = (index: number) => {
    if (phase !== 'draw') return
    setPicked((prev) =>
      prev.includes(index) || prev.length >= 3 ? prev : [...prev, index],
    )
  }

  const reset = () => {
    setAnswers({})
    setPicked([])
    setZodiacId('cancer')
    setPhase('intro')
  }

  const handleExport = async () => {
    if (!cardRef.current || !card || busy) return
    setBusy(true)
    try {
      await exportCardPng(cardRef.current, `aether-persona-${card.serial}.png`, 2)
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败'
      window.alert(message)
    } finally {
      setBusy(false)
    }
  }

  if (phase === 'result' && card) {
    return (
      <div className="stage">
        <div className="stage__body stage__body--center">
          <div
            className="stage__card"
            style={{ width: CARD_W * cardScale, height: CARD_H * cardScale }}
          >
            <div
              className="stage__card-inner"
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${cardScale})`,
              }}
            >
              <Card ref={cardRef} card={card} />
            </div>
          </div>

          <div className="result-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleExport}
              disabled={busy}
            >
              {busy ? '生成中…' : '导出分享图'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={reset}>
              重新开始
            </button>
            <span className="result-actions__serial">编号 {card.serial}</span>
          </div>
        </div>
      </div>
    )
  }

  const step = stepOf(phase)

  return (
    <div className="stage">
      <div className="stage__body">
        {phase === 'intro' && (
          <section className="step">
            <div className="step__eyebrow">AETHER PERSONA · 异界人格卡</div>
            <h1 className="step__title">你的异世界身份</h1>
            <p className="step__lead">
              星座定元素，四轴定人格，三张塔罗写下你的过往、当下与未至。
              几分钟后，你会得到一张属于自己的异世界身份。
            </p>
            <ul className="intro__list">
              <li>
                <b>24</b> 道题
              </li>
              <li>
                <b>3</b> 张亲手抽的塔罗牌
              </li>
              <li>
                <b>1</b> 个异世界身份
              </li>
            </ul>
            <div className="step__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setPhase('zodiac')}
              >
                开始
              </button>
            </div>
            <p className="intro__note">
              同一组答案与同一手牌，永远得到同一张卡。
            </p>
          </section>
        )}

        {phase === 'zodiac' && (
          <section className="step">
            <div className="step__eyebrow">第一步 · 星座</div>
            <h1 className="step__title">先选出你的星座</h1>
            <p className="step__lead">
              星座决定你的元素属性。火、土、风、水会改变卡面的色调与能力加成，
              选一个你觉得最像自己的。
            </p>

            <div className="zodiacs zodiacs--wide">
              {zodiacs.map((zodiac) => (
                <button
                  key={zodiac.id}
                  type="button"
                  className={
                    zodiacId === zodiac.id ? 'zodiac zodiac--on' : 'zodiac'
                  }
                  onClick={() => setZodiacId(zodiac.id)}
                >
                  {zodiac.name}
                </button>
              ))}
            </div>

            <div className="step__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setPhase('quiz')}
              >
                进入测评
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setPhase('intro')}
              >
                返回
              </button>
            </div>
          </section>
        )}

        {phase === 'quiz' && (
          <section className="step">
            <div className="step__eyebrow">第二步 · 人格四轴</div>
            <h1 className="step__title">回答八个问题</h1>
            <p className="step__lead">
              已答 {answered} / {questions.length}。答案决定你的四条轴，
              进而决定称号、种族、职业与阵营。
            </p>

            <div className="quiz">
              {questions.map((question, index) => (
                <div className="question" key={question.id}>
                  <div className="question__text">
                    {index + 1}. {question.text}
                  </div>
                  <div className="scale">
                    {scale.labels.map((label, valueIndex) => (
                      <button
                        key={label}
                        type="button"
                        className={
                          answers[question.id] === valueIndex
                            ? 'scale__btn scale__btn--on'
                            : 'scale__btn'
                        }
                        onClick={() => pick(question.id, valueIndex)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="step__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setPhase('draw')}
                disabled={!complete}
              >
                {complete
                  ? '进入塔罗'
                  : `还有 ${questions.length - answered} 题未答`}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setPhase('zodiac')}
              >
                上一步
              </button>
            </div>
          </section>
        )}

        {phase === 'draw' && (
          <section className="step">
            <div className="step__eyebrow">第三步 · 塔罗</div>
            <h1 className="step__title">抽出三张牌</h1>
            <p className="step__lead">
              从牌堆里依次抽出三张，分别对应你的过往、当下与未至。
            </p>

            <div className="draw__slots">
              {positions.map((position, index) => {
                const value = picked[index]
                return (
                  <div
                    className={
                      value === undefined ? 'slot' : 'slot slot--filled'
                    }
                    key={position.key}
                  >
                    <span className="slot__label">{position.label}</span>
                    {value === undefined ? (
                      <span className="slot__empty">待抽</span>
                    ) : (
                      <>
                        <TarotGlyph
                          index={value}
                          size={24}
                          className="slot__glyph"
                        />
                        <span className="slot__name">
                          {tarotByIndex(value).name}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="deck">
              {deck.map((entry) => {
                const at = picked.indexOf(entry.index)
                const open = at >= 0
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={open ? 'tile tile--open' : 'tile'}
                    disabled={open || picked.length >= 3}
                    onClick={() => drawCard(entry.index)}
                  >
                    {open ? (
                      <>
                        <TarotGlyph
                          index={entry.index}
                          size={24}
                          className="tile__glyph"
                        />
                        <span className="tile__name">{entry.name}</span>
                        <span className="tile__pos">
                          {positions[at].label}
                        </span>
                      </>
                    ) : (
                      <span className="tile__back">
                        <span className="tile__back-mark" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="step__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setPhase('result')}
                disabled={picked.length !== 3}
              >
                {picked.length === 3
                  ? '揭晓卡面'
                  : `还需抽 ${3 - picked.length} 张`}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setPhase('quiz')}
              >
                上一步
              </button>
            </div>
          </section>
        )}
      </div>

      {phase !== 'intro' && (
        <footer className="progressbar">
          <div className="progressbar__track">
            <span
              className="progressbar__fill"
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
          <div className="progressbar__labels">
            {steps.map((label, index) => (
              <span
                key={label}
                className={index + 1 <= step ? 'on' : undefined}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>
        </footer>
      )}
    </div>
  )
}