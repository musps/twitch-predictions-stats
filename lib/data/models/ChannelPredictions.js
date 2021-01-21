import mongoose from 'mongoose'
import FloatDefault from 'mongoose-float'
import QueryPaginator from 'mongoose-paginate-v2'

const Float = FloatDefault.loadType(mongoose)

const UserPreviewSchema = new mongoose.Schema({
  id: String,
  displayName: String,
})

const ChannelPredictionsSchema = new mongoose.Schema({
  title: String,
  id: String,
  channel: String,
  createdAt: String,
  endedAt: String,
  lockedAt: String,
  predictionWindowSeconds: Number,
  status: String,
  createdBy: UserPreviewSchema,
  lockedBy: UserPreviewSchema,
  endedBy: UserPreviewSchema,
  isMaxPinkRatio: Boolean,
  isMaxBlueRatio: Boolean,
  isMostWon: Boolean,
  outcomes: [
    {
      id: String,
      title: String,
      color: String,
      totalPoints: Number,
      totalUsers: Number,
      winner: Boolean,
      ratio: Float,
      topPredictors: [
        {
          points: Number,
          user: UserPreviewSchema,
        },
      ],
    },
  ],
})

ChannelPredictionsSchema.plugin(QueryPaginator)

export default mongoose.models.channels_predictions ||
  mongoose.model('channels_predictions', ChannelPredictionsSchema)
