import Page from '../components/Page'
import { initializeApollo, addApolloState } from '../lib/apolloClient'
import Channels, { GET_CHANNELS_QUERY } from '../components/Channels'
import { APP_IS_BUILDING } from '../lib/app'

export async function getStaticProps() {
  const apolloClient = initializeApollo()

  if (!APP_IS_BUILDING) {
    const response = await apolloClient.query({
      query: GET_CHANNELS_QUERY,
      variables: {
        page: 1,
        limit: 24,
      },
    })
  }

  return addApolloState(apolloClient, {
    props: {},
    revalidate: 1,
  })
}

function ChannelsPage() {
  return (
    <Page title="Channels">
      <Channels />
    </Page>
  )
}

export default ChannelsPage
