import mongoose from 'mongoose'
import yargs from 'yargs'
import {
  initializeChannel,
  updateChannelPredictions,
  updateChannelsPredictions,
} from '../lib/fetcher/commands'

const options = yargs
  .option('u', {
    alias: 'update',
    describe: 'Update latest predictions',
    type: 'boolean',
  })
  .option('a', {
    alias: 'add',
    describe: 'Add & fetch a new channel',
    type: 'boolean',
  })
  .option('l', {
    alias: 'login',
    describe: 'Twitch channel login',
    type: 'string',
    demandOption: false,
  }).argv

async function init() {
  try {
    await mongoose.connect(process.env.MONGO_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })

    let res
    const { login, update, add } = options

    if (update) {
      if (login) {
        res = await updateChannelPredictions(login)
      } else {
        res = await updateChannelsPredictions()
      }
    }

    if (login && add) {
      res = await initializeChannel(login, false)
    }

    console.log({ res })
    process.exit(0)
  } catch (error) {
    console.log({ error })
    process.exit(1)
  }
}

init()
