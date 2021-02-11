import { ApolloServer } from 'apollo-server-micro'
import { InMemoryLRUCache } from 'apollo-server-caching'
import { createRateLimitDirective } from 'graphql-rate-limit'
import mongoose from 'mongoose'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import AuthCacheDirective from './directives/AuthCacheDirective'
import CacheResponseDirective from './directives/CacheResponseDirective'

const createSever = () => {
  const mongooseOptions = {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  }

  mongoose.connect(process.env.MONGO_STRING, mongooseOptions, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('db connection ready!')
    }
  })

  const cache = new InMemoryLRUCache()
  const rateLimitDirective = createRateLimitDirective({
    identifyContext: ({ req }) => {
      const ip = req.connection.remoteAddress

      return ip
    },
  })

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives: {
      authCache: AuthCacheDirective,
      cacheResponse: CacheResponseDirective,
      rateLimit: rateLimitDirective,
    },
    context: (context) => {
      const { req } = context
      const authCacheValue = req.headers['tps-auth-cache'] || ''

      return {
        ...context,
        cache,
        authCacheValue,
      }
    },
  })

  return server
}

export default createSever
