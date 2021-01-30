import ChannelPredictions from '../../../data/models/ChannelPredictions'
import GameSchema from '../../../data/models/Games'

export const queryUpsertGames = (games) => {
  return GameSchema.bulkWrite(
    games.map((game) => ({
      updateOne: {
        filter: {
          id: game.id,
        },
        update: {
          $set: game,
        },
        upsert: true,
      },
    }))
  )
}

export const queryGetPredictionsGameNotInDB = () => {
  return ChannelPredictions.aggregate([
    {
      $group: {
        _id: null,
        games: {
          $addToSet: '$game',
        },
      },
    },
    {
      $project: {
        games: {
          $filter: {
            input: '$games',
            as: 'game',
            cond: {
              $ne: ['$$game', null],
            },
          },
        },
      },
    },
    {
      $unwind: {
        path: '$games',
      },
    },
    {
      $lookup: {
        from: 'games',
        localField: 'games',
        foreignField: 'id',
        as: 'data',
      },
    },
    {
      $match: {
        data: [],
      },
    },
  ])
}

export const queryGeneratePredictionWithHisGame = (
  channelId,
  ignoreExisting = true
) => {
  return ChannelPredictions.aggregate([
    {
      $match: {
        channel: channelId,
        ...(ignoreExisting && {
          game: null,
        }),
      },
    },
    {
      $addFields: {
        createdAtTimestamp: {
          $toLong: {
            $dateFromString: {
              dateString: {
                $substr: ['$createdAt', 0, 23],
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'channels_videos',
        let: {
          channel: '$channel',
          createdAtTimestamp: '$createdAtTimestamp',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$channel', '$$channel'],
              },
            },
          },
          {
            $addFields: {
              createdAtTimestamp: {
                $toLong: {
                  $dateFromString: {
                    dateString: {
                      $substr: ['$createdAt', 0, 23],
                    },
                  },
                },
              },
              endAtTimestamp: {
                $add: [
                  {
                    $toLong: {
                      $dateFromString: {
                        dateString: {
                          $substr: ['$createdAt', 0, 23],
                        },
                      },
                    },
                  },
                  {
                    $multiply: ['$lengthSeconds', 1000],
                  },
                ],
              },
            },
          },
          {
            $match: {
              $and: [
                {
                  $expr: {
                    $gte: ['$$createdAtTimestamp', '$createdAtTimestamp'],
                  },
                },
                {
                  $expr: {
                    $lte: ['$$createdAtTimestamp', '$endAtTimestamp'],
                  },
                },
              ],
            },
          },
        ],
        as: 'videos',
      },
    },
    {
      $project: {
        prediction: '$id',
        createdAt: 1,
        createdAtTimestamp: 1,
        video: {
          $last: '$videos',
        },
      },
    },
    {
      $addFields: {
        game: {
          $filter: {
            input: '$video.moments',
            as: 'moment',
            cond: {
              $gte: [
                '$createdAtTimestamp',
                {
                  $add: [
                    '$video.createdAtTimestamp',
                    '$$moment.positionMilliseconds',
                  ],
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        game: {
          $last: '$game.game',
        },
      },
    },
    {
      $merge: {
        into: 'channels_predictions',
        on: '_id',
        whenMatched: 'merge',
        whenNotMatched: 'insert',
      },
    },
  ])
}
