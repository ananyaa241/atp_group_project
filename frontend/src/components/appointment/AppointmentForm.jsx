import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FaCalendarAlt, FaUserMd, FaClipboardList, FaCheckCircle } from 'react-icons/fa'
import axiosInstance from '../../api/axiosInstance'
import { AuthContext } from '../../context/AuthContext'

const steps = [
  { icon: FaUserMd,       label: 'Choose Doctor'  },
  { icon: FaCalendarAlt,  label: 'Pick Date'      },
  { icon: FaClipboardList, label: 'Add Symptoms'  },
  { icon: FaCheckCircle,  label: 'Confirm'        },
]

function AppointmentForm() {
  const { user, isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()
  const [doctors, setDoctors]           = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting }
  } = useForm()

  useEffect(() => {
    axiosInstance.get('/doctor-api/doctors')
      .then(res => setDoctors(res.data.payload || []))
      .catch(() => {})
      .finally(() => setLoadingDoctors(false))
  }, [])

  async function onSubmit(data) {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment')
      navigate('/login')
      return
    }
    try {
      await axiosInstance.post('/appointment-api/book', {
        patientId: user._id,
        doctorId: data.doctorId,
        appointmentDate: data.appointmentDate,
        symptoms: data.symptoms
      })
      toast.success('Appointment booked! A confirmation email will be sent.')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment')
    }
  }

  const inputStyle = (hasErr) => ({
    borderColor: hasErr ? '#dc2626' : 'var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--txt-primary)',
  })

  return (
    <section className='py-16' style={{ background: 'var(--bg-subtle)' }}>
      <div className='max-w-5xl mx-auto px-8'>

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className='text-center mb-10'>
          <p className='text-[10px] uppercase tracking-widest font-bold text-teal-600 dark:text-teal-400'>
            Quick Booking
          </p>
          <h2 className='mt-1 text-xl font-bold' style={{ color: 'var(--txt-primary)' }}>
            Book an Appointment
          </h2>
          <p className='mt-1 text-xs' style={{ color: 'var(--txt-muted)' }}>
            Select your doctor and preferred date — we'll send a confirmation to your email.
          </p>
        </div>

        {/* ── Step indicators ─────────────────────────────────────────────── */}
        <div className='hidden md:flex items-center justify-center gap-0 mb-8'>
          {steps.map(({ icon: Icon, label }, idx) => (
            <div key={label} className='flex items-center'>
              <div className='flex flex-col items-center gap-1.5'>
                <div
                  className='h-8 w-8 rounded-full flex items-center justify-center'
                  style={{ background: 'rgba(13,148,136,0.12)', border: '1.5px solid rgba(13,148,136,0.4)' }}
                >
                  <Icon size={13} style={{ color: '#0d9488' }} />
                </div>
                <span className='text-[10px] font-semibold whitespace-nowrap' style={{ color: 'var(--txt-muted)' }}>
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className='w-12 h-px mx-2 mb-4' style={{ background: 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Form card ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className='rounded-xl overflow-hidden'
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Card top accent */}
          <div className='h-1 bg-teal-700' />

          <div className='p-7'>
            {loadingDoctors ? (
              <div className='flex items-center justify-center py-12'>
                <div className='h-8 w-8 rounded-full border-4 border-teal-600 border-t-transparent animate-spin' />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

                {/* Doctor select */}
                <div>
                  <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>
                    <FaUserMd className='inline mr-1.5 text-teal-600' size={11} />
                    Choose Doctor
                  </label>
                  <select
                    {...register('doctorId', { required: 'Please select a doctor' })}
                    className='w-full rounded-lg border px-3.5 py-2.5 text-xs outline-none transition'
                    style={inputStyle(errors.doctorId)}
                    onFocus={e => e.target.style.borderColor = '#0d9488'}
                    onBlur={e  => e.target.style.borderColor = errors.doctorId ? '#dc2626' : 'var(--border)'}
                  >
                    <option value=''>Select a doctor...</option>
                    {doctors.map(doc => (
                      <option key={doc._id} value={doc._id}>
                        Dr. {doc.name} — {doc.specialization}
                        {doc.consultationFee > 0 ? ` (₹${doc.consultationFee})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.doctorId && (
                    <p className='mt-1 text-xs text-red-500'>{errors.doctorId.message}</p>
                  )}
                </div>

                {/* Date & time */}
                <div>
                  <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>
                    <FaCalendarAlt className='inline mr-1.5 text-teal-600' size={11} />
                    Appointment Date &amp; Time
                  </label>
                  <input
                    type='datetime-local'
                    {...register('appointmentDate', { required: 'Please select a date and time' })}
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className='w-full rounded-lg border px-3.5 py-2.5 text-xs outline-none transition'
                    style={inputStyle(errors.appointmentDate)}
                    onFocus={e => e.target.style.borderColor = '#0d9488'}
                    onBlur={e  => e.target.style.borderColor = errors.appointmentDate ? '#dc2626' : 'var(--border)'}
                  />
                  {errors.appointmentDate && (
                    <p className='mt-1 text-xs text-red-500'>{errors.appointmentDate.message}</p>
                  )}
                </div>

                {/* Symptoms */}
                <div>
                  <label className='block text-xs font-semibold mb-1.5' style={{ color: 'var(--txt-secondary)' }}>
                    <FaClipboardList className='inline mr-1.5 text-teal-600' size={11} />
                    Symptoms / Reason for Visit
                  </label>
                  <textarea
                    {...register('symptoms', { required: 'Please describe your symptoms' })}
                    rows={3}
                    placeholder='Briefly describe your symptoms or reason for this appointment...'
                    className='w-full rounded-lg border px-3.5 py-2.5 text-xs outline-none transition resize-none'
                    style={inputStyle(errors.symptoms)}
                    onFocus={e => e.target.style.borderColor = '#0d9488'}
                    onBlur={e  => e.target.style.borderColor = errors.symptoms ? '#dc2626' : 'var(--border)'}
                  />
                  {errors.symptoms && (
                    <p className='mt-1 text-xs text-red-500'>{errors.symptoms.message}</p>
                  )}
                </div>

                {/* Auth warning */}
                {!isAuthenticated && (
                  <div
                    className='rounded-lg border px-4 py-3 text-xs'
                    style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)', color: '#92400e' }}
                  >
                    You must be logged in as a patient to book an appointment.{' '}
                    <button type='button' onClick={() => navigate('/login')} className='underline font-semibold'>
                      Login here
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full rounded-lg bg-teal-700 hover:bg-teal-800 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                </button>

                <p className='text-center text-[10px]' style={{ color: 'var(--txt-muted)' }}>
                  A confirmation email will be sent within a few minutes of booking.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AppointmentForm