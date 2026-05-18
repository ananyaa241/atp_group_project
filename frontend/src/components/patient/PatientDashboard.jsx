import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FaCalendarCheck, FaPrescriptionBottleAlt, FaClock, FaUserMd } from 'react-icons/fa'
import axiosInstance from '../../api/axiosInstance'
import { AuthContext } from '../../context/AuthContext'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import CalendarView from '../appointment/CalendarView'
import VitalsTracker from './VitalsTracker'

const STATUS_BADGE = {
  Pending:   'badge badge-pending',
  Approved:  'badge badge-approved',
  Completed: 'badge badge-completed',
  Cancelled: 'badge badge-cancelled',
}

function StatCard({ label, value, borderColor, iconColor, iconBg, icon: Icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className='rounded-xl p-5'
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeftWidth: 4,
        borderLeftColor: borderColor,
      }}
    >
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-[10px] uppercase tracking-widest font-semibold' style={{ color: 'var(--txt-muted)' }}>{label}</p>
          <p className='mt-2 text-3xl font-extrabold' style={{ color: 'var(--txt-primary)' }}>{value}</p>
        </div>
        <div className='h-10 w-10 rounded-xl flex items-center justify-center' style={{ background: iconBg }}>
          <Icon size={17} style={{ color: iconColor }} />
        </div>
      </div>
    </motion.div>
  )
}

function PatientDashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [queueInfo, setQueueInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?._id) return

    async function loadData() {
      try {
        setLoading(true)
        const [apptRes, rxRes] = await Promise.all([
          axiosInstance.get(`/appointment-api/patient/${user._id}`),
          axiosInstance.get(`/prescription-api/patient/${user._id}`)
        ])

        const patientAppointments = apptRes.data.payload || []
        setAppointments(patientAppointments)
        setPrescriptions(rxRes.data.payload || [])

        const today = new Date().toDateString()
        const todayAppointments = patientAppointments
          .filter(a => ['Pending', 'Approved'].includes(a.status) && new Date(a.appointmentDate).toDateString() === today)
          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))

        if (todayAppointments.length > 0) {
          const nextAppointment = todayAppointments[0]
          if (nextAppointment.doctorId?._id) {
            const doctorRes = await axiosInstance.get(`/appointment-api/doctor/${nextAppointment.doctorId._id}`)
            const doctorAppointments = doctorRes.data.payload || []
            const doctorToday = doctorAppointments
              .filter(a => ['Pending', 'Approved'].includes(a.status) && new Date(a.appointmentDate).toDateString() === today)
              .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))

            const currentIndex = doctorToday.findIndex(a => new Date(a.appointmentDate) <= new Date())
            const patientIndex = doctorToday.findIndex(a => a._id === nextAppointment._id)
            if (patientIndex >= 0) {
              const currentPosition = currentIndex >= 0 ? currentIndex + 1 : 1
              const aheadCount = Math.max(0, patientIndex - (currentIndex >= 0 ? currentIndex : 0))
              const minutesUntil = Math.max(0, Math.round((new Date(nextAppointment.appointmentDate) - new Date()) / 60000))
              setQueueInfo({
                doctorName: nextAppointment.doctorId.name || 'your doctor',
                currentPosition,
                yourPosition: patientIndex + 1,
                totalToday: doctorToday.length,
                estimateMinutes: aheadCount * 15 + minutesUntil,
                nextTime: nextAppointment.appointmentDate
              })
            }
          }
        } else {
          setQueueInfo(null)
        }
      } catch {
        toast.error('Failed to load your dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  if (loading) return <Loader />

  const upcoming  = appointments.filter(a => a.status === 'Approved' || a.status === 'Pending')

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className='mb-6 pb-5 border-b' style={{ borderColor: 'var(--border)' }}>
        <p className='text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-400'>Patient Portal</p>
        <h1 className='mt-1 text-xl font-bold' style={{ color: 'var(--txt-primary)' }}>
          Hello, {user?.name?.split(' ')[0] || 'Patient'} 👋
        </h1>
        <p className='text-xs mt-0.5' style={{ color: 'var(--txt-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {queueInfo && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className='rounded-2xl border mb-6 overflow-hidden'
          style={{ background: 'var(--bg-card)', borderColor: '#0d9488', borderWidth: 1 }}
        >
          {/* Top accent bar */}
          <div className='h-1 w-full' style={{ background: 'linear-gradient(90deg, #0f766e, #0d9488, #14b8a6)' }} />

          <div className='p-5'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='flex h-5 w-5 items-center justify-center rounded-full text-white text-[9px] font-black' style={{ background: '#0d9488' }}>⏱</span>
              <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600'>Live OPD Queue</p>
            </div>

            <h2 className='text-base font-bold mb-1' style={{ color: 'var(--txt-primary)' }}>
              Dr. {queueInfo.doctorName}'s Queue
            </h2>
            <p className='text-xs mb-4' style={{ color: 'var(--txt-muted)' }}>
              Currently consulting Patient #{queueInfo.currentPosition} of {queueInfo.totalToday}
            </p>

            {/* Progress track */}
            <div className='mb-4'>
              <div className='flex justify-between text-[10px] font-semibold mb-1.5' style={{ color: 'var(--txt-muted)' }}>
                <span>Start</span>
                <span>Your slot: #{queueInfo.yourPosition}</span>
                <span>End</span>
              </div>
              <div className='h-2.5 rounded-full overflow-hidden' style={{ background: 'var(--bg-subtle)' }}>
                <div
                  className='h-full rounded-full transition-all duration-700'
                  style={{
                    width: `${Math.min(100, (queueInfo.currentPosition / queueInfo.totalToday) * 100)}%`,
                    background: 'linear-gradient(90deg, #0f766e, #0d9488)'
                  }}
                />
              </div>
              {/* Position marker */}
              <div className='relative mt-1' style={{ paddingLeft: `${Math.min(90, ((queueInfo.yourPosition - 1) / Math.max(queueInfo.totalToday - 1, 1)) * 100)}%` }}>
                <span className='text-[9px] font-black text-teal-600'>▲ You</span>
              </div>
            </div>

            <div className='flex flex-wrap gap-2 mt-3'>
              <span className='rounded-full px-3 py-1 text-[11px] font-bold text-teal-700' style={{ background: 'rgba(13,148,136,0.12)' }}>
                🔢 You are #{queueInfo.yourPosition}
              </span>
              <span className='rounded-full px-3 py-1 text-[11px] font-bold' style={{ background: 'rgba(245,158,11,0.12)', color: '#b45309' }}>
                ⏰ ~{queueInfo.estimateMinutes} min wait
              </span>
              <span className='rounded-full px-3 py-1 text-[11px] font-bold' style={{ background: 'rgba(37,99,235,0.1)', color: '#1d4ed8' }}>
                🕐 {new Date(queueInfo.nextTime).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className='grid md:grid-cols-3 gap-4 mb-6'>
        <StatCard label='Total Appointments' value={appointments.length}
          borderColor='#0d9488' iconColor='#0d9488' iconBg='rgba(13,148,136,0.1)' icon={FaCalendarCheck} index={0} />
        <StatCard label='Upcoming'           value={upcoming.length}
          borderColor='#f59e0b' iconColor='#d97706' iconBg='rgba(245,158,11,0.1)' icon={FaClock}          index={1} />
        <StatCard label='Prescriptions'      value={prescriptions.length}
          borderColor='#2563eb' iconColor='#2563eb' iconBg='rgba(37,99,235,0.1)'  icon={FaPrescriptionBottleAlt} index={2} />
      </div>

      {/* ── Book CTA banner ─────────────────────────────────────────────── */}
      <div
        className='rounded-xl p-6 mb-6 text-white flex items-center justify-between gap-4 flex-wrap'
        style={{ background: 'linear-gradient(105deg, #0f766e 0%, #0d9488 60%, #134e4a 100%)' }}
      >
        <div>
          <h2 className='text-base font-bold'>Need to see a doctor?</h2>
          <p className='text-xs mt-1 text-teal-100'>Book an appointment with our specialist doctors in minutes.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className='rounded-lg bg-white px-5 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 transition shadow-sm flex-shrink-0'
        >
          Book Appointment →
        </button>
      </div>

      {/* ── Detail panels ───────────────────────────────────────────────── */}
      <div className='grid md:grid-cols-2 gap-4'>

        {/* Upcoming appointments */}
        <div className='rounded-xl overflow-hidden' style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className='px-5 py-4 border-b flex items-center gap-2' style={{ borderColor: 'var(--border)' }}>
            <FaCalendarCheck size={13} style={{ color: '#0d9488' }} />
            <p className='text-xs font-bold' style={{ color: 'var(--txt-primary)' }}>Upcoming Appointments</p>
          </div>
          {upcoming.length === 0 ? (
            <div className='p-6'>
              <EmptyState icon={FaCalendarCheck} title='No upcoming appointments' />
            </div>
          ) : (
            <div className='divide-y' style={{ borderColor: 'var(--border)' }}>
              {upcoming.map(a => (
                <div key={a._id} className='flex items-center justify-between px-5 py-3 transition-colors'
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <p className='text-xs font-semibold' style={{ color: 'var(--txt-primary)' }}>
                      Dr. {a.doctorId?.name || '—'}
                    </p>
                    <p className='text-[10px] mt-0.5' style={{ color: 'var(--txt-muted)' }}>
                      {new Date(a.appointmentDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {a.symptoms && (
                      <p className='text-[10px] mt-0.5 max-w-[160px] truncate' style={{ color: 'var(--txt-muted)' }}>
                        {a.symptoms}
                      </p>
                    )}
                  </div>
                  <span className={STATUS_BADGE[a.status]}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent prescriptions */}
        <div className='rounded-xl overflow-hidden' style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className='px-5 py-4 border-b flex items-center gap-2' style={{ borderColor: 'var(--border)' }}>
            <FaPrescriptionBottleAlt size={13} style={{ color: '#0d9488' }} />
            <p className='text-xs font-bold' style={{ color: 'var(--txt-primary)' }}>Recent Prescriptions</p>
          </div>
          {prescriptions.length === 0 ? (
            <div className='p-6'>
              <EmptyState icon={FaPrescriptionBottleAlt} title='No prescriptions yet' />
            </div>
          ) : (
            <div className='divide-y' style={{ borderColor: 'var(--border)' }}>
              {prescriptions.slice(0, 5).map(rx => (
                <div key={rx._id} className='px-5 py-3 transition-colors'
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <p className='text-xs font-semibold' style={{ color: 'var(--txt-primary)' }}>
                    Dr. {rx.doctorId?.name || '—'}
                  </p>
                  <p className='text-[10px] mt-0.5' style={{ color: 'var(--txt-muted)' }}>
                    {new Date(rx.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {rx.medicines?.slice(0, 3).map((m, j) => (
                      <span
                        key={j}
                        className='inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold'
                        style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488' }}
                      >
                        {m.medicineName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VitalsTracker patientId={user?._id} />

      {/* ── Calendar View ─────────────────────────────────────────────── */}
      <div className='mt-6'>
        <CalendarView appointments={appointments} role="patient" />
      </div>
    </div>
  )
}

export default PatientDashboard