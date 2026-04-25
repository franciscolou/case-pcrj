'use client'
import { useEffect, useRef } from 'react'
import { Summary } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

interface MapTabProps {
  data: Summary
}

const BAIRRO_COORDS: Record<string, [number, number]> = {
  Rocinha: [-22.9868, -43.2493],
  Maré: [-22.8603, -43.2428],
  Jacarezinho: [-22.8908, -43.2583],
  'Complexo do Alemão': [-22.8575, -43.2736],
  Mangueira: [-22.9103, -43.2267],
}

function alertColor(ratio: number): string {
  if (ratio >= 0.7) return '#dc2626'
  if (ratio >= 0.5) return '#ea580c'
  if (ratio >= 0.3) return '#d97706'
  return '#16a34a'
}

function alertLabel(ratio: number): string {
  if (ratio >= 0.7) return 'Crítico'
  if (ratio >= 0.5) return 'Alto'
  if (ratio >= 0.3) return 'Moderado'
  return 'Baixo'
}

export function MapTab({ data }: MapTabProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Leaflet must be loaded client-side only
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [-22.9068, -43.2530],
        zoom: 12,
        scrollWheelZoom: false,
      })
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      const maxTotal = Math.max(...Object.values(data.por_bairro).map((s) => s.total), 1)

      for (const [bairro, stats] of Object.entries(data.por_bairro)) {
        const coords = BAIRRO_COORDS[bairro]
        if (!coords) continue

        const ratio = stats.total > 0 ? stats.com_alertas / stats.total : 0
        const radius = 600 + (stats.total / maxTotal) * 900

        const circle = L.circle(coords, {
          radius,
          color: alertColor(ratio),
          fillColor: alertColor(ratio),
          fillOpacity: 0.35,
          weight: 2,
        }).addTo(map)

        const alertPercent = stats.total > 0 ? Math.round(ratio * 100) : 0
        circle.bindPopup(
          `<div style="min-width:160px;font-family:sans-serif;font-size:13px">
            <strong style="font-size:14px">${bairro}</strong><br/>
            <hr style="margin:6px 0;border-color:#e5e7eb"/>
            <span>👶 Crianças: <strong>${stats.total}</strong></span><br/>
            <span>⚠️ Com alertas: <strong>${stats.com_alertas}</strong> (${alertPercent}%)</span><br/>
            <span>🔴 Nível: <strong>${alertLabel(ratio)}</strong></span>
          </div>`,
          { maxWidth: 220 }
        )

        L.marker(coords, {
          icon: L.divIcon({
            className: '',
            html: `<div style="background:white;border:2px solid ${alertColor(ratio)};border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${alertColor(ratio)};box-shadow:0 1px 4px rgba(0,0,0,0.2)">${stats.total}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        })
          .addTo(map)
          .bindPopup(circle.getPopup()!)
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [data])

  const maxTotal = Math.max(...Object.values(data.por_bairro).map((s) => s.total), 1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Baixo', range: '< 30% com alertas', color: '#16a34a' },
          { label: 'Moderado', range: '30–49%', color: '#d97706' },
          { label: 'Alto', range: '50–69%', color: '#ea580c' },
          { label: 'Crítico', range: '≥ 70%', color: '#dc2626' },
        ].map(({ label, range, color }) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0 border-2"
              style={{ backgroundColor: color + '55', borderColor: color }}
              aria-hidden="true"
            />
            <span>
              <span className="font-medium text-gray-800">{label}</span>
              <span className="text-gray-600 text-xs block">{range}</span>
            </span>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden py-0 gap-0">
        <CardContent className="p-0">
          <style>{`
            @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
          `}</style>
          <div
            ref={mapRef}
            className="w-full"
            style={{ height: 480 }}
            role="img"
            aria-label="Mapa de calor dos bairros do Rio de Janeiro com concentração de crianças"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(data.por_bairro)
          .sort((a, b) => b[1].com_alertas / b[1].total - a[1].com_alertas / a[1].total)
          .map(([bairro, stats]) => {
            const ratio = stats.total > 0 ? stats.com_alertas / stats.total : 0
            const alertPercent = Math.round(ratio * 100)
            const color = alertColor(ratio)
            return (
              <Card key={bairro} className="py-0 gap-0">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-medium text-gray-800 leading-tight">{bairro}</span>
                    <span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color }}
                    >
                      {alertPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${alertPercent}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    {stats.com_alertas}/{stats.total} crianças
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: `${(stats.total / maxTotal) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">volume relativo</div>
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
