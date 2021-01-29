import mongoose from 'mongoose'
import {
  test__GetChannelGames,
  test__GetChannelsGames,
  test__UpdateChannelsGames,
} from '../lib/fetcher/commands-channel-videos'
import { generatePredictionWithHisGame } from '../lib/fetcher/predictions-games'

async function init() {
  try {
    await mongoose.connect(process.env.MONGO_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })

    // const res = await test__GetChannelGames('kamet0')
    // const res = await test__UpdateChannelsGames()

    const res = await generatePredictionWithHisGame().exec()

    console.log({ res })
    process.exit(0)
  } catch (error) {
    console.log({ error })
    process.exit(1)
  }
}

init()
