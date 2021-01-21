import ChannelPredictions from './models/ChannelPredictions'
import ChannelUser from './models/ChannelUser'

export const paginationLabels = {
  totalDocs: 'totalNodes',
  docs: 'nodes',
  limit: 'limit',
  page: 'page',
  nextPage: 'nextPage',
  prevPage: 'prevPage',
  totalPages: 'totalPages',
  pagingCounter: 'pagingCounter',
  // meta: 'paginator',
}

export const SORT_VALUES = {
  LATEST: 'LATEST',
  OLDEST: 'OLDEST',
}
export const SORT = {
  LATEST: -1,
  OLDEST: 1,
}

export const getChannelsPagination = (
  page,
  limit,
  sort = SORT_VALUES.LATEST
) => {
  return ChannelUser.paginate(
    {},
    {
      page,
      limit,
      customLabels: paginationLabels,
      sort: {
        appCreatedAt: SORT[sort],
      },
    }
  )
}

export const getPredictionsPagination = (
  channelId,
  page,
  limit,
  sort = SORT_VALUES.LATEST
) => {
  return ChannelPredictions.paginate(
    {
      channel: channelId,
    },
    {
      page,
      limit,
      sort: {
        createdAt: SORT[sort],
      },
      customLabels: paginationLabels,
    }
  )
}

export const getLastPrediction = (channelId) => {
  return ChannelPredictions.findOne(
    {
      channel: channelId,
    },
    {},
    {
      sort: {
        createdAt: -1,
      },
    }
  )
}

export const getPrediction = (channelId, predictionId) => {
  return ChannelPredictions.findOne({
    channel: channelId,
    id: predictionId,
  })
}

export const getChannelPredictionsStats = async (channelId) => {
  const predictions = await ChannelPredictions.aggregate([
    [
      {
        $match: {
          channel: channelId,
          $or: [
            {
              isMostWon: true,
            },
            {
              isMaxBlueRatio: true,
            },
            {
              isMaxPinkRatio: true,
            },
          ],
        },
      },
    ],
  ]).exec()

  return {
    mostWon: predictions.find((item) => item.isMostWon),
    maxPinkRatio: predictions.find((item) => item.isMaxPinkRatio),
    maxBlueRatio: predictions.find((item) => item.isMaxBlueRatio),
  }
}

export const getChannelStats = (channelId) => {
  return ChannelPredictions.aggregate([
    [
      {
        $match: {
          channel: channelId,
        },
      },
      {
        $addFields: {
          totalPoints: {
            $sum: '$outcomes.totalPoints',
          },
          totalUsers: {
            $sum: '$outcomes.totalUsers',
          },
          blue: {
            $arrayElemAt: ['$outcomes', 0],
          },
          pink: {
            $arrayElemAt: ['$outcomes', 1],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalBlue: {
            $sum: {
              $cond: [
                {
                  $eq: ['$blue.winner', true],
                },
                1,
                0,
              ],
            },
          },
          totalPink: {
            $sum: {
              $cond: [
                {
                  $eq: ['$pink.winner', true],
                },
                1,
                0,
              ],
            },
          },
          totalPredictions: {
            $sum: 1,
          },
          totalPoints: {
            $sum: '$totalPoints',
          },
          totalUsers: {
            $sum: '$totalUsers',
          },
          maxPredictionPoints: {
            $max: '$totalPoints',
          },
          maxPredictionUsers: {
            $max: '$totalUsers',
          },
          maxBlueRatio: {
            $max: '$blue.ratio',
          },
          maxPinkRatio: {
            $max: '$pink.ratio',
          },
        },
      },
    ],
  ])
}

export const getChannels = () => {
  return ChannelUser.find({})
}

export const getChannel = (displayName) => {
  return ChannelUser.findOne({
    displayName: {
      $regex: new RegExp(`^${displayName}$`, 'i'),
    },
  })
}

export const getTopChannels = (limit = 10) => {
  return ChannelUser.find({}).limit(limit)
}

export const getTopWinners = (limit = 10) => {
  return ChannelPredictions.aggregate([
    {
      $match: {
        isMostWon: true,
      },
    },
    {
      $addFields: {
        team: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$outcomes',
                as: 'item',
                cond: {
                  $eq: ['$$item.winner', true],
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $match: {
        'team.topPredictors': {
          $exists: true,
          $ne: [],
        },
      },
    },
    {
      $addFields: {
        'team.firstUser': {
          $arrayElemAt: ['$team.topPredictors', 0],
        },
      },
    },
    {
      $addFields: {
        'team.pointsWon': {
          $multiply: ['$team.ratio', '$team.firstUser.points'],
        },
      },
    },
    {
      $sort: {
        'team.pointsWon': -1,
      },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'channels_users',
        localField: 'channel',
        foreignField: 'id',
        as: 'channel',
      },
    },
  ])
}

export const createChannel = (data) => {
  return new ChannelUser({ ...data })
}

export const addPredictions = (channel, predictions = []) => {
  // Add channel's id inside all prediction object
  const _predictions = predictions.map((item) => ({
    ...item,
    channel: channel.id,
  }))

  return ChannelPredictions.insertMany(_predictions)
}

export const updateChannelAssets = (channelId, profileImageURL = null) => {
  const updateProfileImage = !profileImageURL
    ? {}
    : { profileImageURL: profileImageURL }

  return ChannelUser.updateOne(
    {
      id: channelId,
    },
    {
      $set: {
        ...updateProfileImage,
        appUpdatedAt: new Date().toISOString(),
      },
    }
  )
}

export const updatePredictionStat = (
  field,
  channelId,
  predictionId,
  state = false
) => {
  const fields = ['isMostWon', 'isMaxBlueRatio', 'isMaxPinkRatio']

  if (!fields.includes(field)) {
    throw new Error(`field '${field}' is not allowed!`)
  }

  return ChannelPredictions.updateOne(
    {
      channel: channelId,
      'predictions.id': predictionId,
    },
    {
      $set: {
        [field]: state,
      },
    }
  )
}
