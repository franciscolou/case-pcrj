import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import authenticatePlugin from './plugins/authenticate'
import authRoutes from './routes/auth'
import childrenRoutes from './routes/children'
import summaryRoutes from './routes/summary'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
const HOST = process.env.HOST || '0.0.0.0'
const JWT_SECRET = process.env.JWT_SECRET || 'painel-pcrj-secret-dev'
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

async function start(): Promise<void> {
  const fastify = Fastify({ logger: true })

  await fastify.register(cors, {
    origin: [CORS_ORIGIN, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  })

  await fastify.register(jwt, { secret: JWT_SECRET })
  await fastify.register(authenticatePlugin)

  await fastify.register(authRoutes)
  await fastify.register(childrenRoutes)
  await fastify.register(summaryRoutes)

  fastify.get('/health', async () => ({ status: 'ok' }))

  try {
    await fastify.listen({ port: PORT, host: HOST })
    fastify.log.info(`Server running on http://${HOST}:${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
