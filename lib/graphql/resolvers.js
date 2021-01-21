import {
  getTopWinnersBeta,
  getTopChannels,
  getChannel,
  getChannelStats,
  getChannelPredictionsStats,
  getPrediction,
  getChannelsPagination,
  getPredictionsPagination,
  SORT_VALUES,
} from '../data/queries'
import { compareCache } from '../objects'
import { cacheReducer } from './directives/CacheResponseDirective'

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
      return cacheReducer(
        'channel',
        {
          login,
        },
        async () => {
          const data = await getChannel(login).exec()

          return data
        }
      )
    },
    topWinners: (_, args) => {
      return cacheReducer('topWinnersBeta', null, async () => {
        const data = await getTopWinnersBeta(20).exec()

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
  },
  Channel: {
    prediction: (parent, { id }, context) => {
      return cacheReducer(
        'channel.prediction',
        {
          login: parent.displayName,
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
          login: parent.displayName,
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
          login: parent.displayName,
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