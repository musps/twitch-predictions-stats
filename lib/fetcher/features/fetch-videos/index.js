import last from 'lodash/last'
import get from 'lodash/get'
import chunk from 'lodash/chunk'
import { getChannel, getChannels } from '../../../data/queries'
import { errorLogger } from '../../../helpers'
import { queryGetLastVideo, queryUpsertVideos } from './queries'
import { twitchRequestVideos, fetchVideosMomentsChunk } from './twitch'

export const updateChannelsVideos = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const channels = await getChannels().exec()

      for (let channel of channels) {
        console.log(channel.displayName)
        const response = await updateChannelVideos(channel.displayName).catch(
          console.log
        )
      }

      resolve('done')
    } catch (error) {
      reject(errorLogger('updateChannelsVideos', error))
    }
  })
}

export function updateChannelVideos(login) {
  return new Promise(async (resolve, reject) => {
    try {
      const channel = await getChannel(login).exec()

      if (!channel) {
        throw new Error('Channel not in database')
      } else {
        const lastVideo = await queryGetLastVideo(channel.id)

        const data = await fetchChannelVideos({
          login: channel.displayName,
          lastVideo,
        })
        const moments = await fetchVideosMoments(data.videos)

        const mergedData = data.videos.map((video) => {
          const videoMoments = moments.find((item) => item.video === video.id)

          // If no moments the streamer only streamed one game and used the previous stream game
          if (videoMoments && videoMoments.moments.length !== 0) {
            video.moments = videoMoments.moments
          }

          return video
        })

        const res = await queryUpsertVideos(mergedData)

        resolve({
          nb: mergedData.length,
        })
      }
    } catch (error) {
      reject(errorLogger('updateChannelVideos', error))
    }
  })
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

function filterVideos(data, lastVideo) {
  // Prediction release date
  const minDate = new Date('2020-10-01T00:00:00Z')
  const _data = data.filter((item) => new Date(item.node.createdAt) > minDate)

  if (lastVideo) {
    const findLastVideoIndex = _data.findIndex(
      ({ node }) => node.id === lastVideo.id
    )

    if (findLastVideoIndex !== -1) {
      // We keep the last video and update his moments.
      _data.splice(findLastVideoIndex + 1)
      return _data
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

  const newVideos = filterVideos([...edges], lastVideo)
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

function fetchVideosMoments(videos, startIndex = 0) {
  const MAX_VIDEO_ITEMS = 35

  return new Promise(async (resolve, reject) => {
    try {
      const videosIdsByChunk = chunk(
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
      reject(errorLogger('fetchVideosMoments', error))
    }
  })
}
