import { FaInbox } from 'react-icons/fa'

function EmptyState({ icon: Icon = FaInbox, title = 'No data found', message = '', action }) {
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 text-4xl'>
        <Icon />
      </div>
      <h3 className='mt-6 text-2xl font-bold text-slate-700 dark:text-slate-200'>{title}</h3>
      {message && <p className='mt-3 text-slate-500 dark:text-slate-400 max-w-sm'>{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className='mt-8 rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-cyan-600'
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
