import isEqual from 'lodash/isEqual'
import isObject from 'lodash/isObject'
import transform from 'lodash/transform'

export function showChannelName(channel) {
  if (!channel) return false
  return channel.name !== channel.displayName.toLowerCase()
}

export const compareOldField = (oldField, newField) => {
  return newField !== oldField && newField
}

// @source https://gist.github.com/Yimiprod/7ee176597fef230d1451
export function difference(object, base) {
  function changes(object, base) {
    return transform(object, function (result, value, key) {
      if (!isEqual(value, base[key])) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? changes(value, base[key])
            : value
      }
    })
  }
  return changes(object, base)
}

export const compareCache = (input, cache) => {
  try {
    if (input.name !== cache.name) {
      return false
    }

    const diff = difference(input.args, cache.args)

    return Object.keys(diff).length === 0
  } catch (error) {
    return false
  }
}

export function isFieldSelected(fieldNodes, fieldName) {
  const { selections } = fieldNodes[0].selectionSet

  const field = selections.find(
    (selection) =>
      selection.kind === 'Field' && selection.name.value === fieldName
  )

  return !!field
}

export const COLORS = {
  BLUE: 'BLUE',
  PINK: 'PINK',
}

export const errorLogger = (name, error) => {
  const response = { name, error }

  return response
}

export function formatNumber(num) {
  if ((num > 999) & (num < 1000000)) {
    return parseFloat((num / 1000).toFixed(1)) + 'K'
  }
  if (num >= 1000000) {
    return parseFloat((num / 1000000).toFixed(1).toString()) + 'M'
  }
  if (num < 900) {
    return num
  }
}

export function formatThousands(num) {
  return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

export const formatRatio = (ratio) => {
  return ratio.toFixed(2)
}

export function sumOutcomes(outcomes) {
  const [blueTeam, pinkTeam] = outcomes
  const sumPoints = blueTeam.totalPoints + pinkTeam.totalPoints
  // a% = a * 100 / (a + b)
  // b% = 100 - a%
  const blueTeamPercentage = parseInt(
    ((blueTeam.totalPoints * 100) / sumPoints).toFixed(),
    10
  )
  const pinkTeamPercentage = 100 - blueTeamPercentage

  return {
    blue: {
      ...blueTeam,
      percentage: blueTeamPercentage,
      maxPoints: getTopPredictorPoints(blueTeam.topPredictors),
    },
    pink: {
      ...pinkTeam,
      percentage: pinkTeamPercentage,
      maxPoints: getTopPredictorPoints(pinkTeam.topPredictors),
    },
  }
}

export const getTopPredictorPoints = (predictors = []) => {
  return predictors.reduce(
    (acc, cur) => (cur.points > acc ? cur.points : acc),
    0
  )
}

export const getMostPointsWon = (prediction, onlyValue = true) => {
  if (!prediction) {
    return 0
  }

  const winner = prediction.outcomes.find((outcome) => outcome.winner === true)

  if (!winner) {
    return 0
  }

  const topPredictor = winner.topPredictors.length
    ? winner.topPredictors[0]
    : null

  if (!topPredictor) {
    return 0
  }

  const points = winner.ratio * topPredictor.points

  if (onlyValue) {
    return points
  }

  return {
    points: formatThousands(points),
    id: prediction.id,
    user: topPredictor.user,
  }
}

export const calculateTeamRatio = (team, totalPoints, winnerId) => {
  team.winner = team.id === winnerId
  team.ratio =
    (totalPoints / team.totalUsers / team.totalPoints) * team.totalUsers

  if (Number.isNaN(team.ratio)) {
    team.ratio = 0
  }

  return team
}

export const calculateTeamsRatio = (outcomes, winnerId) => {
  const [blue, pink] = outcomes
  const totalPoints = blue.totalPoints + pink.totalPoints

  return {
    blue: calculateTeamRatio(blue, totalPoints, winnerId),
    pink: calculateTeamRatio(pink, totalPoints, winnerId),
  }
}
