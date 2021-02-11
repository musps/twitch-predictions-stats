import { gql, useMutation } from '@apollo/client'
import cs from 'classnames'

export const MUTATION_REQUEST_CHANNEL = gql`
  mutation requestUser($name: String!) {
    requestUser(name: $name) {
      name
      success
      message
    }
  }
`

function RequestChannelButton({ name }) {
  const [requestChannel, { data, loading, error, called }] = useMutation(
    MUTATION_REQUEST_CHANNEL,
    {
      variables: {
        name,
      },
    }
  )

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={loading || called ? null : requestChannel}
        className={cs(
          'inline-flex items-center justify-center px-4 py-1 space-x-1 bg-gray-200 rounded hover:bg-opacity-20 dark:bg-gray-800 text-lg',
          {
            'animate-pulse': loading,
          }
        )}>
        {loading && 'Sending request...'}
        {called ? 'Request sent!' : 'Make a request'}
      </button>

      {called && (
        <p className="text-center p-4">
          The request has been sent and the channel will be available within 3
          hours
        </p>
      )}
    </div>
  )
}

export default RequestChannelButton
