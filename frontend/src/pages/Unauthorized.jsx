import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaLock, FaHome } from 'react-icons/fa'

function Unauthorized() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='min-h-screen flex items-center justify-center bg-slate-950 px-6'
    >
      <div className='text-center max-w-lg'>
        {/* Icon */}
        <div className='mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-400 text-4xl'>
          <FaLock />
        </div>

        {/* Code */}
        <p className='text-8xl font-black text-white/10 select-none'>403</p>

        {/* Message */}
        <h1 className='mt-2 text-4xl font-black text-white'>Access Denied</h1>
        <p className='mt-4 text-slate-400 leading-relaxed'>
          You don't have permission to view this page. Please log in with an account that has the required access level.
        </p>

        {/* Actions */}
        <div className='mt-10 flex justify-center gap-4 flex-wrap'>
          <button
            onClick={() => navigate(-1)}
            className='rounded-2xl border border-slate-700 px-6 py-3 text-slate-300 hover:bg-slate-900 transition'
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className='flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 text-white font-semibold hover:bg-cyan-600 transition shadow-lg'
          >
            <FaHome /> Home
          </button>
          <button
            onClick={() => navigate('/login')}
            className='rounded-2xl bg-slate-800 px-6 py-3 text-slate-200 hover:bg-slate-700 transition'
          >
            Login
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Unauthorized
