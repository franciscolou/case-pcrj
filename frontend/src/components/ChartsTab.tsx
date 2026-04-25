'use client'
import { useTheme } from 'next-themes'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import { Summary } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartsTabProps {
  data: Summary
}

const ALERT_COLORS = ['#ef4444', '#f59e0b', '#f97316']

function shortBairro(b: string) {
  if (b === 'Complexo do Alemão') return 'C. Alemão'
  return b
}

export function ChartsTab({ data }: ChartsTabProps) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  // Chart palette — all color decisions live here, components reference these vars
  const colors = {
    tickText: dark ? '#9ca3af' : '#4b5563',
    grid: dark ? '#374151' : '#f0f0f0',
    polarGrid: dark ? '#374151' : '#e5e7eb',
    tooltipBg: dark ? '#1f2937' : '#ffffff',
    tooltipBorder: dark ? '#374151' : '#e5e7eb',
    tooltipText: dark ? '#f9fafb' : '#111827',
    legendText: dark ? '#d1d5db' : '#374151',
    barGreen: dark ? '#4ade80' : '#86efac',
    barRed: dark ? '#f87171' : '#f87171',
    radarStroke: '#ef4444',
    radarFill: '#ef4444',
  }

  const bairroData = Object.entries(data.por_bairro)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([bairro, stats]) => ({
      bairro: shortBairro(bairro),
      bairroFull: bairro,
      total: stats.total,
      comAlertas: stats.com_alertas,
      semAlertas: stats.total - stats.com_alertas,
    }))

  const alertTypeData = [
    { name: 'Saúde', value: data.com_alertas.saude, color: ALERT_COLORS[0] },
    { name: 'Educação', value: data.com_alertas.educacao, color: ALERT_COLORS[1] },
    { name: 'Assistência Social', value: data.com_alertas.assistencia_social, color: ALERT_COLORS[2] },
  ].filter((d) => d.value > 0)

  const reviewData = [
    { name: 'Revisadas', value: data.revisadas, color: '#10b981' },
    { name: 'Pendentes', value: data.total - data.revisadas - data.sem_dados, color: '#f59e0b' },
    { name: 'Sem dados', value: data.sem_dados, color: dark ? '#4b5563' : '#d1d5db' },
  ].filter((d) => d.value > 0)

  const radarData = Object.entries(data.por_bairro).map(([bairro, stats]) => ({
    bairro: shortBairro(bairro),
    'Taxa de alerta (%)': stats.total > 0 ? Math.round((stats.com_alertas / stats.total) * 100) : 0,
  }))

  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    backgroundColor: colors.tooltipBg,
    border: `1px solid ${colors.tooltipBorder}`,
    color: colors.tooltipText,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Crianças por Bairro
            </CardTitle>
            <p className="text-xs text-muted-foreground">Total e percentual com alertas ativos</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bairroData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="bairro" tick={{ fontSize: 11, fill: colors.tickText }} />
                <YAxis tick={{ fontSize: 11, fill: colors.tickText }} />
                <Tooltip
                  formatter={(value, name) => [value, name === 'semAlertas' ? 'Sem alertas' : 'Com alertas']}
                  labelFormatter={(label) => bairroData.find((d) => d.bairro === label)?.bairroFull ?? label}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  formatter={(value) => (value === 'semAlertas' ? 'Sem alertas' : 'Com alertas')}
                  wrapperStyle={{ fontSize: 12, color: colors.legendText }}
                />
                <Bar dataKey="semAlertas" stackId="a" fill={colors.barGreen} radius={[0, 0, 4, 4]} />
                <Bar dataKey="comAlertas" stackId="a" fill={colors.barRed} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Distribuição de Alertas por Área
            </CardTitle>
            <p className="text-xs text-muted-foreground">Quantidade de crianças com alerta em cada área</p>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={alertTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {alertTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} crianças`, name]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Status de Revisão
            </CardTitle>
            <p className="text-xs text-muted-foreground">Proporção de fichas revisadas pelos técnicos</p>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={reviewData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {reviewData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} crianças`, name]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Vulnerabilidade por Bairro
            </CardTitle>
            <p className="text-xs text-muted-foreground">Taxa de alerta (%) por comunidade</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke={colors.polarGrid} />
                <PolarAngleAxis dataKey="bairro" tick={{ fontSize: 11, fill: colors.tickText }} />
                <Radar
                  name="Taxa de alerta (%)"
                  dataKey="Taxa de alerta (%)"
                  stroke={colors.radarStroke}
                  fill={colors.radarFill}
                  fillOpacity={0.25}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: colors.legendText }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
