import { gql, GraphQLClient } from 'graphql-request'

const endpoint = process.env.TPS_ENDPOINT

const client = new GraphQLClient(endpoint, {
  headers: {
    'TPS-AUTH-CACHE': process.env.TPS_AUTH_CACHE,
  },
})

const MUTATION_REMOVE_CACHES = gql`
  mutation removeCaches($pattern: [String!]!) {
    removeCaches(pattern: $pattern) {
      nbItems
      nbItemsRemoved
    }
  }
`

export const buildCacheObject = (name, args) => {
  return JSON.stringify({
    name,
    args,
  })
}

export const removeCaches = (pattern) =>
  client.request(MUTATION_REMOVE_CACHES, {
    pattern,
  })
