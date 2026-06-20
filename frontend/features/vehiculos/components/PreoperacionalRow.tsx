import type { PreoperacionalConConductor } from '@/lib/services/vehiculos'
import type { Locale } from '@/lib/i18n/config'
import { Badge, RESULTADO_PREOP_VARIANT } from '@/shared/components/ui/Badge'
import { formatDate } from '@/shared/utils/formatters'

const RESULTADO_LABEL: Record<string, string> = {
  ok:            'OK',
  con_novedades: 'Con novedades',
}

export function PreoperacionalRow({
  preoperacional,
  locale,
}: {
  preoperacional: PreoperacionalConConductor
  locale: Locale
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-3">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${
            preoperacional.resultado === 'ok' ? 'bg-success-dark' : 'bg-danger-dark'
          }`}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-900">
            {formatDate(preoperacional.fecha, locale)}
          </p>
          {preoperacional.conductor && (
            <p className="text-xs text-ink-300 mt-0.5 truncate">
              {preoperacional.conductor.nombre}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {preoperacional.observacion && (
          <p className="text-xs text-ink-500 max-w-xs truncate hidden sm:block">
            {preoperacional.observacion}
          </p>
        )}
        <Badge variant={RESULTADO_PREOP_VARIANT[preoperacional.resultado] ?? 'muted'}>
          {RESULTADO_LABEL[preoperacional.resultado] ?? preoperacional.resultado}
        </Badge>
      </div>
    </div>
  )
}
