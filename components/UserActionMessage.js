const UserActionMessage = ({ message }) => (
  <div className="flex-grow flex items-center content-center justify-center flex-col m-8">
    <div className="text-3xl mb-2">¯\_(ツ)_/¯</div>
    <div>{message}</div>
  </div>
)

export const UserNotFound = () => (
  <UserActionMessage message="No matches found" />
)

export const UserError = () => <UserActionMessage message="Error!" />

export const UserLoading = () => <UserActionMessage message="Loading..." />

export default UserActionMessage
