'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export interface BarSlice {
  name: string
  value: number
  color: string
}

interface Props {
  data: BarSlice[]
  title: string
}

export function BarChartVertical({ data, title }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const hasData = data.some((d) => d.value > 0)

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">{title}</h3>

      {!mounted ? (
        <div className="h-44 flex items-end gap-2 px-4 pb-2">
          {[60, 80, 45, 30].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-surface-raised animate-pulse"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      ) : !hasData ? (
        <div className="h-44 flex items-center justify-center">
          <p className="text-sm text-ink-300">Sin datos disponibles</p>
        </div>
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%">
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={24}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-surface-raised)' }}
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
