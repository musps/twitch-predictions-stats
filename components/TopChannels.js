import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'
import { motion } from 'framer-motion'
import { UserLoading, UserError } from './UserActionMessage'

const postVariants = {
  initial: { scale: 0.96, y: 30, opacity: 0 },
  enter: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] },
  },
  exit: {
    scale: 0.6,
    y: 100,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] },
  },
}

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
      <motion.a
        variants={postVariants}
        className="bg-white p-4 transition-shadow border rounded-lg shadow-sm hover:shadow dark:border-gray-800 dark:bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-400 font-bold">{text}</span>
        </div>
      </motion.a>
    </Link>
  )
}

function ChannelCard({ channel }) {
  return (
    <Link href={`/user/${channel.name}`}>
      <motion.a
        variants={postVariants}
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
          <span className="truncate">{channel.displayName}</span>
        </div>
      </motion.a>
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
        <motion.div
          initial="initial"
          animate="enter"
          exit="exit"
          className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
          {topChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
          <CardButton text="Show more" href="/channels" />
        </motion.div>
      )}
    </div>
  )
}

export default TopChannels
