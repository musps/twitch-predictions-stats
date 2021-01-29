import mongoose from 'mongoose'

const ChannelVideosSchema = new mongoose.Schema({
  id: String,
  createdAt: String,
  status: String,
  channel: String,
  lengthSeconds: Number,
  moments: [
    {
      id: String,
      durationMilliseconds: Number,
      positionMilliseconds: Number,
      game: String,
    },
  ],
})

export default mongoose.models.channels_videos ||
  mongoose.model('channels_videos', ChannelVideosSchema)
