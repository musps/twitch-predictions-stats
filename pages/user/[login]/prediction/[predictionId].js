import { useRouter } from 'next/router'
import { useQuery, gql } from '@apollo/client'
import { PredictionNodes } from 'components/Prediction'
import Page from 'components/Page'
import Channel from 'components/Channel'
import {
  UserNotFound,
  UserError,
  UserLoading,
} from 'components/UserActionMessage'
import { Channel as ChannelFragments } from 'lib/fragments'

const PREDICTIONS_QUERY = gql`
  ${ChannelFragments.Prediction}

  query GetPrediction($login: String!, $predictionId: String!) {
    channel(login: $login) {
      prediction(id: $predictionId) {
        ...Prediction
      }
    }
  }
`

function UserPredictionPage() {
  const { query, push } = useRouter()
  const { login, predictionId } = query
  const { loading, error, data } = useQuery(PREDICTIONS_QUERY, {
    variables: {
      login,
      predictionId,
    },
    skip: !login && !predictionId,
  })

  const goBack = () => push(`/user/${login}`)
  const { channel } = data || {}

  return (
    <Page title={login}>
      <Channel login={login}>
        {loading && <UserLoading />}
        {!loading && error && <UserError />}
        {!loading && !error && !channel && <UserNotFound />}

        {!loading && !error && (
          <div className="lg:col-span-3 flex flex-grow flex-col">
            <div className="flex items-center justify-between">
              <h1 className="text-xl">Prediction</h1>

              <button
                title="Go back to channel predictions list"
                type="button"
                className="inline-flex items-center justify-center p-3 text-blue-700 hover:rounded-md text-sm hover:shadow hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={goBack}>
                View All
              </button>
            </div>

            <PredictionNodes
              nodes={channel?.prediction ? [channel.prediction] : []}
              fullMode={true}
            />
          </div>
        )}
      </Channel>
    </Page>
  )
}

export default UserPredictionPage
