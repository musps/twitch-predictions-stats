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
import { errorLogger, compareOldField } from '../helpers'
import { twitchRequest } from './twitch'
import { buildCacheObject, removeCaches } from './cache'
import {
  mergeResponseData,
  formatPredictions,
  generatePageCache,
} from './helpers'

const fetchChannelData = ({
  channelId,
  channelName,
  first = 25,
  after = null,
  cache = null,
  lastPrediction = null,
  ignoreWhenNoPredictions = false,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await twitchRequest({
        id: channelId,
        login: channelName ? channelName.toLowerCase() : null,
        first,
        after,
      })

      if (!response.channel) {
        throw new Error('channel_not_found')
      }

      if (!response.channel.owner) {
        throw new Error('channel_banned')
      }

      if (
        ignoreWhenNoPredictions &&
        response.channel.resolvedPredictionEvents.edges.length === 0
      ) {
        throw new Error(`channel_no_predictions`)
      }

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
          channelId,
          channelName,
          first,
          after: data.nextCursor,
        }

        fetchChannelData({
          ...nextVariables,
          cache: data,
          lastPrediction,
        })
          .then(resolve)
          .catch(reject)
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
        channel: _channel,
        predictions,
        updateStats,
      } = await fetchChannelData({
        channelId: channel.id,
        lastPrediction,
      })

      const newProfileImageURL = compareOldField(
        channel.profileImageURL,
        _channel.profileImageURL
      )
      const updateChannelAssetsResponse = await updateChannelAssets(
        channel.id,
        newProfileImageURL,
        compareOldField(channel.displayName, _channel.displayName),
        compareOldField(channel.name, _channel.name),
        compareOldField(channel.url, _channel.url)
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

      resolve({
        nb: predictions.length,
        message: `${predictions.length} new predictions`,
        newProfileImageURL,
      })
    } catch (error) {
      reject(errorLogger('updateChannelPredictions', error))
    }
  })
}

export const initializeChannel = ({
  name,
  flushCache = true,
  ignoreWhenNoPredictions = true,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkChannel = await getChannel(name).exec()

      if (checkChannel) {
        throw new Error('Channel already in database')
      } else {
        const data = await fetchChannelData({
          channelName: name,
          ignoreWhenNoPredictions,
        })
        const channel = await createChannel(data.channel).save()
        const predictions = await addPredictions(channel, data.predictions)

        if (flushCache) {
          const removesCachesResponse = await removeCaches([
            buildCacheObject('channels'),
            buildCacheObject('channel', { login: name }),
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
      let newPredictions = 0
      let clearHomeCache = false

      for (let channel of channels) {
        const response = await updateChannelPredictions(channel.name).catch(
          console.log
        )

        if (response && response.newProfileImageURL) {
          removeCachesPattern.push(
            buildCacheObject('channel', { login: channel.name })
          )
          clearHomeCache = true
        }

        if (response && response.nb > 0) {
          newPredictions += response.nb

          removeCachesPattern.push(
            buildCacheObject('channel.stats', { login: channel.name })
          )

          removeCachesPattern.push(
            buildCacheObject('channel.predictions', {
              login: channel.name,
            })
          )
        }
      }

      if (removeCachesPattern.length) {
        if (clearHomeCache) {
          removeCachesPattern.push(buildCacheObject('topChannels'))
        }

        removeCachesPattern.push(buildCacheObject('topWinners'))

        const removesCachesResponse = await removeCaches(removeCachesPattern)
        const generatePageCacheResponseTopWin = await generatePageCache(
          '/top-winners'
        )
        const generatePageCacheResponseChannels = await generatePageCache(
          '/channels'
        )

        console.log({
          removesCachesResponse,
          generatePageCacheResponseTopWin,
          generatePageCacheResponseChannels,
        })
      }

      resolve('done')
    } catch (error) {
      reject(errorLogger('updateChannelsPredictions', error))
    }
  })
}
