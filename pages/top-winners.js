import { useQuery, gql } from '@apollo/client'
import { initializeApollo, addApolloState } from '../lib/apolloClient'
import { formatThousands } from '../lib/numbers'
import Page from '../components/Page'
import { APP_IS_BUILDING } from '../lib/app'

const GET_TOP_WINNERS_QUERY = gql`
  query GetTopWinners {
    topWinners {
      channel {
        id
        displayName
        profileImageURL
      }
      prediction {
        id
        title
      }
      pointsWon
      ratio
      winner {
        points
        user {
          displayName
        }
      }
    }
  }
`

export async function getStaticProps() {
  const apolloClient = initializeApollo()

  if (!APP_IS_BUILDING) {
    const response = await apolloClient.query({
      query: GET_TOP_WINNERS_QUERY,
    })
  }

  return addApolloState(apolloClient, {
    props: {},
    revalidate: 1,
  })
}

function TopWinnersPage() {
  const { loading, error, data } = useQuery(GET_TOP_WINNERS_QUERY)
  const { topWinners = [] } = data || {}

  return (
    <Page title="Top winners">
      <div className="pb-4">
        <h2 className="text-xl">Top 10 biggest winners</h2>
      </div>

      <div className="overflow-y-scroll">
        <table className="min-w-full overflow-x-scroll divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-white uppercase">
                Channel
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-white uppercase">
                Winner
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-white uppercase">
                Points bet
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-white uppercase">
                Ratio
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-white uppercase">
                Total points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
            {topWinners.map((item) => (
              <tr
                key={item.channel.id}
                className="transition-all hover:bg-gray-100 hover:shadow-lg dark:hover:bg-gray-900">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                      <img
                        className="w-10 h-10 rounded-full"
                        src={item.channel.profileImageURL}
                        alt="Channel profile image"
                        width="48"
                        height="48"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-400">
                        <a
                          href={`/user/${item.channel.displayName}`}
                          target="_blank">
                          {item.channel.displayName}
                        </a>
                      </div>
                      <div className="text-sm text-gray-500">
                        <a
                          href={`/user/${item.channel.displayName}/prediction/${item.prediction.id}`}
                          target="_blank">
                          View prediction
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-400">
                    {item.winner.user.displayName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-400">
                    {formatThousands(item.winner.points)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                    {item.ratio}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                    {formatThousands(item.pointsWon)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  )
}

export default TopWinnersPage
