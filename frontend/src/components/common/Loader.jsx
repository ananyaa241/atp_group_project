function Loader() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[50vh] gap-4'>
      <div className='relative h-12 w-12'>
        <div className='absolute inset-0 rounded-full border-4 border-teal-100 dark:border-teal-900/30' />
        <div className='absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin' />
      </div>
      <p className='text-xs font-medium' style={{ color: 'var(--txt-muted)' }}>Loading…</p>
    </div>
  )
}

export default Loader
