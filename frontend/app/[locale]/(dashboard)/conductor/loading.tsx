export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 pb-24">
        <div className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />
        <div className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse" />
        <div className="h-12 bg-blue-100 rounded-xl animate-pulse" />
      </div>
      <div className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-gray-200 animate-pulse" />
    </div>
  )
}
