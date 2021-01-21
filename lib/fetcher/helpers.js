import get from 'lodash/get'
import last from 'lodash/last'

const COLORS = {
  BLUE: 'BLUE',
  PINK: 'PINK',
}

export const errorLogger = (name, error) => {
  const response = { name, error }

  return response
}

export const getMostPointsWon = (outcomes) => {
  const winner = outcomes.find((outcome) => outcome.winner === true)

  if (!winner) {
    return 0
  }

  const topPredictor = winner.topPredictors.length
    ? winner.topPredictors[0]
    : null

  if (!topPredictor) {
    return 0
  }

  return winner.ratio * topPredictor.points
}

const calculateTeamsRatio = (outcomes, winnerId) => {
  const [blue, pink] = outcomes
  const totalPoints = blue.totalPoints + pink.totalPoints

  const calculateTeamRAtio = (team) => {
    team.winner = team.id === winnerId
    team.ratio =
      (totalPoints / team.totalUsers / team.totalPoints) * team.totalUsers

    if (Number.isNaN(team.ratio)) {
      team.ratio = 0
    }
    return team
  }

  return {
    blue,
    pink,
  }
}

const createStatsCache = () => ({
  maxPinkRatio: {
    value: 0,
    id: null,
  },
  maxBlueRatio: {
    value: 0,
    id: null,
  },
  mostWon: {
    value: 0,
    id: null,
  },
})

export const formatPredictions = (
  data,
  maxPinkRatio,
  maxBlueRatio,
  mostWon
) => {
  let cache = createStatsCache()
  let statsCache = createStatsCache()
  let output = {
    predictions: [],
    updateStats: {
      maxPinkRatio: null,
      maxBlueRatio: null,
      mostWon: null,
    },
  }

  if (maxPinkRatio) {
    statsCache.maxPinkRatio.id = maxPinkRatio.id
    statsCache.maxPinkRatio.value = maxPinkRatio.outcomes.find(
      (outcome) => outcome.color === COLORS.PINK
    ).ratio
  }
  if (maxBlueRatio) {
    statsCache.maxBlueRatio.id = maxBlueRatio.id
    statsCache.maxBlueRatio.value = maxBlueRatio.outcomes.find(
      (outcome) => outcome.color === COLORS.BLUE
    ).ratio
  }
  if (mostWon) {
    statsCache.mostWon.id = mostWon.id
    statsCache.mostWon.value = getMostPointsWon(mostWon.outcomes)
  }

  const _data = data.map((item) => {
    const { blue, pink } = calculateTeamsRatio(
      item.outcomes,
      item.winningOutcome.id
    )

    // Stat1: mostWon
    const maxWonPoints = getMostPointsWon([blue, pink])
    if (
      maxWonPoints > cache.mostWon.value &&
      maxWonPoints > statsCache.mostWon.value
    ) {
      cache.mostWon.value = maxWonPoints
      cache.mostWon.id = item.id
    }

    // Stat2: maxBlueRatio
    if (
      blue.ratio > cache.maxBlueRatio.value &&
      blue.ratio > statsCache.maxBlueRatio.value
    ) {
      cache.maxBlueRatio.value = blue.ratio
      cache.maxBlueRatio.id = item.id
    }

    // Stat3: maxPinkRatio
    if (
      pink.ratio > cache.maxPinkRatio.value &&
      pink.ratio > statsCache.maxPinkRatio.value
    ) {
      cache.maxPinkRatio.value = pink.ratio
      cache.maxPinkRatio.id = item.id
    }

    return {
      ...item,
      isMaxPinkRatio: false,
      isMaxBlueRatio: false,
      isMostWon: false,
      outcomes: [blue, pink],
    }
  })

  // Stat1: mostWon
  if (cache.mostWon.id) {
    const mostWonIndex = _data.findIndex((item) => item.id === cache.mostWon.id)
    if (mostWonIndex !== -1) {
      _data[mostWonIndex].isMostWon = true
    }
    if (statsCache.mostWon.id) {
      output.updateStats.mostWon = statsCache.mostWon.id
    }
  }

  // Stat2: maxBlueRatio
  if (cache.maxBlueRatio.id) {
    const maxBlueRatioIndex = _data.findIndex(
      (item) => item.id === cache.maxBlueRatio.id
    )
    if (maxBlueRatioIndex !== -1) {
      _data[maxBlueRatioIndex].isMaxBlueRatio = true
    }
    if (statsCache.maxBlueRatio.id) {
      output.updateStats.maxBlueRatio = statsCache.maxBlueRatio.id
    }
  }

  // Stat3: maxPinkRatio
  if (cache.maxPinkRatio.id) {
    const maxPinkRatioIndex = _data.findIndex(
      (item) => item.id === cache.maxPinkRatio.id
    )
    if (maxPinkRatioIndex !== -1) {
      _data[maxPinkRatioIndex].isMaxPinkRatio = true
    }
    if (statsCache.maxPinkRatio.id) {
      output.updateStats.maxPinkRatio = statsCache.maxPinkRatio.id
    }
  }

  output.predictions = _data
  return output
}

export const filterPredictions = (data, lastPrediction) => {
  if (!lastPrediction) {
    return data
  }

  const findLastPredictionIndex = data.findIndex(
    ({ node }) => node.id === lastPrediction.id
  )

  if (findLastPredictionIndex !== -1) {
    return data.slice(0, findLastPredictionIndex)
  }
}

export function mergeResponseData(
  data,
  cache,
  first = 25,
  lastPrediction = null
) {
  let newCache
  if (!cache) {
    newCache = {
      channel: {
        id: data.channel.id,
        displayName: data.channel.displayName,
        url: data.channel.url,
        profileImageURL: data.channel.owner.profileImageURL,
      },
      predictions: [],
      hasNextPage: false,
      nextCursor: null,
    }
  } else {
    newCache = { ...cache }
  }

  const newPredictions = filterPredictions(
    [...data.channel.resolvedPredictionEvents.edges],
    lastPrediction
  )

  console.log('mergeResponseData', newPredictions.length)

  newCache.hasNextPage =
    newPredictions.length !== first
      ? false
      : data.channel.resolvedPredictionEvents.pageInfo.hasNextPage
  newCache.nextCursor = newPredictions.length
    ? last(newPredictions).cursor
    : null
  newCache.predictions = [
    ...newCache.predictions,
    ...newPredictions.map(({ node }) => ({
      ...node,
      channel: newCache.channel.id,
      outcomes: node.outcomes.map((outcome, index) => {
        // Prevent from different colors
        const _outcome = { ...outcome }
        _outcome.color = index === 0 ? COLORS.BLUE : COLORS.PINK

        return _outcome
      }),
    })),
  ]

  return newCache
}
