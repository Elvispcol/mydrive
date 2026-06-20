export function EmptyState({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-8 text-center">
      {icon && <div className="flex justify-center mb-3 text-ink-300">{icon}</div>}
      <p className="text-ink-300 text-sm">{label}</p>
    </div>
  )
}
