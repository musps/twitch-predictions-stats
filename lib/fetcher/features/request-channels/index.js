import last from 'lodash/last'
import { ACTION_ENUM } from '../../../data/models/RequestUsers'
import { errorLogger } from '../../../helpers'
import { getAvailableUsers, updateUserAction } from './queries'
import { initializeChannel } from '../../commands'

const parseResponse = (response) => {
  switch (response) {
    case 'done':
      return ACTION_ENUM.DONE
    case 'channel_not_found':
      return ACTION_ENUM.NOT_FOUND
    case 'channel_banned':
      return ACTION_ENUM.BANNED
    case 'channel_no_predictions':
      return ACTION_ENUM.NO_PREDICTIONS
    default:
      return ACTION_ENUM.ERROR
  }
}

export function requestChannels() {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await getAvailableUsers()

      for (let user of users) {
        console.log('user:', user.name)

        const response = await initializeChannel({
          name: user.name,
        }).catch(({ error }) => {
          return error.error.message
        })

        const action = parseResponse(response)
        console.log({ action })

        const upsert = await updateUserAction({
          name: user.name,
          action,
        })
      }

      resolve(true)
    } catch (error) {
      reject(errorLogger('requestChannels', error))
    }
  })
}
