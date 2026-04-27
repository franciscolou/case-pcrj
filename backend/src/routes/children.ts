import { FastifyPluginAsync } from 'fastify'
import { rowToChild, getAllChildren, getChildById, updateChildReview } from '../db/index'
import { Child, JWTPayload } from '../types/index'

function hasAlerts(child: Child): boolean {
  const saudeAlerts = child.saude?.alertas?.length ?? 0
  const educacaoAlerts = child.educacao?.alertas?.length ?? 0
  const socialAlerts = child.assistencia_social?.alertas?.length ?? 0
  return saudeAlerts + educacaoAlerts + socialAlerts > 0
}

const childrenRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/children', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const query = request.query as {
      bairro?: string
      alertas?: string
      revisado?: string
      page?: string
      limit?: string
    }

    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '10', 10) || 10))

    const rows = getAllChildren()
    let children: Child[] = rows.map(rowToChild)

    if (query.bairro !== undefined && query.bairro !== '') {
      const bairroLower = query.bairro.toLowerCase()
      children = children.filter((c) => c.bairro.toLowerCase() === bairroLower)
    }

    if (query.alertas === 'true') {
      children = children.filter(hasAlerts)
    } else if (query.alertas === 'false') {
      children = children.filter((c) => !hasAlerts(c))
    }

    if (query.revisado === 'true') {
      children = children.filter((c) => c.revisado === true)
    } else if (query.revisado === 'false') {
      children = children.filter((c) => c.revisado === false)
    }

    const total = children.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const data = children.slice(offset, offset + limit)

    return reply.send({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  })

  fastify.get('/children/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const row = getChildById(id)

    if (!row) {
      return reply.status(404).send({ error: 'Criança não encontrada' })
    }

    return reply.send(rowToChild(row))
  })

  fastify.patch(
    '/children/:id/review',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const existing = getChildById(id)

      if (!existing) {
        return reply.status(404).send({ error: 'Criança não encontrada' })
      }

      const user = request.user as JWTPayload
      const preferred_username = user.preferred_username

      updateChildReview(id, preferred_username, new Date().toISOString())

      const updated = getChildById(id)
      return reply.send(rowToChild(updated!))
    }
  )
}

export default childrenRoutes
