import { Fragment } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { stringify } from 'query-string'
import { useQuery, NetworkStatus, gql } from '@apollo/client'
import DataCard from '../../components/DataCard'
import Page from '../../components/Page'
import Channel from '../../components/Channel'
import {
  UserNotFound,
  UserError,
  UserLoading,
} from '../../components/UserActionMessage'
import { Channel as ChannelFragments } from '../../lib/fragments'

const PREDICTIONS_QUERY = gql`
  ${ChannelFragments.Prediction}

  query GetPredictions(
    $login: String!
    $page: Int!
    $filter: FilterPredictions
  ) {
    channel(login: $login) {
      predictions(page: $page, limit: 10, filter: $filter)
        @connection(key: "predictions_nodes", filter: ["filter"]) {
        totalNodes
        hasNextPage
        nextPage
        nodes {
          ...Prediction
        }
      }
    }
  }
`

const parseFilter = (value = '', defautlValue = 'LATEST') => {
  const filters = ['LATEST', 'OLDEST']
  if (filters.includes(value.toUpperCase())) {
    return value
  }
  return defautlValue
}

function UserPage({ defaultLogin }) {
  const router = useRouter()
  const { login, filter } = router.query
  const filterTag = parseFilter(filter)

  const { loading, error, data, fetchMore, variables, refetch } = useQuery(
    PREDICTIONS_QUERY,
    {
      variables: {
        login: login || defaultLogin,
        filter: filterTag,
        page: 1,
      },
    }
  )

  const loadMore = () => {
    const { hasNextPage, nextPage } = channel.predictions

    if (!hasNextPage) {
      return
    }

    fetchMore({
      variables: {
        ...variables,
        page: nextPage,
      },
      updateQuery: (_, { fetchMoreResult }) => {
        const { channel } = fetchMoreResult
        const previousDocs = data?.channel?.predictions?.nodes || []

        return {
          ...fetchMoreResult,
          channel: {
            predictions: {
              ...channel.predictions,
              nodes: [...previousDocs, ...channel.predictions.nodes],
            },
          },
        }
      },
    })
  }

  const loadFilter = (event) => {
    const queryParams = stringify({
      filter: event.target.value,
    })

    router.push(`/user/${login}?${queryParams}`, undefined, {
      shallow: true,
    })
  }

  const { channel } = data || {}

  return (
    <Page>
      <Head>
        <title>User: {login}</title>
      </Head>

      <Channel login={login}>
        {loading && <UserLoading />}
        {error && <UserError />}
        {!loading && !error && !channel && <UserNotFound />}
        {!loading && !error && (
          <Fragment>
            <div className="flex items-center justify-between">
              <h1 className="text-xl">Predictions</h1>

              <label labelfor="filter-predictions" className="block">
                <select
                  aria-label="Filter predictions by criteria"
                  name="filter-predictions"
                  onChange={loadFilter}
                  value={filterTag}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-800 dark:bg-gray-800">
                  <option value="LATEST">Latest</option>
                  <option value="OLDEST">Oldest</option>
                </select>
              </label>
            </div>

            <DataCard nodes={channel?.predictions?.nodes} />

            {channel?.predictions?.hasNextPage && (
              <button
                type="button"
                className="inline-flex items-center justify-center p-3 bg-gray-200 rounded-md shadow hover:bg-opacity-20 dark:bg-gray-800"
                onClick={loadMore}>
                Load more
              </button>
            )}
          </Fragment>
        )}
      </Channel>
    </Page>
  )
}

UserPage.getInitialProps = async ({ query }) => {
  const { login } = query

  return {
    defaultLogin: login,
  }
}

export default UserPage
