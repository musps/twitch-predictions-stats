import mongoose from 'mongoose'
import {
  test__GetChannelGames,
  test__GetChannelsGames,
  test__UpdateChannelsGames,
} from '../lib/fetcher/commands-channel-videos'

async function init() {
  try {
    await mongoose.connect(process.env.MONGO_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })

    const res = await test__GetChannelGames('gotaga')
    // const res = await test__UpdateChannelsGames()

    console.log({ res })
    process.exit(0)
  } catch (error) {
    console.log({ error })
    process.exit(1)
  }
}

init()

// const getDateInSecondes = (strData) => new Date(strData).getTime() / 1000

// const baseDate = getDateInSecondes('2020-12-10T18:53:13Z')
// const predictionDate = getDateInSecondes('2021-01-21T01:31:39.29388387Z')
// console.log({ baseDate, predictionDate })

// Limiter les vidéos à novembre 2020

// zerator
// ogaming
// RocketLeague
