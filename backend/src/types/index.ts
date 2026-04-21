export interface SaudeData {
  ultima_consulta: string
  vacinas_em_dia: boolean
  alertas: string[]
}

export interface EducacaoData {
  escola: string | null
  frequencia_percent: number | null
  alertas: string[]
}

export interface AssistenciaSocialData {
  cad_unico: boolean
  beneficio_ativo: boolean
  alertas: string[]
}

export interface Child {
  id: string
  nome: string
  data_nascimento: string
  bairro: string
  responsavel: string
  saude: SaudeData | null
  educacao: EducacaoData | null
  assistencia_social: AssistenciaSocialData | null
  revisado: boolean
  revisado_por: string | null
  revisado_em: string | null
}

export interface ChildRow {
  id: string
  nome: string
  data_nascimento: string
  bairro: string
  responsavel: string
  saude: string | null
  educacao: string | null
  assistencia_social: string | null
  revisado: number
  revisado_por: string | null
  revisado_em: string | null
}

export interface Summary {
  total: number
  com_alertas: {
    total: number
    saude: number
    educacao: number
    assistencia_social: number
  }
  revisadas: number
  sem_dados: number
  por_bairro: Record<string, { total: number; com_alertas: number }>
}

export interface JWTPayload {
  sub: string
  preferred_username: string
  iat?: number
  exp?: number
}
