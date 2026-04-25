import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import authenticatePlugin from './plugins/authenticate'
import authRoutes from './routes/auth'
import childrenRoutes from './routes/children'
import summaryRoutes from './routes/summary'

export async function buildApp(opts: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const JWT_SECRET = process.env.JWT_SECRET || 'painel-pcrj-secret-dev'
  const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

  const fastify = Fastify({ logger: opts.logger ?? false })

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

  return fastify
}
