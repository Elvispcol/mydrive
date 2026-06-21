export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-200">
          <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-white border-b border-gray-200 px-8 flex items-center gap-3">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-6 space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
            <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
