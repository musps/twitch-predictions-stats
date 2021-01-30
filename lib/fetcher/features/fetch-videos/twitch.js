import fetch from 'node-fetch'
import { gql } from 'graphql-request'
import get from 'lodash/get'
import { client } from '../../twitch'
import { errorLogger } from '../../../helpers'

export const FETCH_CHANNELS_VIDEOS = gql`
  query GetChannelVideos($login: String!, $first: Int!, $after: Cursor) {
    user(login: $login) {
      id
      videos(first: $first, sort: TIME, type: ARCHIVE, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            id
            createdAt
            recordedAt
            status
            lengthSeconds
            game {
              id
              displayName
            }
          }
        }
      }
    }
  }
`

export const twitchRequestVideos = ({ login, first = 100, after }) =>
  client.request(FETCH_CHANNELS_VIDEOS, { login, first, after })

//
// HTTP CALL from custom query since the "moments" field is broken
//

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

export function fetchVideosMomentsChunk(videos) {
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
      reject(errorLogger('fetchVideosMomentsChunk', error))
    }
  })
}
