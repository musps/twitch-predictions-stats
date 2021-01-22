import Cors from 'micro-cors'
import createSever from 'lib/graphql'

const cors = Cors()
const server = createSever()
const handler = server.createHandler({
  path: '/api/graphql',
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default cors((req, res) =>
  req.method === 'OPTIONS' ? res.end() : handler(req, res)
)
