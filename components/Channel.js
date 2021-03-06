import { Fragment } from 'react'
import Router from 'next/router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { gql, useQuery } from '@apollo/client'
import { Channel as ChannelFragments } from '@/lib/fragments'
import {
  formatNumber,
  formatThousands,
  getMostPointsWon,
  showChannelName,
} from '@/lib/helpers'
import { InformationCard, InformationsCard } from './InformationCards'
import UserActionMessage, { UserLoading } from './UserActionMessage'
import RequestChannelButton from './RequestChannelButton'

dayjs.extend(relativeTime)

export const GET_CHANNEL_QUERY = gql`
  ${ChannelFragments.Prediction}

  query GetChannel($login: String!) {
    channel(login: $login) {
      id
      displayName
      name
      url
      profileImageURL
      appCreatedAt
      appUpdatedAt
      stats {
        totalBlue
        totalPink
        totalPredictions
        totalPoints
        totalUsers
        maxPredictionPoints
        maxPredictionUsers
        maxBlueRatio
        maxPinkRatio
        mostWonEvent {
          ...Prediction
        }
        maxPinkRatioEvent {
          ...Prediction
        }
        maxBlueRatioEvent {
          ...Prediction
        }
      }
    }
  }
`

export const openPrediction = (login, id) => {
  return Router.router.push(`/user/${login}/prediction/${id}`, undefined, {
    shallow: true,
  })
}

function Channel({ login, children }) {
  const { loading, error, data } = useQuery(GET_CHANNEL_QUERY, {
    variables: { login },
    skip: !login,
  })

  const { channel } = data || {}

  const mostWon = getMostPointsWon(channel?.stats?.mostWonEvent, false)
  const showName = showChannelName(channel)
  const channelNotFound = !loading && !channel

  return (
    <Fragment>
      {loading && <UserLoading />}
      {channelNotFound && (
        <Fragment>
          <UserActionMessage message="Channel not tracked" />
          <div className="flex-grow flex items-center content-center justify-center flex-col m-8">
            <p className="text-center pb-3">
              We only track a specific set of channels
              <br />
              If you wish to add this channel, you can request it
            </p>

            <RequestChannelButton name={login} />
          </div>
        </Fragment>
      )}
      {channel && (
        <div className="flex flex-row items-start justify-between pb-6 space-x-4 border-b dark:border-gray-800 items-center">
          <div className="relative w-16 h-16 md:w-24 md:h-24">
            <img
              className="rounded-full border border-gray-100 dark:border-gray-800 shadow-sm"
              src={channel.profileImageURL}
              alt="Channel profile image"
              width="96"
              height="96"
            />
          </div>

          <div className="flex-grow flex flex-col space-y-2 justify-between md:flex-row md:space-y-0">
            <h1 className="flex flex-col text-2xl font-semibold whitespace-nowrap text-black dark:text-white">
              {channel.displayName}
              {showName && <span className="text-base">{channel.name}</span>}
            </h1>

            <a
              href={channel.url}
              target="_blank"
              className="inline-flex items-center justify-center px-4 py-1 space-x-1 bg-gray-200 rounded-md shadow hover:bg-opacity-20 dark:bg-gray-800">
              <span>View on Twitch</span>
            </a>
          </div>
        </div>
      )}

      {channel && (
        <Fragment>
          <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-4">
            <div className="lg:col-span-3 flex flex-grow flex-col">
              <div className="mb-6 grid gap-4 grid-flow-col overflow-y-scroll md:gap-6 md:grid-cols-3">
                <InformationCard
                  title="Total Predictions"
                  value={channel.stats?.totalPredictions || 0}
                />
                <InformationCard
                  title="Total points"
                  value={`${formatNumber(channel.stats?.totalPoints || 0)}+`}
                />
                <InformationCard
                  title="Total users"
                  value={formatThousands(channel.stats?.totalUsers || 0)}
                />
              </div>

              {children}
            </div>

            <div>
              <div className="grid grid-cols-1 gap-6">
                <InformationsCard
                  data={[
                    {
                      key: 'most.won',
                      title: 'Most won',
                      value: mostWon?.points || 0,
                      description: mostWon?.user?.displayName,
                      onClick: !mostWon?.id
                        ? null
                        : () => openPrediction(login, mostWon.id),
                    },
                    {
                      key: 'data.stats.totalBlue',
                      title: 'Total blue wins',
                      value: channel.stats?.totalBlue || 0,
                    },
                    {
                      key: 'data.stats.totalPink',
                      title: 'Total pink wins',
                      value: channel.stats?.totalPink || 0,
                    },
                    {
                      key: 'data.stats.maxPinkRatio',
                      title: 'Max pink ratio',
                      value: channel.stats?.maxPinkRatio || 0,
                      onClick: !channel.stats?.maxPinkRatioEvent
                        ? null
                        : () =>
                            openPrediction(
                              login,
                              channel.stats?.maxPinkRatioEvent.id
                            ),
                    },
                    {
                      key: 'data.stats.maxBlueRatio',
                      title: 'Max blue ratio',
                      value: channel.stats?.maxBlueRatio || 0,
                      onClick: !channel.stats?.maxBlueRatioEvent
                        ? null
                        : () =>
                            openPrediction(
                              login,
                              channel.stats?.maxBlueRatioEvent.id
                            ),
                    },
                    {
                      key: 'data.stats.maxPredictionPoints',
                      title: 'Max prediction points',
                      value: formatNumber(
                        channel.stats?.maxPredictionPoints || 0
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  )
}

export default Channel
