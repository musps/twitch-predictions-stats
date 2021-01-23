import { SchemaDirectiveVisitor } from 'apollo-server-micro'

class AuthCacheDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const { authCache, authCacheValue } = args[2]

      const tpsAuthCache = process.env.TPS_AUTH_CACHE
      const isLogged = authCacheValue === tpsAuthCache

      if (!isLogged || !tpsAuthCache) throw new Error('You must be logged in!')

      return resolve.apply(this, args)
    }
  }
}

export default AuthCacheDirective
