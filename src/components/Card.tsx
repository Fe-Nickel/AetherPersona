import { forwardRef } from 'react'
import type { PersonaCard } from '../data/types'
import { statKeys, statLabels } from '../engine/derive'
import { ElementGlyph, JobGlyph, RaceGlyph, TarotGlyph } from './Symbols'

export const CARD_W = 1080
export const CARD_H = 1440

const posLabel: Record<string, string> = {
  past: '过往',
  present: '当下',
  future: '未至',
}

export const Card = forwardRef<HTMLDivElement, { card: PersonaCard }>(
  function Card({ card }, ref) {
    return (
      <div className="card" ref={ref}>
        <div className="card__glow" />
        <div className="card__rim">
          <div className="card__rim-inner" />
        </div>
        <div className="card__content">
          <header className="card__head">
            <div className="card__eyebrow">AETHER PERSONA</div>
            <h1 className="card__title">{card.type.title}</h1>
            <div className="card__sub">
              {card.race.name} · {card.job.name} · {card.faction.name}
            </div>
          </header>

          <div className="card__hero">
            <div className="crest">
              <div className="crest__outer">
                <RaceGlyph id={card.race.id} size={150} className="crest__glyph" />
                <div className="crest__badge">
                  <JobGlyph id={card.job.id} size={54} className="crest__badge-glyph" />
                </div>
              </div>
            </div>
            <div className="card__tags">
              <div className="tag">
                <span>元素</span>
                <b>
                  {card.element.name} · {card.zodiac.name}座
                </b>
              </div>
              <div className="tag">
                <span>阵营</span>
                <b>{card.faction.name}</b>
              </div>
              <div className="tag">
                <span>天赋</span>
                <b>{card.talent}</b>
              </div>
              <div className="tag">
                <span>技能</span>
                <b>{card.skill}</b>
              </div>
            </div>
          </div>

          <div className="card__cards">
            {card.cards.map((drawn) => (
              <div className="tcard" key={drawn.position}>
                <TarotGlyph index={drawn.card.index} size={64} className="tcard__glyph" />
                <div className="tcard__meta">
                  <div className="tcard__pos">{posLabel[drawn.position]}</div>
                  <div className="tcard__name">{drawn.card.name}</div>
                  <div className="tcard__kw">{drawn.card.keyword}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card__stats">
            {statKeys.map((key) => (
              <div className="stat" key={key}>
                <span className="stat__label">{statLabels[key]}</span>
                <span className="stat__track">
                  <span
                    className="stat__fill"
                    style={{ width: `${card.stats[key] * 10}%` }}
                  />
                </span>
                <span className="stat__value">{card.stats[key]}</span>
              </div>
            ))}
          </div>

          <div className="card__lore">
            <p className="card__story">{card.story}</p>
            <div className="card__weak">弱点 · {card.weakness}</div>
          </div>

          <footer className="card__foot">
            <span className="card__serial">{card.serial}</span>
            <span className="card__mark">
              <ElementGlyph id={card.element.key} size={16} className="card__mark-glyph" />
              仅供娱乐 · 异界人格卡
            </span>
            <span className="card__code">
              贴合 {Math.round(Math.max(0, card.similarity) * 100)}%
            </span>
          </footer>
        </div>
      </div>
    )
  },
)