import { FastifyPluginAsync } from 'fastify'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/auth/token', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }

    if (email !== 'tecnico@prefeitura.rio' || password !== 'painel@2024') {
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }

    const token = fastify.jwt.sign(
      { sub: email, preferred_username: email },
      { expiresIn: '8h' }
    )

    return { token, user: { email, preferred_username: email } }
  })
}

export default authRoutes
