import { Fragment } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery, NetworkStatus, gql } from '@apollo/client'
import DataCard from '../../../../components/DataCard'
import Page from '../../../../components/Page'
import Channel from '../../../../components/Channel'
import {
  UserNotFound,
  UserError,
  UserLoading,
} from '../../../../components/UserActionMessage'

import {
  formatRatio,
  formatNumber,
  formatThousands,
} from '../../../../lib/numbers'
import { Channel as ChannelFragments } from '../../../../lib/fragments'
import { initializeApollo, addApolloState } from '../../../../lib/apolloClient'

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

function UserPage({ defaultLogin }) {
  const router = useRouter()
  const { login, predictionId } = router.query
  const { loading, error, data } = useQuery(PREDICTIONS_QUERY, {
    variables: {
      login: login,
      predictionId,
    },
  })

  const goBack = () => {
    const { login } = router.query

    router.push(`/user/${login}`)
  }

  const { channel } = data || {}

  console.log({ login, defaultLogin })
  return (
    <Page>
      <Head>
        <title>User: {login}</title>
      </Head>

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

            <DataCard
              nodes={channel?.prediction ? [channel.prediction] : []}
              fullMode={true}
            />
          </div>
        )}
      </Channel>
    </Page>
  )
}

export default UserPage
