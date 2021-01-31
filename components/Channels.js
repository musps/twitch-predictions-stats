import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'
import { UserLoading, UserError } from './UserActionMessage'

export const GET_CHANNELS_QUERY = gql`
  query GetChannels($page: Int!, $limit: Int!) {
    channels(page: $page, limit: $limit) @connection(key: "channels_nodes") {
      totalNodes
      hasNextPage
      nextPage
      nodes {
        id
        displayName
        profileImageURL
      }
    }
  }
`

function ChannelCard({ channel }) {
  return (
    <Link href={`/user/${channel.displayName}`}>
      <a
        title={`Go to ${channel.displayName} page`}
        className="bg-white p-4 transition-shadow border rounded-lg shadow-sm hover:shadow dark:border-gray-800 dark:bg-gray-800">
        <div className="flex items-center h-full">
          <div className="relative mr-4">
            <img
              className="rounded-full border border-gray-100 dark:border-gray-800 shadow-sm"
              src={channel.profileImageURL}
              alt="Channel profile image"
              width="48"
              height="48"
            />
          </div>
          <span className="text-gray-400 truncate">{channel.displayName}</span>
        </div>
      </a>
    </Link>
  )
}

function Channels({ limit }) {
  const { loading, error, data, variables, fetchMore } = useQuery(
    GET_CHANNELS_QUERY,
    {
      variables: {
        page: 1,
        limit,
      },
      skip: !limit,
    }
  )

  const { channels } = data || {}

  const loadMore = () => {
    const { nextPage } = channels

    fetchMore({
      variables: {
        ...variables,
        page: nextPage,
      },
      updateQuery: (_, { fetchMoreResult }) => {
        const { channels } = fetchMoreResult

        return {
          ...fetchMoreResult,
          channels: {
            ...channels,
            nodes: [...data.channels.nodes, ...channels.nodes],
          },
        }
      },
    })
  }

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl">Channels</h2>

      {loading && <UserLoading />}
      {error && <UserError />}
      {(channels?.nodes || []).length !== 0 && (
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
          {channels.nodes.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}

          {channels.hasNextPage && (
            <button
              type="button"
              className="md:col-span-2 lg:col-span-4 inline-flex items-center justify-center p-4 bg-gray-200 rounded-md shadow hover:bg-opacity-20 dark:bg-gray-800"
              onClick={loadMore}>
              Load more
            </button>
          )}

          <div className="md:col-span-2 lg:col-span-4 p-4">
            <p className="text-center text-gray-400">
              {channels.nodes.length} / {channels.totalNodes}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Channels
