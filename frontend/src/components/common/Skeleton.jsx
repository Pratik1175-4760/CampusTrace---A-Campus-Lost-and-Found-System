export function CardSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
    >
      <div className="skeleton aspect-square w-full" />
      <div className="p-3 space-y-2.5">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="skeleton h-3 w-2/3 rounded-lg" />
      </div>
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-100">
      <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="skeleton h-4 w-1/3 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
      </div>
      <div className="skeleton h-7 w-20 rounded-full" />
    </div>
  )
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid items-grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 40}ms` }}>
          <CardSkeleton />
        </div>
      ))}
    </div>
  )
}
