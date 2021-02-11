import { useQuery, gql } from '@apollo/client'
import {
  initializeApollo,
  addApolloState,
  APP_IS_BUILDING,
} from '@/lib/apolloClient'
import { formatThousands } from '@/lib/helpers'
import Page from '@/components/Page'
import {
  UserNotFound,
  UserError,
  UserLoading,
} from '@/components/UserActionMessage'

const GET_TOP_TOTAL_PREDICTIONS_QUERY = gql`
  query GetTopTotalPredictions {
    topTotalPredictions {
      totalPredictions
      channel {
        id
        displayName
        profileImageURL
        name
      }
    }
  }
`

export async function getStaticProps() {
  const apolloClient = initializeApollo()

  if (!APP_IS_BUILDING) {
    const response = await apolloClient.query({
      query: GET_TOP_TOTAL_PREDICTIONS_QUERY,
    })
  }

  return addApolloState(apolloClient, {
    props: {},
    revalidate: 1,
  })
}

function TopTotalPredictionsPage() {
  const { loading, error, data } = useQuery(GET_TOP_TOTAL_PREDICTIONS_QUERY)
  const { topTotalPredictions = [] } = data || {}

  return (
    <Page title="Top total predictions">
      <div className="pb-4">
        <h2 className="text-xl">Top 20 total predictions</h2>
      </div>

      {loading && <UserLoading />}
      {error && <UserError />}
      {!loading && !error && (
        <div className="overflow-y-scroll">
          <table className="min-w-full overflow-x-scroll divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-white uppercase">
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-white uppercase">
                  Channel
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-white uppercase">
                  Total predictions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {topTotalPredictions.map((item, index) => (
                <tr
                  key={item.channel.id}
                  className="transition-all hover:bg-gray-100 hover:shadow-lg dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>

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
                        <div className="text-sm font-medium">
                          <a
                            href={`/user/${item.channel.name}`}
                            target="_blank">
                            {item.channel.displayName}
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                      {item.totalPredictions}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  )
}

export default TopTotalPredictionsPage
