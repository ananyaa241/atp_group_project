import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FaHospital, FaUser, FaEnvelope, FaLock, FaStethoscope, FaBriefcaseMedical } from 'react-icons/fa'
import axios from '../api/axiosInstance'
import { toast } from 'react-hot-toast'

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition'
const inputStyle = (hasError) => ({
  borderColor: hasError ? '#dc2626' : 'var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--txt-primary)'
})

function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('patient')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  async function onSubmit(data) {
    try {
      const api = role === 'admin' ? '/admin-api/register' : '/patient-api/register';

      await axios.post(api, data)
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to register')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12' style={{ background: 'var(--bg-page)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className='w-full max-w-2xl'
      >
        {/* Card */}
        <div className='rounded-2xl overflow-hidden shadow-lg' style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

          {/* Card header */}
          <div className='bg-teal-800 px-8 py-6 text-white'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center'>
                <FaHospital size={16} />
              </div>
              <p className='text-sm font-extrabold'>MediCare<span className='text-red-300'>+</span></p>
            </div>
            <h1 className='text-xl font-bold'>Create Your Account</h1>
            <p className='text-xs text-teal-200 mt-1'>Join thousands of patients and doctors on MediCare+</p>
          </div>

          {/* Form body */}
          <div className='px-8 py-7'>
            {/* Role toggle */}
            <div className='mb-6'>
              <p className='text-xs font-semibold mb-2' style={{ color: 'var(--txt-secondary)' }}>I am a</p>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  { val: 'patient', label: 'Patient', icon: FaUser },
                  { val: 'admin', label: 'Admin', icon: FaBriefcaseMedical }
                ].map(({ val, label, icon: Icon }) => (
                  <button
                    key={val}
                    type='button'
                    onClick={() => setRole(val)}
                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg border text-xs font-semibold transition ${
                      role === val
                        ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                        : 'text-slate-500'
                    }`}
                    style={{ borderColor: role === val ? '#0d9488' : 'var(--border)' }}
                  >
                    <Icon size={12} className={role === val ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                    {label}
                  </button>
                ))}
              </div>
              <p className='mt-3 text-[11px] text-slate-500'>Doctor accounts are created by administrators only. If you need a doctor account, please contact your administrator.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-2 gap-4'>

              {/* Name */}
              <div>
                <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>Full Name</label>
                <div className='relative'>
                  <FaUser size={12} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
                  <input type='text' placeholder='John Doe'
                    {...register('name', { required: 'Name is required' })}
                    className={`${inputCls} pl-9`}
                    style={inputStyle(errors.name)}
                    onFocus={e => e.target.style.borderColor='#0d9488'}
                    onBlur={e => e.target.style.borderColor = errors.name ? '#dc2626' : 'var(--border)'}
                  />
                </div>
                {errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>Email Address</label>
                <div className='relative'>
                  <FaEnvelope size={12} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
                  <input type='email' placeholder='you@example.com'
                    {...register('email', { required: 'Email is required' })}
                    className={`${inputCls} pl-9`}
                    style={inputStyle(errors.email)}
                    onFocus={e => e.target.style.borderColor='#0d9488'}
                    onBlur={e => e.target.style.borderColor = errors.email ? '#dc2626' : 'var(--border)'}
                  />
                </div>
                {errors.email && <p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>Password</label>
                <div className='relative'>
                  <FaLock size={12} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
                  <input type='password' placeholder='••••••••'
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    className={`${inputCls} pl-9`}
                    style={inputStyle(errors.password)}
                    onFocus={e => e.target.style.borderColor='#0d9488'}
                    onBlur={e => e.target.style.borderColor = errors.password ? '#dc2626' : 'var(--border)'}
                  />
                </div>
                {errors.password && <p className='mt-1 text-xs text-red-500'>{errors.password.message}</p>}
              </div>

              {/* Doctor fields */}
              {role === 'doctor' && (
                <>
                  <div>
                    <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>Specialization</label>
                    <div className='relative'>
                      <FaStethoscope size={12} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
                      <input type='text' placeholder='e.g. Cardiology'
                        {...register('specialization', { required: 'Specialization required' })}
                        className={`${inputCls} pl-9`}
                        style={inputStyle(errors.specialization)}
                        onFocus={e => e.target.style.borderColor='#0d9488'}
                        onBlur={e => e.target.style.borderColor = errors.specialization ? '#dc2626' : 'var(--border)'}
                      />
                    </div>
                    {errors.specialization && <p className='mt-1 text-xs text-red-500'>{errors.specialization.message}</p>}
                  </div>

                  <div>
                    <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>Years of Experience</label>
                    <div className='relative'>
                      <FaBriefcaseMedical size={12} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
                      <input type='number' placeholder='e.g. 8' min='0' max='60'
                        {...register('experience', { required: 'Experience required' })}
                        className={`${inputCls} pl-9`}
                        style={inputStyle(errors.experience)}
                        onFocus={e => e.target.style.borderColor='#0d9488'}
                        onBlur={e => e.target.style.borderColor = errors.experience ? '#dc2626' : 'var(--border)'}
                      />
                    </div>
                    {errors.experience && <p className='mt-1 text-xs text-red-500'>{errors.experience.message}</p>}
                  </div>
                </>
              )}

              {/* Submit */}
              <div className='md:col-span-2 pt-2'>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Creating account…' : 'Create Account'}
                </button>
                <p className='mt-4 text-center text-xs' style={{ color: 'var(--txt-muted)' }}>
                  Already have an account?{' '}
                  <Link to='/login' className='text-teal-600 dark:text-teal-400 font-semibold hover:underline'>Sign in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register