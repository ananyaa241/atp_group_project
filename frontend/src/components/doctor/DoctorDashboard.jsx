import { useEffect, useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FaCalendarCheck, FaUsers, FaCheckCircle, FaClock, FaUserMd } from 'react-icons/fa'
import axiosInstance from '../../api/axiosInstance'
import { AuthContext } from '../../context/AuthContext'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import CalendarView from '../appointment/CalendarView'

const STATUS_BADGE = {
  Pending:   'badge badge-pending',
  Approved:  'badge badge-approved',
  Completed: 'badge badge-completed',
  Cancelled: 'badge badge-cancelled',
}

function StatCard({ icon: Icon, label, value, color, iconBg, iconColor, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className='rounded-xl p-4'
      style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderLeftWidth:4, borderLeftColor: color }}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-[10px] uppercase tracking-wider font-semibold' style={{ color:'var(--txt-muted)' }}>{label}</p>
          <p className='mt-1.5 text-2xl font-extrabold' style={{ color:'var(--txt-primary)' }}>{value}</p>
        </div>
        <div className='h-9 w-9 rounded-xl flex items-center justify-center' style={{ background: iconBg }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
      </div>
    </motion.div>
  )
}

function DoctorDashboard() {
  const { user } = useContext(AuthContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!user?._id) return
    axiosInstance.get(`/appointment-api/doctor/${user._id}`)
      .then(res => setAppointments(res.data.payload || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [user])

  async function handleStatus(id, newStatus) {
    try {
      await axiosInstance.put(`/appointment-api/update-status/${id}`, { status: newStatus })
      toast.success(`Marked as ${newStatus}`)
      setAppointments(prev => prev.map(a => a._id===id ? {...a, status:newStatus} : a))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  async function handleAdvanceQueue() {
    const queueAppointments = todayAppts
      .filter(a => ['Pending', 'Approved'].includes(a.status))
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    if (queueAppointments.length === 0) {
      toast('No active patients in the queue.')
      return
    }
    const nextUp = queueAppointments[0]
    await handleStatus(nextUp._id, 'Completed')
  }

  if (loading) return <Loader />

  const today      = new Date().toDateString()
  const pending    = appointments.filter(a => a.status==='Pending')
  const completed  = appointments.filter(a => a.status==='Completed')
  const todayAppts = appointments.filter(a => new Date(a.appointmentDate).toDateString()===today)
  const queueAppointments = todayAppts
    .filter(a => ['Pending', 'Approved'].includes(a.status))
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
  const currentAppointment = queueAppointments.find(a => new Date(a.appointmentDate) <= new Date()) || queueAppointments[0]
  const currentPosition = currentAppointment ? queueAppointments.findIndex(a => a._id === currentAppointment._id) + 1 : 0
  const nextTimeLabel = currentAppointment ? new Date(currentAppointment.appointmentDate).toLocaleTimeString('en-IN', { timeStyle: 'short' }) : null

  return (
    <div>
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className='mb-6 pb-5 border-b' style={{ borderColor:'var(--border)' }}>
        <p className='text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-400'>Doctor Portal</p>
        <h1 className='mt-1 text-xl font-bold' style={{ color:'var(--txt-primary)' }}>
          Dr. {user?.name?.split(' ')[0]}'s Dashboard
        </h1>
        {user?.specialization && (
          <span className='inline-block mt-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300'>
            <FaUserMd className='inline mr-1' size={9} />{user.specialization}
          </span>
        )}
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
        <StatCard icon={FaCalendarCheck} label='Total'     value={appointments.length} color='#0d9488' iconColor='#0d9488' iconBg='rgba(13,148,136,0.1)' index={0} />
        <StatCard icon={FaClock}         label='Pending'   value={pending.length}      color='#f59e0b' iconColor='#d97706' iconBg='rgba(245,158,11,0.1)' index={1} />
        <StatCard icon={FaCheckCircle}   label='Completed' value={completed.length}    color='#2563eb' iconColor='#2563eb' iconBg='rgba(37,99,235,0.1)'  index={2} />
        <StatCard icon={FaUsers}         label="Today"     value={todayAppts.length}   color='#dc2626' iconColor='#dc2626' iconBg='rgba(220,38,38,0.1)'  index={3} />
      </div>

      {/* ── Live queue overview ───────────────────────────────────────── */}
      <div className='rounded-2xl mb-6 border overflow-hidden' style={{ background:'var(--bg-card)', borderColor:'#0d9488' }}>
        <div className='h-1 w-full' style={{ background: 'linear-gradient(90deg, #0f766e, #0d9488, #14b8a6)' }} />
        <div className='px-5 py-4 border-b flex items-center justify-between' style={{ borderColor:'var(--border)' }}>
          <div>
            <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600'>Live OPD Queue</p>
            <h2 className='mt-1 text-base font-bold' style={{ color:'var(--txt-primary)' }}>
              Today's Patient Queue
            </h2>
          </div>
          {queueAppointments.length > 0 && (
            <button
              type='button'
              onClick={handleAdvanceQueue}
              className='rounded-xl px-4 py-2 text-[11px] font-bold text-white transition hover:opacity-90 flex items-center gap-2'
              style={{ background: 'linear-gradient(105deg, #0f766e 0%, #0d9488 100%)' }}
            >
              ✅ Complete &amp; Next Patient
            </button>
          )}
        </div>

        {queueAppointments.length === 0 ? (
          <div className='px-5 py-8 text-center'>
            <p className='text-sm font-semibold' style={{ color:'var(--txt-secondary)' }}>🎉 Queue is clear for today</p>
            <p className='text-xs mt-1' style={{ color:'var(--txt-muted)' }}>No pending or approved appointments remaining.</p>
          </div>
        ) : (
          <div className='divide-y' style={{ borderColor:'var(--border)' }}>
            {queueAppointments.map((a, i) => {
              const isCurrent = i === 0
              return (
                <div
                  key={a._id}
                  className='flex items-center gap-4 px-5 py-3.5 transition-colors'
                  style={{ background: isCurrent ? 'rgba(13,148,136,0.06)' : 'transparent' }}
                >
                  {/* Position badge */}
                  <div
                    className='h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0'
                    style={{
                      background: isCurrent ? '#0d9488' : 'var(--bg-subtle)',
                      color: isCurrent ? '#fff' : 'var(--txt-muted)'
                    }}
                  >
                    #{i + 1}
                  </div>

                  {/* Patient info */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-bold truncate' style={{ color:'var(--txt-primary)' }}>
                      {a.patientId?.name || '—'}
                      {isCurrent && <span className='ml-2 text-[9px] font-black text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full'>CURRENT</span>}
                    </p>
                    <p className='text-[10px] mt-0.5' style={{ color:'var(--txt-muted)' }}>
                      {new Date(a.appointmentDate).toLocaleTimeString('en-IN', { timeStyle:'short' })}
                      {a.symptoms && ` · ${a.symptoms.slice(0, 35)}`}
                    </p>
                  </div>

                  {/* Status */}
                  <span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Today's appointments ───────────────────────────────────────── */}
      {todayAppts.length > 0 && (
        <div className='rounded-xl mb-5 overflow-hidden' style={{ border:'1px solid var(--border)' }}>
          <div className='px-5 py-3 bg-teal-700'>
            <p className='text-xs font-bold text-white'>📅 Today's Schedule — {todayAppts.length} appointment{todayAppts.length!==1?'s':''}</p>
          </div>
          <div className='divide-y' style={{ divideColor:'var(--border)' }}>
            {todayAppts.map(a => (
              <div key={a._id} className='flex items-center justify-between px-5 py-3' style={{ background:'var(--bg-card)' }}>
                <div>
                  <p className='text-xs font-semibold' style={{ color:'var(--txt-primary)' }}>{a.patientId?.name||'—'}</p>
                  <p className='text-[10px] mt-0.5' style={{ color:'var(--txt-muted)' }}>
                    {new Date(a.appointmentDate).toLocaleTimeString('en-IN',{timeStyle:'short'})}
                    {a.symptoms && ` · ${a.symptoms.slice(0,35)}`}
                  </p>
                </div>
                <select
                  value={a.status}
                  onChange={e => handleStatus(a._id, e.target.value)}
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold border-none outline-none cursor-pointer ${STATUS_BADGE[a.status]}`}
                >
                  {['Pending','Approved','Completed','Cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── All appointments ───────────────────────────────────────────── */}
      <div className='rounded-xl overflow-hidden' style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div className='px-5 py-4 border-b' style={{ borderColor:'var(--border)' }}>
          <p className='text-xs font-bold' style={{ color:'var(--txt-primary)' }}>All Patient Appointments</p>
        </div>
        {appointments.length===0 ? (
          <div className='p-6'>
            <EmptyState icon={FaCalendarCheck} title='No appointments yet' message='Patient appointments will appear here once booked.' />
          </div>
        ) : (
          <div className='divide-y max-h-[420px] overflow-y-auto' style={{ divideColor:'var(--border)' }}>
            {appointments.map(a => (
              <div key={a._id} className='flex items-center justify-between px-5 py-3 transition-colors'
                style={{ background:'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-semibold truncate' style={{ color:'var(--txt-primary)' }}>{a.patientId?.name||'—'}</p>
                  <p className='text-[10px] mt-0.5' style={{ color:'var(--txt-muted)' }}>
                    {new Date(a.appointmentDate).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}
                    {a.symptoms && <span className='ml-1 opacity-70'>· {a.symptoms.slice(0,30)}</span>}
                  </p>
                </div>
                <select
                  value={a.status}
                  onChange={e => handleStatus(a._id, e.target.value)}
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold border-none outline-none cursor-pointer ml-3 ${STATUS_BADGE[a.status]}`}
                >
                  {['Pending','Approved','Completed','Cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Calendar View ─────────────────────────────────────────────── */}
      <div className='mt-6'>
        <CalendarView appointments={appointments} role="doctor" />
      </div>
    </div>
  )
}

export default DoctorDashboard