import mongoose from 'mongoose'

export const ACTION_ENUM = {
  REQUEST: 'request',
  IN_PROGRESS: 'inprogress',
  NO_PREDICTIONS: 'nopredictions',
  BANNED: 'banned',
  NOT_FOUND: 'notfound',
  ERROR: 'error',
  DONE: 'done',
}

const RequestUsersSchema = new mongoose.Schema({
  name: String,
  action: {
    type: String,
    default: ACTION_ENUM.REQUEST, // ACTION_ENUM.*
  },
  count: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: new Date().toISOString(),
  },
  updatedAt: {
    type: Date,
    default: new Date().toISOString(),
  },
})

export default mongoose.models.request_users ||
  mongoose.model('request_users', RequestUsersSchema)
