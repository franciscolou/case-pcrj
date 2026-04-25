import { buildApp } from './app'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
const HOST = process.env.HOST || '0.0.0.0'

async function start(): Promise<void> {
  const fastify = await buildApp({ logger: true })

  try {
    await fastify.listen({ port: PORT, host: HOST })
    fastify.log.info(`Server running on http://${HOST}:${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
