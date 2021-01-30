import mongoose from 'mongoose'

const GameSchema = new mongoose.Schema({
  id: String,
  name: String,
  avatarURL: String,
})

GameSchema.index({ id: 1 })

export default mongoose.models.games || mongoose.model('games', GameSchema)
