import { SchemaDirectiveVisitor } from 'apollo-server-express'

const TTL = {
  ONE: 60,
  TWO: 60 * 2,
  THREE: 60 * 3,
  FIVE: 60 * 5,
  ONE_HOUR: 60 * 60,
  ONE_MONTH: 60 * 60 * 31,
}

const generateCacheName = (name, args) => {
  const str = JSON.stringify({
    name,
    args,
  })

  return str
}

export function cacheReducer(cacheName, variables, resolver) {
  return {
    cacheName,
    variables,
    resolver,
  }
}

class CacheResponseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { name, resolve = defaultFieldResolver } = field

    field.resolve = async function (...params) {
      const [parent, args, context, info] = params
      const { cache } = context

      const { cacheName, variables, resolver } = await resolve.apply(
        this,
        params
      )

      if (process.env.DISABLE_CACHE.toLowerCase() === 'true') {
        return await resolver.apply(this, params)
      }

      const _cacheName = generateCacheName(cacheName, {
        ...(variables || {}),
      })

      const cacheData = await cache.get(_cacheName)

      if (cacheData) {
        return cacheData
      }

      const response = await resolver.apply(this, params)

      cache.set(_cacheName, response, {
        ttl: TTL.ONE_MONTH,
      })

      return response
    }
  }
}

export default CacheResponseDirective
