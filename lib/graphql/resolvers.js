import {
  getTopWinners,
  getTopTotalPredictions,
  getTopChannels,
  getChannel,
  getChannelStats,
  getChannelPredictionsStats,
  getPrediction,
  getChannelsPagination,
  getPredictionsPagination,
  SORT_VALUES,
} from '../data/queries'
import { compareCache } from '../helpers'
import { cacheReducer } from './directives/CacheResponseDirective'
import GameSchema from '../data/models/Games'

const MAX_RESULT = 25
const DEFAULT_LIMIT = 10
const DEFAULT_PAGE = 1

const resolvers = {
  Mutation: {
    flushCache: async (_, args, { cache }) => {
      const size = cache.store.keys().length

      const response = {
        nbItems: size,
        nbItemsRemoved: size,
      }

      cache.flush()
      return response
    },
    removeCaches: async (_, { pattern }, { cache }) => {
      const keys = cache.store.keys().map((key) => JSON.parse(key))
      const patternArr = pattern
        .map((patt) => {
          try {
            return JSON.parse(patt)
          } catch {
            return null
          }
        })
        .filter((patt) => patt !== null)

      const matches = keys.filter((key) => {
        for (let pat of patternArr) {
          if (compareCache(pat, key)) {
            return true
          }
        }
        return false
      })

      matches.map((match) => cache.delete(JSON.stringify(match)))

      const response = {
        nbItems: cache.store.keys().length,
        nbItemsRemoved: matches.length,
      }

      return response
    },
  },
  Query: {
    ping: () => 'pong',
    caches: (_, args, { cache }) => {
      const keys = cache.store.keys().slice(0, 100)

      return keys
    },
    topChannels: (_, args, context) => {
      return cacheReducer('topChannels', null, async () => {
        const data = await getTopChannels(22)

        return data
      })
    },
    channels: (_, args) => {
      const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = args
      const proxyLimitLength = limit > MAX_RESULT ? MAX_RESULT : limit

      const options = {
        page,
        limit: proxyLimitLength,
      }

      return cacheReducer('channels', { options }, async () => {
        const data = await getChannelsPagination(page, proxyLimitLength)

        return data
      })
    },
    channel: (_, { login }) => {
      const _login = login.toLowerCase()

      return cacheReducer(
        'channel',
        {
          login: _login,
        },
        async () => {
          const data = await getChannel(_login).exec()

          return data
        }
      )
    },
    topWinners: (_, args) => {
      return cacheReducer('topWinners', null, async () => {
        const data = await getTopWinners(20).exec()

        const response = data.map((item) => {
          return {
            channel: item.channel[0],
            pointsWon: item.team.pointsWon,
            prediction: item,
            ratio: item.team.ratio,
            winner: item.team.firstUser,
          }
        })

        return response
      })
    },
    topTotalPredictions: (_, args) => {
      return cacheReducer('topTotalPredictions', null, async () => {
        const data = await getTopTotalPredictions(20).exec()

        const response = data.map(({ totalPredictions, channel }) => {
          return {
            totalPredictions,
            channel: channel[0],
          }
        })

        return response
      })
    },
  },
  PredictionEvent: {
    game: (parent, args, context) => {
      return cacheReducer(
        'PredictionEvent.game',
        {
          game: parent.game,
        },
        async () => {
          const data = await GameSchema.findOne({ id: parent.game })

          return data
        }
      )
    },
  },
  Channel: {
    prediction: (parent, { id }, context) => {
      return cacheReducer(
        'channel.prediction',
        {
          login: parent.name,
          id,
        },
        async () => {
          const data = await getPrediction(parent.id, id).exec()

          return data
        }
      )
    },
    predictions: (parent, args, context) => {
      const {
        page = DEFAULT_PAGE,
        limit = DEFAULT_LIMIT,
        filter = SORT_VALUES.LATEST,
      } = args
      const proxyLimitLength = limit > MAX_RESULT ? MAX_RESULT : limit

      return cacheReducer(
        'channel.predictions',
        {
          login: parent.name,
          sort: filter,
          page,
          limit: proxyLimitLength,
        },
        async () => {
          const data = await getPredictionsPagination(
            parent.id,
            page,
            proxyLimitLength,
            filter
          )

          return data
        }
      )
    },
    stats: (parent, args, context) => {
      return cacheReducer(
        'channel.stats',
        {
          login: parent.name,
        },
        async () => {
          const channelStatsReq = getChannelStats(parent.id)
          const channelPredictionsStatsReq = getChannelPredictionsStats(
            parent.id
          )

          const data = await Promise.all([
            channelStatsReq,
            channelPredictionsStatsReq,
          ]).then(([[channelStats], predictions]) => {
            const result = channelStats

            if (result && predictions) {
              result.mostWonEvent = predictions.mostWon
              result.maxPinkRatioEvent = predictions.maxPinkRatio
              result.maxBlueRatioEvent = predictions.maxBlueRatio
            }

            return result
          })

          return data
        }
      )
    },
  },
}

export default resolvers
