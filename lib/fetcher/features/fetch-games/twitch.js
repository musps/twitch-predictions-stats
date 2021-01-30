import { gql } from 'graphql-request'
import { client } from '../../twitch'

export const FETCH_GAME_QUERY = gql`
  query GetGame($id: ID) {
    game(id: $id) {
      id
      name
      avatarURL(width: 80, height: 80)
    }
  }
`

export const fetchGameByIDs = (ids) => {
  const ids_gql = ids.map(
    (id) => gql`
      game_${id}: game(id: "${id}") {
        id
        name,
        avatarURL(width: 80, height: 80)
      }
    `
  )

  return gql`
    query getGames {
      ${ids_gql}
    }
  `
}

export const twitchRequestGames = (ids) => client.request(fetchGameByIDs(ids))
