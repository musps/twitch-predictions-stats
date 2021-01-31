import {
  compareCache,
  formatNumber,
  formatThousands,
  formatRatio,
  getMostPointsWon,
  sumOutcomes,
  calculateTeamRatio,
  calculateTeamsRatio,
} from '../helpers'
import predictions from './__mocks__/predictions'


test('compareCache', () => {
  // Test 1: With no matches
  const input1 = { name: 'Channel', args: { login: 'Solary' } }
  const cache1 = { name: 'Channels' }
  expect(compareCache(input1, cache1)).toEqual(false)

  // Test 2: With match
  const input2 = { name: 'Channels' }
  const cache2 = { name: 'Channels' }
  expect(compareCache(input2, cache2)).toEqual(true)

  // Test 3: Witch match and mulitple args
  const input3 = { name: 'Channel', args: { login: 'Solary' } }
  const cache3 = { name: 'Channel', args: { login: 'Solary', page: 2 } }
  expect(compareCache(input3, cache3)).toEqual(true)
})

test('formatNumber', () => {
  expect(formatNumber(450)).toEqual(450)
  expect(formatNumber(1000)).toEqual('1K')
  expect(formatNumber(10000)).toEqual('10K')
  expect(formatNumber(100000)).toEqual('100K')
  expect(formatNumber(1000000)).toEqual('1M')
  expect(formatNumber(225050512)).toEqual('225.1M')
})

test('formatThousands', () => {
  expect(formatThousands(1000)).toEqual('1,000')
  expect(formatThousands(200000)).toEqual('200,000')
  expect(formatThousands(10000000)).toEqual('10,000,000')
})

test('formatRatio', () => {
  expect(formatRatio(22.219933)).toEqual('22.22')
})

test('getMostPointsWon', () => {
  const prediction = predictions[0]

  expect(getMostPointsWon(prediction)).toEqual(442500)
  expect(getMostPointsWon(null)).toEqual(0)
  expect(getMostPointsWon(prediction, false)).toEqual({
    id: '92b970eb-4d9a-4105-8a72-5ea3b6a887ae',
    points: '442,500',
    user: {
      displayName: '0tekal',
      id: '481803990',
    },
  })
})

test('sumOutcomes', () => {
  const prediction = predictions[0]

  expect(sumOutcomes(prediction.outcomes)).toMatchObject({
    blue: {
      color: 'BLUE',
      id: '2cf49417-869f-498d-acc4-9e42bd99499f',
      maxPoints: 250000,
      percentage: 56,
      ratio: 1.77,
      title: 'TEAM WAKZ',
      totalPoints: 2060674,
      totalUsers: 117,
      winner: true,
    },
    pink: {
      color: 'PINK',
      id: '1e948693-1692-4147-a8c6-bade49a167bd',
      maxPoints: 250000,
      percentage: 44,
      ratio: 2.29,
      title: 'TEAM MECHANT',
      totalPoints: 1594655,
      totalUsers: 91,
      winner: false,
    },
  })
})

test('calculateTeamRatio', () => {
  const { outcomes } = predictions[0]
  const winner = outcomes.find((outcome) => outcome.winner)
  const totalPoints = outcomes.reduce((acc, cur) => acc + cur.totalPoints, 0)

  expect(calculateTeamRatio(outcomes[0], totalPoints, winner.id)).toMatchObject(
    {
      ratio: 1.7738511768479635,
    }
  )
})

test('calculateTeamsRatio', () => {
  const { outcomes } = predictions[0]
  const winner = outcomes.find((outcome) => outcome.winner)

  expect(calculateTeamsRatio(outcomes, winner.id)).toMatchObject({
    blue: {
      ratio: 1.7738511768479635,
    },
    pink: {
      ratio: 2.2922381330130968,
    },
  })
})
