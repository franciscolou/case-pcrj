import { FastifyPluginAsync } from 'fastify'
import { getAllChildren, rowToChild } from '../db/index'
import { Child, Summary } from '../types/index'

function hasAnyAlert(child: Child): boolean {
  const saudeAlerts = child.saude?.alertas?.length ?? 0
  const educacaoAlerts = child.educacao?.alertas?.length ?? 0
  const socialAlerts = child.assistencia_social?.alertas?.length ?? 0
  return saudeAlerts + educacaoAlerts + socialAlerts > 0
}

const summaryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/summary', async (_request, reply) => {
    const rows = getAllChildren()
    const children: Child[] = rows.map(rowToChild)

    const total = children.length

    let saudeCount = 0
    let educacaoCount = 0
    let socialCount = 0
    let alertasTotalCount = 0
    let revisadasCount = 0
    let semDadosCount = 0

    const porBairro: Record<string, { total: number; com_alertas: number }> = {}

    for (const child of children) {
      const saudeAlert = (child.saude?.alertas?.length ?? 0) > 0
      const educacaoAlert = (child.educacao?.alertas?.length ?? 0) > 0
      const socialAlert = (child.assistencia_social?.alertas?.length ?? 0) > 0

      if (saudeAlert) saudeCount++
      if (educacaoAlert) educacaoCount++
      if (socialAlert) socialCount++
      if (saudeAlert || educacaoAlert || socialAlert) alertasTotalCount++

      if (child.revisado) revisadasCount++

      if (
        child.saude === null &&
        child.educacao === null &&
        child.assistencia_social === null
      ) {
        semDadosCount++
      }

      if (!porBairro[child.bairro]) {
        porBairro[child.bairro] = { total: 0, com_alertas: 0 }
      }
      porBairro[child.bairro].total++
      if (hasAnyAlert(child)) {
        porBairro[child.bairro].com_alertas++
      }
    }

    const summary: Summary = {
      total,
      com_alertas: {
        total: alertasTotalCount,
        saude: saudeCount,
        educacao: educacaoCount,
        assistencia_social: socialCount,
      },
      revisadas: revisadasCount,
      sem_dados: semDadosCount,
      por_bairro: porBairro,
    }

    return reply.send(summary)
  })
}

export default summaryRoutes
