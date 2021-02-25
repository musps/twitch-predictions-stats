import { ApolloProvider } from '@apollo/client'
import { useApollo } from '@/lib/apolloClient'
import { AnimatePresence, motion } from 'framer-motion'
import 'tailwindcss/tailwind.css'

export default function App({ Component, pageProps, router }) {
  const apolloClient = useApollo(pageProps)

  return (
    <ApolloProvider client={apolloClient}>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          key={router.route}>
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </ApolloProvider>
  )
}
