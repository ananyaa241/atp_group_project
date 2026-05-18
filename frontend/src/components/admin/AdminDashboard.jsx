import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FaUserMd, FaUsers, FaCalendarCheck, FaArrowUp, FaCalendarDay } from 'react-icons/fa'
import { MdOutlineAttachMoney } from 'react-icons/md'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import axiosInstance from '../../api/axiosInstance'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'

const STATUS_CFG = {
  Pending:   { bar: '#f59e0b', badge: 'badge-pending'   },
  Approved:  { bar: '#0d9488', badge: 'badge-approved'  },
  Completed: { bar: '#2563eb', badge: 'badge-completed' },
  Cancelled: { bar: '#dc2626', badge: 'badge-cancelled' },
}
const PIE_COLORS = ['#0d9488', '#2563eb', '#f59e0b', '#dc2626', '#7c3aed', '#059669']

function StatCard({ icon: Icon, label, value, trendLabel, borderColor, iconColor, iconBg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className='rounded-xl p-5'
      style={{ background: 'var(--bg-card)', border: `1px solid var(--border)`, borderLeftWidth: 4, borderLeftColor: borderColor }}
    >
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-[10px] uppercase tracking-widest font-semibold' style={{ color: 'var(--txt-muted)' }}>{label}</p>
          <p className='mt-2 text-3xl font-extrabold' style={{ color: 'var(--txt-primary)' }}>{value}</p>
          {trendLabel && (
            <p className='mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1'>
              <FaArrowUp size={9} />{trendLabel}
            </p>
          )}
        </div>
        <div className='h-10 w-10 rounded-xl flex items-center justify-center' style={{ background: iconBg }}>
          <Icon size={17} style={{ color: iconColor }} />
        </div>
      </div>
    </motion.div>
  )
}

function getSampleFee(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fee = 2000 + (Math.abs(hash) % 3001); 
  return Math.round(fee / 100) * 100;
}

function AdminDashboard() {
  const [stats, setStats]           = useState({ doctors: 0, patients: 0, appointments: 0 })
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors]       = useState([])
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    qualification: '',
    consultationFee: ''
  })
  const [loading, setLoading]       = useState(true)
  const [creatingDoctor, setCreatingDoctor] = useState(false)

  async function loadAll() {
    try {
      setLoading(true)
      const [statsRes, apptRes, docRes] = await Promise.all([
        axiosInstance.get('/admin-api/dashboard'),
        axiosInstance.get('/appointment-api/'),
        axiosInstance.get('/doctor-api/doctors')
      ])
      setStats({ doctors: statsRes.data.doctorsCount, patients: statsRes.data.patientsCount, appointments: statsRes.data.appointmentsCount })
      setAppointments(apptRes.data.payload || [])
      setDoctors(docRes.data.payload || [])
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleDoctorSubmit(e) {
    e.preventDefault()
    try {
      setCreatingDoctor(true)
      await axiosInstance.post('/doctor-api/register', {
        ...doctorForm,
        experience: Number(doctorForm.experience),
        consultationFee: Number(doctorForm.consultationFee || 0)
      })
      toast.success('Doctor account created successfully')
      setDoctorForm({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: '',
        qualification: '',
        consultationFee: ''
      })
      await loadAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor')
    } finally {
      setCreatingDoctor(false)
    }
  }

  function updateDoctorForm(key, value) {
    setDoctorForm(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <Loader />

  const statusCounts = ['Pending', 'Approved', 'Completed', 'Cancelled'].map(s => ({
    name: s, count: appointments.filter(a => a.status === s).length, fill: STATUS_CFG[s].bar
  }))

  const specMap = {}
  doctors.forEach(d => { const k = d.specialization || 'Other'; specMap[k] = (specMap[k]||0)+1 })
  const pieData = Object.entries(specMap).map(([name, value]) => ({ name, value }))

  const today = new Date().toDateString()
  const todayAppts = appointments.filter(a => new Date(a.appointmentDate).toDateString() === today)
  
  let totalRevenue = 0
  appointments.forEach(a => {
    if (a.status === 'Completed' && a.doctorId) {
      const fee = a.doctorId.consultationFee > 0 ? a.doctorId.consultationFee : getSampleFee(a.doctorId._id)
      totalRevenue += fee
    }
  })

  return (
    <div>
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className='mb-6 pb-5 border-b' style={{ borderColor: 'var(--border)' }}>
        <p className='text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-400'>Admin Portal</p>
        <h1 className='mt-1 text-xl font-bold' style={{ color: 'var(--txt-primary)' }}>Dashboard Overview</h1>
        <p className='text-xs mt-0.5' style={{ color: 'var(--txt-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <StatCard icon={FaUsers}        label='Total Patients' value={stats.patients}
          borderColor='#2563eb' iconColor='#2563eb' iconBg='rgba(37,99,235,0.1)' trendLabel='Registered' index={0} />
        <StatCard icon={FaCalendarCheck} label='Total Appointments' value={stats.appointments}
          borderColor='#0d9488' iconColor='#0d9488' iconBg='rgba(13,148,136,0.1)' trendLabel='All time' index={1} />
        <StatCard icon={FaCalendarDay}  label="Today's Appointments" value={todayAppts.length}
          borderColor='#f59e0b' iconColor='#d97706' iconBg='rgba(245,158,11,0.1)' trendLabel='Scheduled for today' index={2} />
        <StatCard icon={MdOutlineAttachMoney} label='Total Revenue' value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          borderColor='#16a34a' iconColor='#16a34a' iconBg='rgba(22,163,74,0.1)' trendLabel='From completed appts' index={3} />
      </div>

      <div className='rounded-2xl p-5 mb-6' style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div className='flex items-center justify-between gap-4 mb-4'>
          <div>
            <p className='text-xs uppercase tracking-widest font-bold text-teal-600'>Doctor Accounts</p>
            <h2 className='mt-2 text-lg font-bold' style={{ color:'var(--txt-primary)' }}>Create a new doctor profile</h2>
            <p className='text-[10px] mt-1' style={{ color:'var(--txt-muted)' }}>Only administrators can add doctors to the system.</p>
          </div>
        </div>
        <form onSubmit={handleDoctorSubmit} className='grid gap-4 md:grid-cols-3'>
          {[
            { label: 'Name', field: 'name', type: 'text' },
            { label: 'Email', field: 'email', type: 'email' },
            { label: 'Password', field: 'password', type: 'password' },
            { label: 'Specialization', field: 'specialization', type: 'text' },
            { label: 'Experience (years)', field: 'experience', type: 'number' },
            { label: 'Qualification', field: 'qualification', type: 'text' },
            { label: 'Consultation Fee', field: 'consultationFee', type: 'number' }
          ].map(({ label, field, type }) => (
            <label key={field} className='block'>
              <span className='text-[11px] font-semibold' style={{ color:'var(--txt-secondary)' }}>{label}</span>
              <input
                type={type}
                value={doctorForm[field] || ''}
                onChange={e => updateDoctorForm(field, e.target.value)}
                className='mt-2 w-full rounded-2xl border px-3 py-2 outline-none transition'
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--txt-primary)' }}
              />
            </label>
          ))}
          <div className='md:col-span-3'>
            <button
              type='submit'
              disabled={creatingDoctor}
              className='w-full rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition disabled:opacity-60'
            >
              {creatingDoctor ? 'Creating doctor…' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className='grid md:grid-cols-2 gap-4 mb-6'>
        {/* Bar */}
        <div className='rounded-xl p-5' style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <p className='text-xs font-bold mb-1' style={{ color:'var(--txt-primary)' }}>Appointments by Status</p>
          <p className='text-[10px] mb-4' style={{ color:'var(--txt-muted)' }}>Current appointment pipeline</p>
          {statusCounts.every(s => s.count === 0) ? <EmptyState title='No appointments yet' /> : (
            <ResponsiveContainer width='100%' height={180}>
              <BarChart data={statusCounts} barSize={24}>
                <CartesianGrid strokeDasharray='3 3' stroke='rgba(148,163,184,0.12)' />
                <XAxis dataKey='name' tick={{ fontSize: 10, fill:'var(--txt-muted)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill:'var(--txt-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize:11, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--txt-primary)' }} />
                <Bar dataKey='count' radius={[5,5,0,0]}>
                  {statusCounts.map((e,i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie */}
        <div className='rounded-xl p-5' style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <p className='text-xs font-bold mb-1' style={{ color:'var(--txt-primary)' }}>Doctor Specialisation Mix</p>
          <p className='text-[10px] mb-4' style={{ color:'var(--txt-muted)' }}>Distribution across departments</p>
          {pieData.length === 0 ? <EmptyState title='No doctors registered yet' /> : (
            <ResponsiveContainer width='100%' height={180}>
              <PieChart>
                <Pie data={pieData} cx='50%' cy='50%' outerRadius={70} dataKey='value'
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false} style={{ fontSize: 10 }}>
                  {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize:11, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--txt-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Today's Live OPD Queue ───────────────────────────────────────────── */}
      <div className='rounded-2xl mb-6 overflow-hidden' style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div className='px-5 py-4 border-b flex items-center justify-between' style={{ borderColor:'var(--border)' }}>
          <div>
            <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600'>Live OPD</p>
            <p className='text-xs font-bold mt-0.5' style={{ color:'var(--txt-primary)' }}>
              Today's Queue — {todayAppts.length} appointment{todayAppts.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <span
            className='rounded-full px-3 py-1 text-[10px] font-bold'
            style={{ background: 'rgba(13,148,136,0.12)', color: '#0d9488' }}
          >
            {new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </span>
        </div>

        {todayAppts.length === 0 ? (
          <div className='p-8 text-center'>
            <p className='text-sm font-semibold' style={{ color:'var(--txt-secondary)' }}>No appointments scheduled for today</p>
            <p className='text-xs mt-1' style={{ color:'var(--txt-muted)' }}>OPD queue will appear here once appointments are booked for today.</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-subtle)' }}>
                  {['#', 'Patient', 'Doctor', 'Specialisation', 'Time Slot', 'Status'].map(h => (
                    <th key={h} className='px-5 py-3 text-left'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...todayAppts]
                  .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                  .map((a, i) => (
                    <tr
                      key={a._id}
                      className='transition-colors'
                      style={{ borderBottom:'1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className='px-5 py-3'>
                        <div
                          className='h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black'
                          style={{
                            background: i === 0 ? '#0d9488' : 'var(--bg-subtle)',
                            color: i === 0 ? '#fff' : 'var(--txt-muted)'
                          }}
                        >
                          {i + 1}
                        </div>
                      </td>
                      <td className='px-5 py-3 font-semibold' style={{ color:'var(--txt-primary)' }}>
                        {a.patientId?.name || '—'}
                      </td>
                      <td className='px-5 py-3' style={{ color:'var(--txt-secondary)' }}>
                        Dr. {a.doctorId?.name || '—'}
                      </td>
                      <td className='px-5 py-3' style={{ color:'var(--txt-muted)' }}>
                        {a.doctorId?.specialization || '—'}
                      </td>
                      <td className='px-5 py-3 font-semibold' style={{ color:'var(--txt-secondary)' }}>
                        {new Date(a.appointmentDate).toLocaleTimeString('en-IN', { timeStyle:'short' })}
                      </td>
                      <td className='px-5 py-3'>
                        <span className={`badge ${STATUS_CFG[a.status]?.badge || 'badge-pending'}`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recent appointments ─────────────────────────────────────────────── */}
      <div className='rounded-xl' style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div className='px-5 py-4 border-b' style={{ borderColor:'var(--border)' }}>
          <p className='text-xs font-bold' style={{ color:'var(--txt-primary)' }}>Recent Appointments</p>
          <p className='text-[10px] mt-0.5' style={{ color:'var(--txt-muted)' }}>Latest 8 entries</p>
        </div>
        {appointments.length === 0 ? (
          <div className='p-6'><EmptyState icon={FaCalendarCheck} title='No appointments yet' /></div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Patient', 'Doctor', 'Date', 'Status'].map(h => (
                    <th key={h} className='px-5 py-3 text-left'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0,8).map((a,i) => (
                  <tr
                    key={a._id}
                    className='transition-colors'
                    style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td className='px-5 py-3 font-semibold' style={{ color:'var(--txt-primary)' }}>{a.patientId?.name||'—'}</td>
                    <td className='px-5 py-3' style={{ color:'var(--txt-secondary)' }}>Dr. {a.doctorId?.name||'—'}</td>
                    <td className='px-5 py-3' style={{ color:'var(--txt-muted)' }}>{new Date(a.appointmentDate).toLocaleDateString('en-IN')}</td>
                    <td className='px-5 py-3'>
                      <span className={`badge ${STATUS_CFG[a.status]?.badge||'badge-pending'}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard