import { gql } from '@apollo/client'

export const User = {
  UserPreview: gql`
    fragment UserPreviewFragment on UserPreview {
      id
      displayName
    }
  `,
}

export const Channel = {
  Prediction: gql`
    ${User.UserPreview}

    fragment Prediction on PredictionEvent {
      title
      id
      createdAt
      endedAt
      lockedAt
      predictionWindowSeconds
      status
      createdBy {
        ...UserPreviewFragment
      }
      lockedBy {
        ...UserPreviewFragment
      }
      endedBy {
        ...UserPreviewFragment
      }
      outcomes {
        id
        title
        color
        totalPoints
        totalUsers
        ratio
        winner
        topPredictors {
          points
          user {
            ...UserPreviewFragment
          }
        }
      }
    }
  `,
}
