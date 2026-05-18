import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { FaHospital, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import axios from '../api/axiosInstance'
import { AuthContext } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useContext(AuthContext)
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  async function onSubmit(data) {
    try {
      const res = await axios.post('/auth/login', data)
      login(res.data)
      toast.success('Welcome back!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to login. Please check your credentials.')
    }
  }

  return (
    <div className='min-h-screen flex' style={{ background: 'var(--bg-page)' }}>
      {/* ── Left panel (branding) ── */}
      <div className='hidden lg:flex flex-col justify-between w-2/5 bg-teal-800 px-12 py-14 text-white'>
        <div>
          <div className='flex items-center gap-3 mb-14'>
            <div className='h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center'>
              <FaHospital size={18} className='text-white' />
            </div>
            <div>
              <p className='text-base font-extrabold leading-tight'>MediCare<span className='text-red-300'>+</span></p>
              <p className='text-[10px] text-teal-300 uppercase tracking-[0.2em]'>Hospital System</p>
            </div>
          </div>

          <h2 className='text-3xl font-extrabold leading-snug'>
            Connecting patients with world-class care.
          </h2>
          <p className='mt-4 text-sm text-teal-200 leading-relaxed'>
            Secure portal for doctors, patients, and administrators to manage healthcare seamlessly.
          </p>

          <div className='mt-10 space-y-4'>
            {['Book & track appointments online', 'Access prescriptions & medical records', 'Automated email reminders', 'Secure HIPAA-compliant system'].map(item => (
              <div key={item} className='flex items-start gap-3'>
                <div className='h-5 w-5 rounded-full bg-teal-600 flex items-center justify-center mt-0.5 flex-shrink-0'>
                  <span className='text-white text-[10px]'>✓</span>
                </div>
                <p className='text-sm text-teal-100'>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='border-t border-teal-700 pt-6'>
          <p className='text-xs text-teal-300'>Emergency: <strong className='text-white'>108</strong> | Helpline: <strong className='text-white'>040-68334470</strong></p>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className='flex-1 flex items-center justify-center px-6 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className='w-full max-w-md'
        >
          {/* Mobile brand */}
          <div className='lg:hidden flex items-center gap-2.5 mb-8'>
            <div className='h-9 w-9 rounded-lg bg-teal-700 flex items-center justify-center'>
              <FaHospital size={15} className='text-white' />
            </div>
            <p className='text-base font-extrabold text-teal-700 dark:text-teal-400'>MediCare<span className='text-red-500'>+</span></p>
          </div>

          <h1 className='text-xl font-bold mb-1' style={{ color: 'var(--txt-primary)' }}>Sign in to your account</h1>
          <p className='text-xs mb-7' style={{ color: 'var(--txt-muted)' }}>
            Don't have an account?{' '}
            <Link to='/register' className='text-teal-600 font-semibold hover:underline dark:text-teal-400'>Register here</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Email */}
            <div>
              <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>
                Email Address
              </label>
              <div className='relative'>
                <FaEnvelope size={13} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
                <input
                  type='email'
                  placeholder='you@example.com'
                  {...register('email', { required: 'Email is required' })}
                  className='w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition'
                  style={{ borderColor: errors.email ? '#dc2626' : 'var(--border)', background: 'var(--bg-card)', color: 'var(--txt-primary)' }}
                  onFocus={e => e.target.style.borderColor = '#0d9488'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#dc2626' : 'var(--border)'}
                />
              </div>
              {errors.email && <p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>
                Password
              </label>
              <div className='relative'>
                <FaLock size={13} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder='••••••••'
                  {...register('password', { required: 'Password is required' })}
                  className='w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm outline-none transition'
                  style={{ borderColor: errors.password ? '#dc2626' : 'var(--border)', background: 'var(--bg-card)', color: 'var(--txt-primary)' }}
                  onFocus={e => e.target.style.borderColor = '#0d9488'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#dc2626' : 'var(--border)'}
                />
                <button type='button' onClick={() => setShowPass(v => !v)}
                  className='absolute right-3.5 top-1/2 -translate-y-1/2'
                  style={{ color: 'var(--txt-muted)' }}>
                  {showPass ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
              {errors.password && <p className='mt-1 text-xs text-red-500'>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full mt-2 bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className='mt-6 text-center text-xs' style={{ color: 'var(--txt-muted)' }}>
            By signing in, you agree to our{' '}
            <span className='text-teal-600 dark:text-teal-400 cursor-pointer hover:underline'>Terms of Service</span>
            {' '}and{' '}
            <span className='text-teal-600 dark:text-teal-400 cursor-pointer hover:underline'>Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
