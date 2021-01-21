export function formatNumber(num) {
  if ((num > 999) & (num < 1000000)) {
    return parseFloat((num / 1000).toFixed(1)) + 'K'
  }
  if (num > 1000000) {
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
      maxPoints: blueTeam?.topPredictors?.[0]?.points || 0,
    },
    pink: {
      ...pinkTeam,
      percentage: pinkTeamPercentage,
      maxPoints: pinkTeam?.topPredictors?.[0]?.points || 0,
    },
  }
}
