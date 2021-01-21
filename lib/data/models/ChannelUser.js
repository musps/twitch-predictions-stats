import mongoose from 'mongoose'
import QueryPaginator from 'mongoose-paginate-v2'

const ChannelUserSchema = new mongoose.Schema({
  id: String,
  displayName: String,
  url: String,
  profileImageURL: String,
  appCreatedAt: {
    type: String,
    default: new Date().toISOString(),
  },
  appUpdatedAt: {
    type: String,
    default: new Date().toISOString(),
  },
})

ChannelUserSchema.index({ displayName: 1 })
ChannelUserSchema.plugin(QueryPaginator)

export default mongoose.models.channels_users ||
  mongoose.model('channels_users', ChannelUserSchema)
