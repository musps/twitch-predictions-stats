import { Fragment } from 'react'
import { useRouter } from 'next/router'
import { useQuery, gql } from '@apollo/client'
import { Channel as ChannelFragments } from '@/lib/fragments'
import Page from '@/components/Page'
import {
  UserNotFound,
  UserError,
  UserLoading,
} from '@/components/UserActionMessage'
import { PredictionNodes } from '@/components/Prediction'
import {
  initializeApollo,
  addApolloState,
  APP_IS_BUILDING,
} from '@/lib/apolloClient'

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

export async function getStaticProps({ params }) {
  const apolloClient = initializeApollo()
  const { login } = params

  if (!APP_IS_BUILDING) {
    const response = await apolloClient.query({
      query: PREDICTIONS_QUERY,
      variables: {
        login,
        filter: parseFilter(),
        page: 1,
      },
    })
  }

  return addApolloState(apolloClient, {
    props: {
      login,
    },
    revalidate: 1,
  })
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

function UserPage({ login }) {
  const router = useRouter()
  const filter = parseFilter(router.query.filter)

  const { loading, error, data, fetchMore, variables, refetch } = useQuery(
    PREDICTIONS_QUERY,
    {
      variables: {
        login,
        filter,
        page: 1,
      },
      skip: !login,
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
    const query = {
      filter: parseFilter(event.target.value),
    }

    router.push(
      { pathname: '/user/[login]/beta__embed', query },
      { pathname: `/user/${login}/beta__embed`, query },
      { shallow: true }
    )
  }

  const { channel } = data || {}

  const renderData = () => {
    if (error) {
      return <UserError />
    }

    if (channel) {
      return (
        <Fragment>
          <div className="flex items-center justify-between">
            <h1 className="text-xl">Predictions</h1>

            <label labelfor="filter-predictions" className="block">
              <select
                aria-label="Filter predictions by criteria"
                name="filter-predictions"
                onChange={loadFilter}
                value={filter}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-800 dark:bg-gray-800">
                <option value="LATEST">Latest</option>
                <option value="OLDEST">Oldest</option>
              </select>
            </label>
          </div>

          <PredictionNodes nodes={channel?.predictions?.nodes} />

          {channel?.predictions?.hasNextPage && (
            <button
              type="button"
              className="w-full inline-flex items-center justify-center p-3 bg-gray-200 rounded-md shadow hover:bg-opacity-20 dark:bg-gray-800"
              onClick={loadMore}>
              Load more
            </button>
          )}

          <div className="md:col-span-2 lg:col-span-4 p-4">
            <p className="text-center text-gray-400">
              {channel.predictions.nodes.length} /{' '}
              {channel.predictions.totalNodes}
            </p>
          </div>
        </Fragment>
      )
    }

    return <UserLoading />
  }

  return (
    <Page title={login} embed>
      {renderData()}
    </Page>
  )
}

export default UserPage
