import { getChannel, getChannels } from '../../../data/queries'
import { errorLogger } from '../../../helpers'
import { twitchRequestGames } from './twitch'
import {
  queryGetPredictionsGameNotInDB,
  queryGeneratePredictionWithHisGame,
  queryUpsertGames,
} from './queries'

// Fetch the latest available games and insert in database
export const updateGames = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await queryGetPredictionsGameNotInDB().exec()
      const games = result.map((item) => item.games)

      if (games.length === 0) {
        resolve('No new games available')
        return
      }

      const resultTwitch = await twitchRequestGames(games)
      const resultBulk = await queryUpsertGames(Object.values(resultTwitch))

      resolve('done')
    } catch (error) {
      reject(errorLogger('updateGames', error))
    }
  })
}

// Sync channel predictions with the game played
export const updateChannelPredictionsGame = (login, ignoreExisting = true) => {
  return new Promise(async (resolve, reject) => {
    try {
      const channel = await getChannel(login).exec()

      if (!channel) {
        throw 'channel not found'
      }

      const response = await queryGeneratePredictionWithHisGame(
        channel.id,
        ignoreExisting
      ).exec()

      resolve('done')
    } catch (error) {
      reject(errorLogger('updateChannelPredictionsGame', error))
    }
  })
}

// Sync channels predictions with the game played
export const updateChannelsPredictionsGame = (ignoreExisting = true) => {
  return new Promise(async (resolve, reject) => {
    try {
      const channels = await getChannels().exec()

      for (let channel of channels) {
        console.log(channel.displayName)
        const response = await queryGeneratePredictionWithHisGame(
          channel.id,
          ignoreExisting
        )
          .exec()
          .catch(console.log)
      }

      resolve('done')
    } catch (error) {
      reject(errorLogger('updateChannelsPredictionsGame', error))
    }
  })
}
