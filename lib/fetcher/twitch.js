import { gql, GraphQLClient } from 'graphql-request'

const endpoint = 'https://gql.twitch.tv/gql'

export const client = new GraphQLClient(endpoint, {
  headers: {
    'client-id': process.env.TWITCH_CLIENT_ID,
  },
})

export const FETCH_PREDICTIONS_QUERY = gql`
  fragment UserPreview on User {
    id
    displayName
  }

  query GetChannelPredictions(
    $id: ID
    $login: String
    $after: Cursor
    $first: Int!
  ) {
    channel(id: $id, name: $login) {
      id
      displayName
      url
      owner {
        profileImageURL(width: 150)
      }
      resolvedPredictionEvents(after: $after, first: $first) {
        edges {
          cursor
          node {
            title
            id
            createdAt
            endedAt
            lockedAt
            predictionWindowSeconds
            status
            createdBy {
              ...UserPreview
            }
            lockedBy {
              ...UserPreview
            }
            endedBy {
              ...UserPreview
            }
            outcomes {
              id
              title
              color
              totalPoints
              totalUsers
              topPredictors {
                points
                user {
                  ...UserPreview
                }
              }
            }
            winningOutcome {
              id
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`

export const twitchRequest = (variables = {}) =>
  client.request(FETCH_PREDICTIONS_QUERY, variables)
