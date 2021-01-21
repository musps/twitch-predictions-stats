import { ApolloServer } from 'apollo-server-micro'
import { InMemoryLRUCache } from 'apollo-server-caching'
import mongoose from 'mongoose'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import AuthCacheDirective from './directives/AuthCacheDirective'
import CacheResponseDirective from './directives/CacheResponseDirective'

const createSever = () => {
  const mongooseOptions = {
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

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives: {
      authCache: AuthCacheDirective,
      cacheResponse: CacheResponseDirective,
    },
    context: ({ req }) => {
      const authCacheValue = req.headers['tps-auth-cache'] || ''

      return {
        cache,
        authCacheValue,
      }
    },
  })

  return server
}

export default createSever
