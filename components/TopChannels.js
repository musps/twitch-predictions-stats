import Link from 'next/link'
import { useQuery, NetworkStatus, gql } from '@apollo/client'
import { InformationCard } from './InformationCards'
import { UserLoading, UserError } from './UserActionMessage'

export const GET_TOP_CHANNELS_QUERY = gql`
  query GetTopChannels {
    topChannels {
      id
      displayName
      profileImageURL
      name
    }
  }
`

function CardButton({ href, text, blank = false }) {
  return (
    <Link href={href}>
      <a
        target={blank ? '_blank' : null}
        rel={blank ? 'noreferrer' : null}
        className="bg-white p-4 transition-shadow border rounded-lg shadow-sm hover:shadow dark:border-gray-800 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400 font-bold">{text}</span>
        </div>
      </a>
    </Link>
  )
}

function ChannelCard({ channel }) {
  return (
    <Link href={`/user/${channel.name}`}>
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

function TopChannels({ login, children }) {
  const { loading, error, data } = useQuery(GET_TOP_CHANNELS_QUERY)
  const { topChannels = [] } = data || {}

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-xl">Available channels</h2>

      {loading && <UserLoading />}
      {error && <UserError />}
      {topChannels.length !== 0 && (
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <CardButton
            text="Add your channel"
            href={process.env.NEXT_PUBLIC_GOOGLE_FORM_ADD_CHANNEL}
            blank={true}
          />
          {topChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
          <CardButton text="Show more" href="/channels" />
        </div>
      )}
    </div>
  )
}

export default TopChannels
