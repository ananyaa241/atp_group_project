import { useEffect, useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FaCalendarCheck, FaSearch, FaTrash } from 'react-icons/fa'
import axiosInstance from '../../api/axiosInstance'
import { AuthContext } from '../../context/AuthContext'
import { SkeletonTable } from '../common/SkeletonCard'
import EmptyState from '../common/EmptyState'

const STATUS_BADGE = {
  Pending:   'badge badge-pending',
  Approved:  'badge badge-approved',
  Completed: 'badge badge-completed',
  Cancelled: 'badge badge-cancelled',
}

const STATUSES = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled']

function Appointments() {
  const { role, user } = useContext(AuthContext)
  const [appointments, setAppointments] = useState([])
  const [filtered, setFiltered]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery]   = useState('')

  async function fetchAppointments() {
    try {
      setLoading(true)
      let endpoint = '/appointment-api/'
      if (role === 'doctor' && user?._id) {
        endpoint = `/appointment-api/doctor/${user._id}`
      } else if (role === 'patient' && user?._id) {
        endpoint = `/appointment-api/patient/${user._id}`
      }
      const res = await axiosInstance.get(endpoint)
      const data = res.data.payload || []
      setAppointments(data)
      setFiltered(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments() }, [])

  useEffect(() => {
    let list = [...appointments]
    if (statusFilter !== 'All') list = list.filter(a => a.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(a =>
        a.patientId?.name?.toLowerCase().includes(q) ||
        a.doctorId?.name?.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [statusFilter, searchQuery, appointments])

  async function handleDelete(id) {
    if (!window.confirm('Delete this appointment?')) return
    try {
      await axiosInstance.delete(`/appointment-api/delete/${id}`)
      toast.success('Appointment deleted')
      fetchAppointments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await axiosInstance.put(`/appointment-api/update-status/${id}`, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      fetchAppointments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const colCount = role !== 'patient' ? 6 : 5

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className='mb-6 pb-5 border-b' style={{ borderColor:'var(--border)' }}>
        <p className='text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-400'>Healthcare</p>
        <h1 className='mt-1 text-xl font-bold' style={{ color:'var(--txt-primary)' }}>Appointments</h1>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className='flex flex-wrap gap-3 mb-5'>
        {/* Search */}
        <div className='relative flex-1 min-w-[200px]'>
          <FaSearch size={12} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color:'var(--txt-muted)' }} />
          <input
            type='text'
            placeholder='Search patient or doctor...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-9 pr-4 py-2 rounded-lg border text-xs outline-none transition'
            style={{ borderColor:'var(--border)', background:'var(--bg-card)', color:'var(--txt-primary)' }}
            onFocus={e => e.target.style.borderColor='#0d9488'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
        </div>

        {/* Status filters */}
        <div className='flex gap-1.5 flex-wrap'>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className='px-3 py-2 rounded-lg text-xs font-semibold transition-colors'
              style={{
                background: statusFilter===s ? '#0d9488' : 'var(--bg-card)',
                color: statusFilter===s ? '#fff' : 'var(--txt-secondary)',
                border: `1px solid ${statusFilter===s ? '#0d9488' : 'var(--border)'}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className='rounded-xl overflow-hidden' style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[600px] text-xs'>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-subtle)' }}>
                {['Patient', 'Doctor', 'Date & Time', 'Symptoms', 'Status',
                  ...(role === 'admin' ? ['Actions'] : [])
                ].map(h => (
                  <th key={h} className='px-5 py-3 text-left'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={colCount}>
                  <SkeletonTable rows={5} cols={colCount} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={colCount}>
                  <div className='p-8'>
                    <EmptyState icon={FaCalendarCheck} title='No appointments found' message='Try a different search or filter.' />
                  </div>
                </td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((appt, i) => (
                    <motion.tr
                      key={appt._id}
                      initial={{ opacity:0 }}
                      animate={{ opacity:1 }}
                      transition={{ delay: i*0.03 }}
                      style={{ borderBottom:'1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      <td className='px-5 py-3 font-semibold' style={{ color:'var(--txt-primary)' }}>
                        {appt.patientId?.name || '—'}
                      </td>
                      <td className='px-5 py-3' style={{ color:'var(--txt-secondary)' }}>
                        Dr. {appt.doctorId?.name || '—'}
                      </td>
                      <td className='px-5 py-3' style={{ color:'var(--txt-secondary)' }}>
                        {new Date(appt.appointmentDate).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}
                      </td>
                      <td className='px-5 py-3 max-w-[130px] truncate' style={{ color:'var(--txt-muted)' }}>
                        {appt.symptoms || '—'}
                      </td>
                      <td className='px-5 py-3'>
                        {role !== 'patient' ? (
                          <select
                            value={appt.status}
                            onChange={e => handleStatusChange(appt._id, e.target.value)}
                            className={`${STATUS_BADGE[appt.status]} border-none outline-none cursor-pointer`}
                          >
                            {['Pending','Approved','Completed','Cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={STATUS_BADGE[appt.status]}>{appt.status}</span>
                        )}
                      </td>
                      {role === 'admin' && (
                        <td className='px-5 py-3'>
                          <button
                            onClick={() => handleDelete(appt._id)}
                            className='h-7 w-7 rounded-lg border flex items-center justify-center transition-colors'
                            style={{ borderColor:'rgba(220,38,38,0.3)', color:'#dc2626', background:'rgba(220,38,38,0.06)' }}
                            onMouseEnter={e => { e.currentTarget.style.background='rgba(220,38,38,0.15)' }}
                            onMouseLeave={e => { e.currentTarget.style.background='rgba(220,38,38,0.06)' }}
                          >
                            <FaTrash size={10} />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filtered.length > 0 && (
        <p className='mt-3 text-xs' style={{ color:'var(--txt-muted)' }}>
          Showing <strong style={{ color:'var(--txt-secondary)' }}>{filtered.length}</strong> of{' '}
          <strong style={{ color:'var(--txt-secondary)' }}>{appointments.length}</strong> appointments
        </p>
      )}
    </div>
  )
}

export default Appointments