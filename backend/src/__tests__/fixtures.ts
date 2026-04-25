import { Child, ChildRow } from '../types/index'

export const childWithAllAlerts: Child = {
  id: 'test-001',
  nome: 'Ana Teste',
  data_nascimento: '2018-03-10',
  bairro: 'Rocinha',
  responsavel: 'Maria Teste',
  saude: {
    ultima_consulta: '2023-06-01',
    vacinas_em_dia: false,
    alertas: ['vacinas_atrasadas'],
  },
  educacao: {
    escola: 'CIEP Teste',
    frequencia_percent: 60,
    alertas: ['frequencia_baixa'],
  },
  assistencia_social: {
    cad_unico: true,
    beneficio_ativo: false,
    alertas: ['beneficio_suspenso'],
  },
  revisado: false,
  revisado_por: null,
  revisado_em: null,
}

export const childWithNoAlerts: Child = {
  id: 'test-002',
  nome: 'Lucas Teste',
  data_nascimento: '2019-07-22',
  bairro: 'Maré',
  responsavel: 'Joana Teste',
  saude: {
    ultima_consulta: '2024-06-01',
    vacinas_em_dia: true,
    alertas: [],
  },
  educacao: {
    escola: 'EM Teste',
    frequencia_percent: 90,
    alertas: [],
  },
  assistencia_social: {
    cad_unico: true,
    beneficio_ativo: true,
    alertas: [],
  },
  revisado: false,
  revisado_por: null,
  revisado_em: null,
}

export const childReviewed: Child = {
  id: 'test-003',
  nome: 'Sofia Teste',
  data_nascimento: '2020-11-08',
  bairro: 'Jacarezinho',
  responsavel: 'Fernanda Teste',
  saude: {
    ultima_consulta: '2024-01-22',
    vacinas_em_dia: true,
    alertas: [],
  },
  educacao: null,
  assistencia_social: null,
  revisado: true,
  revisado_por: 'tecnico@prefeitura.rio',
  revisado_em: '2024-03-01T10:00:00.000Z',
}

export const childWithNoData: Child = {
  id: 'test-004',
  nome: 'Pedro Teste',
  data_nascimento: '2021-08-10',
  bairro: 'Mangueira',
  responsavel: 'Carlos Teste',
  saude: null,
  educacao: null,
  assistencia_social: null,
  revisado: false,
  revisado_por: null,
  revisado_em: null,
}

export const childWithSaudeAlertOnly: Child = {
  id: 'test-005',
  nome: 'Julia Teste',
  data_nascimento: '2017-12-01',
  bairro: 'Complexo do Alemão',
  responsavel: 'Rosa Teste',
  saude: {
    ultima_consulta: '2022-01-01',
    vacinas_em_dia: false,
    alertas: ['consulta_atrasada'],
  },
  educacao: {
    escola: 'EM Norte Teste',
    frequencia_percent: 95,
    alertas: [],
  },
  assistencia_social: {
    cad_unico: false,
    beneficio_ativo: false,
    alertas: [],
  },
  revisado: false,
  revisado_por: null,
  revisado_em: null,
}

export const allTestChildren: Child[] = [
  childWithAllAlerts,
  childWithNoAlerts,
  childReviewed,
  childWithNoData,
  childWithSaudeAlertOnly,
]

// ChildRow fixtures for rowToChild unit tests
export const childRowUnreviewed: ChildRow = {
  id: 'row-001',
  nome: 'Row Child Sem Revisão',
  data_nascimento: '2018-01-01',
  bairro: 'Rocinha',
  responsavel: 'Row Parent',
  saude: JSON.stringify({
    ultima_consulta: '2024-01-01',
    vacinas_em_dia: false,
    alertas: ['vacinas_atrasadas'],
  }),
  educacao: JSON.stringify({
    escola: 'Row School',
    frequencia_percent: 60,
    alertas: ['frequencia_baixa'],
  }),
  assistencia_social: JSON.stringify({
    cad_unico: true,
    beneficio_ativo: false,
    alertas: ['beneficio_suspenso'],
  }),
  revisado: 0,
  revisado_por: null,
  revisado_em: null,
}

export const childRowRevisado: ChildRow = {
  id: 'row-002',
  nome: 'Row Child Revisado',
  data_nascimento: '2019-01-01',
  bairro: 'Maré',
  responsavel: 'Row Parent 2',
  saude: null,
  educacao: null,
  assistencia_social: null,
  revisado: 1,
  revisado_por: 'tecnico@prefeitura.rio',
  revisado_em: '2024-01-01T10:00:00.000Z',
}
