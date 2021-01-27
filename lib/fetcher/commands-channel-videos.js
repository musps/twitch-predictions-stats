import axios from 'axios'
import fetch from 'node-fetch'
import last from 'lodash/last'
import get from 'lodash/get'
import ChannelVideo from '../data/models/ChannelVideos'
import { getChannel, getChannels } from '../data/queries'
import { errorLogger } from '../helpers'
import { twitchRequestVideos } from './twitch'

export const test__GetChannelsGames = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const channels = await getChannels().exec()

      for (let channel of channels) {
        console.log(channel.displayName)
        const response = await test__GetChannelGames(channel.displayName).catch(
          console.log
        )

        console.log(response)
      }

      resolve('done')
    } catch (error) {
      reject(errorLogger('test__GetChannelsGames', error))
    }
  })
}

export function test__GetChannelGames(login) {
  return new Promise(async (resolve, reject) => {
    try {
      const channel = await getChannel(login).exec()

      if (!channel) {
        throw new Error('Channel not in database')
      } else {
        const data = await fetchChannelVideos({ login: channel.displayName })
        const moments = await fetchVideosMoments(data.videos)
        const mergedData = data.videos.map((video) => {
          const videoMoments = moments.find((item) => item.video === video.id)

          // If no moments the streamer only streamed one game and used the previous stream game
          if (videoMoments && videoMoments.moments.length !== 0) {
            video.moments = videoMoments.moments
          }

          return video
        })

        const res = await ChannelVideo.bulkWrite(
          mergedData.map((item) => ({
            updateOne: {
              filter: {
                id: item.id,
              },
              update: {
                $set: item,
              },
              upsert: true,
            },
          }))
        )

        resolve({
          nb: mergedData.length,
        })
      }
    } catch (error) {
      reject(errorLogger('test__GetChannelGames', error))
    }
  })
}

function filterVideos(data, lastVideo) {
  // Prediction release date
  const minDate = new Date('2020-10-01T00:00:00Z')
  const _data = data.filter((item) => new Date(item.node.createdAt) > minDate)

  if (lastVideo) {
    const findLastVideoIndex = _data.findIndex(
      ({ node }) => node.id === lastVideo.id
    )

    if (findLastVideoIndex !== -1) {
      return _data.slice(0, findLastVideoIndex)
    }
  }

  return _data
}

function mergeResponseDataVideos(data, cache, first = 100, lastVideo) {
  let newCache
  if (!cache) {
    newCache = {
      videos: [],
      hasNextPage: false,
      nextCursor: null,
    }
  } else {
    newCache = { ...cache }
  }

  const { pageInfo, edges } = data.user.videos

  const newVideos = filterVideos([...edges])
  console.log('mergeResponseDataVideos', newVideos.length)

  newCache.hasNextPage =
    newVideos.length !== first ? false : pageInfo.hasNextPage
  newCache.nextCursor = newVideos.length ? last(newVideos).cursor : null
  newCache.videos = [
    ...newCache.videos,
    ...newVideos.map(({ node }) => ({
      ...node,
      channel: data.user.id,
      moments: [
        {
          id: null,
          durationMilliseconds: 0,
          positionMilliseconds: 0,
          type: 'GAME_CHANGE',
          game: get(node.game, 'id', null),
        },
      ],
    })),
  ]

  return newCache
}

const fetchChannelVideos = ({
  login,
  first = 100,
  after = null,
  cache = null,
  lastVideo = null,
  channel,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await twitchRequestVideos({
        login: login.toLowerCase(),
        first,
        after,
      })

      const data = mergeResponseDataVideos(response, cache, first, lastVideo)

      if (!data.hasNextPage) {
        resolve(data)
      } else {
        const nextVariables = {
          login,
          first,
          after: data.nextCursor,
        }

        fetchChannelVideos({
          ...nextVariables,
          cache: data,
          lastVideo,
        }).then(resolve)
      }
    } catch (error) {
      reject(errorLogger('fetchChannelVideos', error))
    }
  })
}

function chunkArray(array, size) {
  if (!array) return []
  const firstChunk = array.slice(0, size) // create the first chunk of the given array
  if (!firstChunk.length) {
    return array // this is the base case to terminal the recursive
  }
  return [firstChunk].concat(chunkArray(array.slice(size, array.length), size))
}

const queryVideoMoments = (videoId) => ({
  operationName: 'VideoPreviewCard__VideoMoments',
  variables: {
    videoId: `${videoId}`,
  },
  extensions: {
    persistedQuery: {
      version: 1,
      sha256Hash:
        '0094e99aab3438c7a220c0b1897d144be01954f8b4765b884d330d0c0893dbde',
    },
  },
})

function fetchVideosMomentsChunk(videos) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fetch('https://gql.twitch.tv/gql', {
        headers: {
          'Content-Type': 'application/json',
          'client-id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        },
        body: JSON.stringify(videos.map((video) => queryVideoMoments(video))),
        method: 'POST',
      }).then((resp) => resp.json())

      const parseResponse = data.map((item) => {
        const { video } = item.data

        const moments = video.moments.edges.map(({ node }) => ({
          id: node.id,
          durationMilliseconds: node.durationMilliseconds,
          positionMilliseconds: node.positionMilliseconds,
          type: node.type,
          game: get(node, 'details.game.id', null),
        }))

        return {
          video: video.id,
          moments,
        }
      })

      resolve(parseResponse)
    } catch (error) {
      console.log({ error })
      reject(errorLogger('fetchVideosMoments', error))
    }
  })
}

function fetchVideosMoments(videos, startIndex = 0) {
  const MAX_VIDEO_ITEMS = 35

  return new Promise(async (resolve, reject) => {
    try {
      const videosIdsByChunk = chunkArray(
        videos.map((video) => video.id),
        MAX_VIDEO_ITEMS
      )

      const data = await Promise.all(
        videosIdsByChunk.map(fetchVideosMomentsChunk)
      ).then((...data) => {
        return data[0].reduce((acc, cur) => {
          return acc.concat(cur)
        }, [])
      })

      resolve(data)
    } catch (error) {
      console.log({ error })
      reject(errorLogger('fetchVideosMoments', error))
    }
  })
}
