import RequestUsers, { ACTION_ENUM } from '../../../data/models/RequestUsers'

export const getAvailableUsers = () => {
  return RequestUsers.find({
    action: ACTION_ENUM.REQUEST,
  })
}

export const updateUserAction = ({ name, action }) => {
  return RequestUsers.updateOne(
    {
      name,
    },
    {
      action,
    }
  )
}
