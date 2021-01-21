import { gql } from 'apollo-server-express'

const typeDefs = gql`
  directive @authCache on FIELD_DEFINITION
  directive @cacheResponse on FIELD_DEFINITION

  scalar Date
  scalar LongInt

  type UserPreview {
    id: String
    displayName: String
  }

  enum PredictionOutcomeColor {
    BLUE
    PINK
  }

  enum FilterPredictions {
    LATEST
    OLDEST
  }

  type PredictionsConnection {
    nodes: [PredictionEvent]!
    totalNodes: Int!
    limit: Int!
    page: Int!
    totalPages: Int!
    pagingCounter: Int!
    hasPrevPage: Boolean!
    hasNextPage: Boolean!
    prevPage: Int
    nextPage: Int
  }

  type ChannelsConnection {
    nodes: [ChannelPreview]!
    totalNodes: Int!
    limit: Int!
    page: Int!
    totalPages: Int!
    pagingCounter: Int!
    hasPrevPage: Boolean!
    hasNextPage: Boolean!
    prevPage: Int!
    nextPage: Int!
  }

  type Prediction {
    points: Int!
    user: UserPreview!
  }

  type PredictionOutcome {
    id: String!
    title: String!
    topPredictors: [Prediction!]!
    color: PredictionOutcomeColor!
    totalPoints: Int!
    totalUsers: Int!
    winner: Boolean!
    ratio: Float!
  }

  type PredictionEvent {
    id: String!
    title: String!
    createdAt: Date!
    endedAt: Date!
    lockedAt: Date!
    predictionWindowSeconds: Int!
    status: String!
    createdBy: UserPreview
    lockedBy: UserPreview
    endedBy: UserPreview
    outcomes: [PredictionOutcome!]!
  }

  type Channel {
    id: Int!
    displayName: String!
    url: String!
    profileImageURL: String!
    appCreatedAt: String!
    appUpdatedAt: String!
    predictions(
      page: Int = 1
      limit: Int = 10
      filter: FilterPredictions = LATEST
    ): PredictionsConnection! @cacheResponse
    prediction(id: String!): PredictionEvent @cacheResponse
    stats: ChannelStats @cacheResponse
  }

  type ChannelPreview {
    id: Int!
    displayName: String!
    url: String!
    profileImageURL: String!
    appCreatedAt: String!
    appUpdatedAt: String!
  }

  type ChannelStats {
    totalBlue: Int!
    totalPink: Int!
    totalPredictions: Int!
    totalPoints: LongInt!
    totalUsers: Int!
    maxPredictionPoints: Int!
    maxPredictionUsers: Int!
    maxBlueRatio: Float!
    maxPinkRatio: Float!
    mostWonEvent: PredictionEvent
    maxPinkRatioEvent: PredictionEvent
    maxBlueRatioEvent: PredictionEvent
  }

  type FlushCacheResponse {
    nbItems: Int!
    nbItemsRemoved: Int!
  }

  type TopWinner {
    channel: ChannelPreview!
    prediction: PredictionEvent!
    ratio: Float!
    pointsWon: Float!
    winner: Prediction!
  }

  type Query {
    ping: String!
    caches: [String!]! @authCache
    channel(login: String!): Channel @cacheResponse
    topChannels: [ChannelPreview!]! @cacheResponse
    topWinners: [TopWinner!]! @cacheResponse
    channels(page: Int = 1, limit: Int = 10): ChannelsConnection! @cacheResponse
  }

  type Mutation {
    flushCache: FlushCacheResponse! @authCache
    removeCaches(pattern: [String!]!): FlushCacheResponse! @authCache
  }
`

export default typeDefs
