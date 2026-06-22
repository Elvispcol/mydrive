export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-200"><div className="h-8 w-28 bg-gray-200 rounded animate-pulse" /></div>
        <div className="flex-1 px-3 py-4 space-y-1">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      </div>
      <div className="flex-1 p-8 space-y-6">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
        <div className="h-72 bg-white rounded-xl border border-gray-200 animate-pulse" />
      </div>
    </div>
  )
}
