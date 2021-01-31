import {
  initializeApollo,
  addApolloState,
  APP_IS_BUILDING,
} from '@/lib/apolloClient'
import Page from '@/components/Page'
import TopChannels, { GET_TOP_CHANNELS_QUERY } from '@/components/TopChannels'

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
