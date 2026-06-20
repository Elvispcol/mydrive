interface Props {
  title: string
  realizado: number
  total: number
  pct: number
  subtitles?: { label: string; value: number | string; variant?: 'danger' | 'warning' | 'muted' }[]
  colorBar?: string
}

export function ProgressWidget({ title, realizado, total, pct, subtitles, colorBar = '#50AAFF' }: Props) {
  const clampedPct = Math.min(100, Math.max(0, pct))
  const barColor = pct >= 80 ? '#C8E63A' : pct >= 50 ? '#50AAFF' : '#ef4444'
  const finalColor = colorBar !== '#50AAFF' ? colorBar : barColor

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">{title}</h3>

      {/* Números */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-3xl font-bold text-ink-900">{realizado}</span>
          <span className="text-sm text-ink-400 ml-1">/ {total}</span>
        </div>
        <span
          className="text-2xl font-bold"
          style={{ color: finalColor }}
        >
          {clampedPct}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="h-2.5 bg-surface-raised rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clampedPct}%`, backgroundColor: finalColor }}
        />
      </div>

      {/* Sub-indicadores */}
      {subtitles && subtitles.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {subtitles.map((s) => {
            const textColor =
              s.variant === 'danger'  ? 'text-red-500'    :
              s.variant === 'warning' ? 'text-amber-500'  :
              'text-ink-400'
            return (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="text-xs text-ink-400">{s.label}</span>
                <span className={`text-xs font-semibold ${textColor}`}>{s.value}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
