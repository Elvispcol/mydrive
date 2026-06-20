'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export interface DonutSlice {
  name: string
  value: number
  color: string
}

interface Props {
  data: DonutSlice[]
  title: string
  total?: number
}

export function DonutChart({ data, title, total }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const hasData = data.some((d) => d.value > 0)
  const displayTotal = total ?? data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">{title}</h3>

      {!mounted ? (
        <div className="h-44 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-8 border-surface-raised animate-pulse" />
        </div>
      ) : !hasData ? (
        <div className="h-44 flex items-center justify-center">
          <p className="text-sm text-ink-300">Sin datos disponibles</p>
        </div>
      ) : (
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Total en el centro */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-ink-900">{displayTotal}</span>
            <span className="text-xs text-ink-300">total</span>
          </div>
        </div>
      )}

      {/* Leyenda manual */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-ink-500">{d.name}</span>
            <span className="text-xs font-semibold text-ink-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
