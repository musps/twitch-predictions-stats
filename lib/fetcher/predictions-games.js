import ChannelPredictions from '../data/models/ChannelPredictions'

export const generatePredictionWithHisGame = (channelId) => {
  return ChannelPredictions.aggregate([
    {
      $match: {
        game: null,
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
          $arrayElemAt: ['$videos', 0],
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
                    {
                      $multiply: ['$$moment.positionMilliseconds', 1000],
                    },
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
          $arrayElemAt: ['$game.game', 0],
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
