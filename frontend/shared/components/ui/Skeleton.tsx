export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-raised rounded ${className}`} />
}

export function KpiSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
      <Skeleton className="w-9 h-9 rounded-lg" />
      <Skeleton className="w-16 h-7" />
      <Skeleton className="w-28 h-3" />
    </div>
  )
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-3" />
        </div>
      ))}
    </div>
  )
}
