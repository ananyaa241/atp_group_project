function SkeletonCard({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800 ${className}`} />
  )
}

export function SkeletonRow() {
  return (
    <div className='flex gap-4 items-center p-4'>
      <div className='animate-pulse h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800' />
      <div className='flex-1 space-y-2'>
        <div className='animate-pulse h-4 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-800' />
        <div className='animate-pulse h-3 w-1/2 rounded-xl bg-slate-200 dark:bg-slate-800' />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className='w-full overflow-hidden'>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`grid gap-4 p-5 border-b border-slate-100 dark:border-slate-800`}
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className='animate-pulse h-5 rounded-xl bg-slate-200 dark:bg-slate-800' />
          ))}
        </div>
      ))}
    </div>
  )
}

export default SkeletonCard
