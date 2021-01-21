import Page from '../components/Page'
import { initializeApollo, addApolloState } from '../lib/apolloClient'
import TopChannels, { GET_TOP_CHANNELS_QUERY } from '../components/TopChannels'
import { APP_IS_BUILDING } from '../lib/app'

export async function getStaticProps() {
  const apolloClient = initializeApollo()

  if (!APP_IS_BUILDING) {
    const response = await apolloClient.query({
      query: GET_TOP_CHANNELS_QUERY,
    })
  }

  return addApolloState(apolloClient, {
    props: {},
    revalidate: 1,
  })
}

function HomePage() {
  return (
    <Page>
      <TopChannels />
    </Page>
  )
}

export default HomePage
