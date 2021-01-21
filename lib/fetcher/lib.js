import fs from 'fs'
import last from 'lodash/last'
import get from 'lodash/get'
import {
  getChannel,
  getLastPrediction,
  getChannelPredictionsStats,
  addPredictions,
  updatePredictionStat,
  updateChannelAssets,
  createChannel,
  getChannels,
} from '../data/queries'
import { twitchRequest } from './twitch'
import { buildCacheObject, removeCaches } from './cache'
import {
  mergeResponseData,
  formatPredictions,
  errorLogger,
  getMostPointsWon,
} from './helpers'

const fetchChannelData = ({
  login,
  first = 25,
  after = null,
  cache = null,
  lastPrediction = null,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await twitchRequest({
        login: login.toLowerCase(),
        first,
        after,
      })

      const data = mergeResponseData(response, cache, first, lastPrediction)

      if (!data.hasNextPage) {
        let formatedPredictions
        let channelStats = {}

        if (lastPrediction && data.predictions.length) {
          channelStats = await getChannelPredictionsStats(data.channel.id)
        }

        formatedPredictions = formatPredictions({
          predictions: data.predictions,
          ...channelStats,
        })

        data.predictions = formatedPredictions.predictions
        data.updateStats = formatedPredictions.updateStats

        resolve(data)
      } else {
        const nextVariables = {
          login,
          first,
          after: data.nextCursor,
        }

        fetchChannelData({
          ...nextVariables,
          cache: data,
          lastPrediction,
        }).then(resolve)
      }
    } catch (error) {
      reject(errorLogger('fetchChannelData', error))
    }
  })
}

export const updateChannelPredictions = (login) => {
  return new Promise(async (resolve, reject) => {
    console.log('updateChannelPredictions', login)

    try {
      const channel = await getChannel(login).exec()

      if (!channel) {
        throw new Error(`Channel ${login} not found`)
      }

      const lastPrediction = await getLastPrediction(channel.id).exec()
      const {
        channel: _chnanel,
        predictions,
        updateStats,
      } = await fetchChannelData({
        login: channel.displayName,
        lastPrediction,
      })

      const updateChannelAssetsResponse = await updateChannelAssets(
        channel.id,
        channel.profileImageURL === _chnanel.profileImageURL
          ? null
          : _chnanel.profileImageURL
      )

      if (predictions.length) {
        if (updateStats.mostWon) {
          await updatePredictionStat(
            'isMostWon',
            channel.id,
            updateStats.mostWon,
            false
          ).exec()
        }

        if (updateStats.maxBlueRatio) {
          await updatePredictionStat(
            'isMaxBlueRatio',
            channel.id,
            updateStats.maxBlueRatio.id,
            false
          ).exec()
        }

        if (updateStats.maxPinkRatio) {
          await updatePredictionStat(
            'isMaxPinkRatio',
            channel.id,
            updateStats.maxPinkRatio.id,
            false
          ).exec()
        }

        const addPredictionsResponse = await addPredictions(
          channel,
          predictions
        )
      }

      resolve(`${predictions.length} new predictions`)
    } catch (error) {
      reject(errorLogger('updateChannelPredictions', error))
    }
  })
}

export const initializeChannel = (login, flushCache = true) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkChannel = await getChannel(login).exec()

      if (checkChannel) {
        throw new Error('Channel already in database')
      } else {
        const data = await fetchChannelData({ login })
        const channel = await createChannel(data.channel).save()
        const predictions = await addPredictions(channel, data.predictions)

        if (flushCache) {
          const removesCachesResponse = await removeCaches([
            buildCacheObject('channel'),
          ])
        }

        resolve('done')
      }
    } catch (error) {
      reject(errorLogger('initializeChannel', error))
    }
  })
}

export const updateChannelsPredictions = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const channels = await getChannels().exec()
      const removeCachesPattern = []

      for (let channel of channels) {
        const response = await updateChannelPredictions(
          channel.displayName
        ).catch(console.log)

        if (response !== 'no more entries') {
          removeCachesPattern.push(
            buildCacheObject('channel', { login: channel.displayName })
          )
          removeCachesPattern.push(
            buildCacheObject('channel.predictions', {
              login: channel.displayName,
            })
          )
        }
      }

      if (removeCachesPattern.length) {
        const removesCachesResponse = await removeCaches(removeCachesPattern)
      }

      resolve('done')
    } catch (error) {
      reject(errorLogger('updateChannelsPredictions', error))
    }
  })
}
