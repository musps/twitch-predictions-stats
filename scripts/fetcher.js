import mongoose from 'mongoose'
import yargs from 'yargs'
import {
  initializeChannel,
  updateChannelPredictions,
  updateChannelsPredictions,
} from '../lib/fetcher/commands'
import {
  updateChannelsVideos,
  updateChannelVideos,
} from '../lib/fetcher/features/fetch-videos'
import {
  updateChannelsPredictionsGame,
  updateChannelPredictionsGame,
  updateGames,
} from '../lib/fetcher/features/fetch-games'

const options = yargs
  .option('p', {
    alias: 'predictions',
    describe: 'Update latest predictions',
    type: 'boolean',
  })
  .option('v', {
    alias: 'videosAndGames',
    describe: 'Update latest videos and games',
    type: 'boolean',
  })
  .option('l', {
    alias: 'login',
    describe: 'Twitch channel login',
    type: 'string',
    demandOption: false,
  })
  .option('i', {
    alias: 'ignoreExisting',
    describe: 'Ignore existing predictions game',
    type: 'boolean',
    default: true,
  })
  .option('u', {
    alias: 'update',
    describe: 'Update latest predictions',
    type: 'boolean',
  })
  .option('a', {
    alias: 'add',
    describe: 'Add and fetch a new channel',
    type: 'boolean',
  }).argv

async function init() {
  try {
    await mongoose.connect(process.env.MONGO_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })

    let res
    const {
      videosAndGames,
      predictions,
      login,
      ignoreExisting,
      update,
      add,
    } = options
    const isLogin = login !== null && login !== undefined

    switch (true) {
      case videosAndGames === true:
        switch (true) {
          case isLogin:
            // 1: Fetch latest videos
            console.log('- updateChannelVideos')
            console.log(await updateChannelVideos(login))
            // 2: Sync predictions with games
            console.log('- updateChannelPredictionsGame')
            console.log(
              await updateChannelPredictionsGame(login, ignoreExisting)
            )
            // 3: Fetch latest games
            console.log('- updateGames')
            console.log(await updateGames())
            break
          default:
            // 1: Fetch latest videos
            console.log('- updateChannelsVideos')
            await updateChannelsVideos()
            // 2: Sync predictions with games
            console.log('- updateChannelsPredictionsGame')
            await updateChannelsPredictionsGame(ignoreExisting)
            // 3: Fetch latest games
            console.log('- updateGames')
            await updateGames()
            break
        }
        break
      case predictions === true:
        switch (true) {
          case isLogin && add:
            res = await initializeChannel(login, false)
            break
          case isLogin && update:
            res = await updateChannelPredictions(login)
            break
          case update:
            res = await updateChannelsPredictions()
            break
        }
        break
    }

    console.log({ res })
    process.exit(0)
  } catch (error) {
    console.log({ error })
    process.exit(1)
  }
}

init()
