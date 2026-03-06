import { enforceMix, minPerType } from '../lib/question-bank/mix'
import { Topic, ExperienceLevel, QuestionSource, QuestionStatus, QuestionType } from '@prisma/client'
import { QuestionSummary } from '../lib/question-bank/types'

function makeQ(type: 'theory' | 'scenario', id = Math.random().toString()): QuestionSummary {
  return {
    id, text: 'Q', type: type as QuestionType,
    topics: [Topic.Docker], difficulty: 2,
    experienceLevel: ExperienceLevel.junior,
    source: QuestionSource.bank, status: QuestionStatus.active,
    createdAt: new Date(),
  }
}

describe('minPerType', () => {
  it('returns 2 for count=5 (minimum count)', () => expect(minPerType(5)).toBe(2))
  it('returns 3 for count=10 (floor(10 * 0.30))', () => expect(minPerType(10)).toBe(3))
  it('returns 6 for count=20 (floor(20 * 0.30))', () => expect(minPerType(20)).toBe(6))
  it('returns 2 for count=6 (floor(6 * 0.30) = 1, clamped to 2)', () => expect(minPerType(6)).toBe(2))
})

describe('enforceMix', () => {
  it('returns zero gaps when mix is satisfied', () => {
    const qs = [makeQ('theory'), makeQ('theory'), makeQ('theory'), makeQ('scenario'), makeQ('scenario'), makeQ('scenario')]
    const { theoryGap, scenarioGap } = enforceMix(qs, 10)
    expect(theoryGap).toBe(0)
    expect(scenarioGap).toBe(0)
  })

  it('returns theory gap when not enough theory questions', () => {
    const qs = [makeQ('scenario'), makeQ('scenario'), makeQ('scenario'), makeQ('scenario')]
    const { theoryGap, scenarioGap } = enforceMix(qs, 10)
    expect(theoryGap).toBe(3)  // min=3, theory=0 → gap=3
    expect(scenarioGap).toBe(0)
  })

  it('returns scenario gap when not enough scenario questions', () => {
    const qs = [makeQ('theory'), makeQ('theory'), makeQ('theory'), makeQ('theory')]
    const { theoryGap, scenarioGap } = enforceMix(qs, 10)
    expect(theoryGap).toBe(0)
    expect(scenarioGap).toBe(3)
  })

  it('returns gaps for both types when neither meets minimum', () => {
    const qs = [makeQ('theory'), makeQ('scenario')]
    const { theoryGap, scenarioGap } = enforceMix(qs, 10)
    expect(theoryGap).toBe(2)   // min=3, theory=1
    expect(scenarioGap).toBe(2) // min=3, scenario=1
  })

  it('uses count=5 minimum of 2 per type', () => {
    const qs = [makeQ('theory'), makeQ('theory'), makeQ('scenario'), makeQ('scenario'), makeQ('theory')]
    const { theoryGap, scenarioGap } = enforceMix(qs, 5)
    expect(theoryGap).toBe(0)
    expect(scenarioGap).toBe(0)
  })

  it('returns gap of 2 for count=5 with 0 scenario', () => {
    const qs = [makeQ('theory'), makeQ('theory'), makeQ('theory'), makeQ('theory'), makeQ('theory')]
    const { theoryGap, scenarioGap } = enforceMix(qs, 5)
    expect(theoryGap).toBe(0)
    expect(scenarioGap).toBe(2)
  })
})
