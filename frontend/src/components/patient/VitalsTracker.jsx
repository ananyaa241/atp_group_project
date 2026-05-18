import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import axiosInstance from '../../api/axiosInstance'
import {
  FaHeartbeat, FaWeight, FaTint, FaThermometerHalf,
  FaTrash, FaLock, FaPlusCircle
} from 'react-icons/fa'

function getDisplayDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  LOCKED STATE — shown when no completed appointment exists                  */
/* ──────────────────────────────────────────────────────────────────────────── */
function LockedState() {
  return (
    <section
      className='mt-6 rounded-2xl border overflow-hidden'
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className='px-5 py-4 border-b' style={{ borderColor: 'var(--border)' }}>
        <p className='text-xs uppercase tracking-widest font-semibold text-teal-600'>Health Diary</p>
        <h2 className='mt-2 text-lg font-bold' style={{ color: 'var(--txt-primary)' }}>
          Interactive Vitals Tracker
        </h2>
      </div>
      <div className='flex flex-col items-center gap-4 py-14 px-6 text-center'>
        <div className='h-14 w-14 rounded-2xl flex items-center justify-center'
          style={{ background: 'rgba(13,148,136,0.1)' }}>
          <FaLock size={22} className='text-teal-600' />
        </div>
        <div>
          <p className='text-sm font-bold' style={{ color: 'var(--txt-primary)' }}>
            Health Diary is Locked
          </p>
          <p className='mt-1 text-xs max-w-xs' style={{ color: 'var(--txt-muted)' }}>
            Complete your first appointment with a doctor to unlock your personal Health Diary and
            start tracking your daily vitals.
          </p>
        </div>
        <span
          className='rounded-full px-4 py-1.5 text-[11px] font-bold text-teal-700'
          style={{ background: 'rgba(13,148,136,0.12)' }}
        >
          🔒 Complete an appointment to unlock
        </span>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                              */
/* ──────────────────────────────────────────────────────────────────────────── */
function VitalsTracker({ patientId }) {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [eligible, setEligible]   = useState(null)   // null = checking
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]   = useState(null)   // id being deleted
  const [showHistory, setShowHistory] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    bloodPressure: '',
    heartRate: '',
    sugarLevel: '',
    weight: '',
    temperature: ''
  })

  /* ── eligibility check ────────────────────────────── */
  useEffect(() => {
    if (!patientId) return
    axiosInstance.get(`/vitals-api/check-eligibility/${patientId}`)
      .then(res => setEligible(res.data.eligible))
      .catch(() => setEligible(false))
  }, [patientId])

  /* ── fetch vitals ─────────────────────────────────── */
  useEffect(() => {
    if (!patientId || eligible !== true) return
    fetchVitals()
  }, [patientId, eligible])

  async function fetchVitals() {
    try {
      setLoading(true)
      const res = await axiosInstance.get(`/vitals-api/patient/${patientId}`)
      const data = res.data.payload || []
      setRecords(data.map(item => ({ ...item, dateLabel: getDisplayDate(item.date) })))
    } catch {
      toast.error('Unable to load health diary')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axiosInstance.post('/vitals-api/add', {
        patientId,
        date: new Date(form.date).toISOString(),
        bloodPressure: form.bloodPressure,
        heartRate: Number(form.heartRate) || null,
        sugarLevel: Number(form.sugarLevel) || null,
        weight: Number(form.weight) || null,
        temperature: Number(form.temperature) || null
      })
      toast.success('Vitals logged successfully')
      setForm(prev => ({ ...prev, bloodPressure: '', heartRate: '', sugarLevel: '', weight: '', temperature: '' }))
      fetchVitals()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vitals')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await axiosInstance.delete(`/vitals-api/${id}`)
      toast.success('Record deleted')
      setRecords(prev => prev.filter(r => r._id !== id))
    } catch {
      toast.error('Failed to delete record')
    } finally {
      setDeleting(null)
    }
  }

  const latest = useMemo(() => (records.length ? records[records.length - 1] : null), [records])

  /* ── while checking eligibility ───────────────────── */
  if (eligible === null) return null

  /* ── locked ───────────────────────────────────────── */
  if (!eligible) return <LockedState />

  /* ── unlocked ─────────────────────────────────────── */
  return (
    <section
      className='mt-6 rounded-2xl border overflow-hidden'
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className='px-5 py-4 border-b flex items-center justify-between gap-3' style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className='text-xs uppercase tracking-widest font-semibold text-teal-600'>Health Diary</p>
          <h2 className='mt-1 text-base font-bold' style={{ color: 'var(--txt-primary)' }}>
            Interactive Vitals Tracker
          </h2>
          <p className='mt-0.5 text-[11px]' style={{ color: 'var(--txt-muted)' }}>
            Log daily vitals and view trends to share with your doctor.
          </p>
        </div>
        <button
          onClick={() => setShowHistory(v => !v)}
          className='flex-shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold border transition-all'
          style={{
            borderColor: showHistory ? '#0d9488' : 'var(--border)',
            color: showHistory ? '#0d9488' : 'var(--txt-muted)',
            background: showHistory ? 'rgba(13,148,136,0.08)' : 'transparent'
          }}
        >
          {showHistory ? '📊 Chart' : '📋 History'}
        </button>
      </div>

      <div className='p-5 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]'>

        {/* LEFT: chart + stat cards */}
        <div className='space-y-4'>

          {/* Latest stats */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              { icon: FaTint,             label: 'Blood Pressure', value: latest?.bloodPressure || '—',                        color: '#dc2626' },
              { icon: FaHeartbeat,        label: 'Heart Rate',     value: latest?.heartRate ? `${latest.heartRate} bpm` : '—', color: '#e11d48' },
              { icon: FaTint,             label: 'Blood Sugar',    value: latest?.sugarLevel ? `${latest.sugarLevel} mg/dL` : '—', color: '#0d9488' },
              { icon: FaThermometerHalf,  label: 'Temperature',    value: latest?.temperature ? `${latest.temperature}°F` : '—', color: '#f97316' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className='rounded-xl border p-3' style={{ borderColor: 'var(--border)' }}>
                <div className='flex items-center gap-1.5 mb-1.5'>
                  <Icon size={10} style={{ color }} />
                  <p className='text-[9px] uppercase tracking-widest font-semibold' style={{ color: 'var(--txt-muted)' }}>{label}</p>
                </div>
                <p className='text-base font-extrabold' style={{ color: 'var(--txt-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Chart / History toggle */}
          {!showHistory ? (
            <div className='rounded-xl border p-4' style={{ borderColor: 'var(--border)' }}>
              <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600 mb-1'>Trend Chart</p>
              <p className='text-[11px] mb-3' style={{ color: 'var(--txt-muted)' }}>
                {records.length} data point{records.length !== 1 ? 's' : ''} recorded
              </p>
              <div className='h-[280px]'>
                {loading ? (
                  <div className='flex h-full items-center justify-center text-xs' style={{ color: 'var(--txt-muted)' }}>
                    Loading chart…
                  </div>
                ) : records.length > 1 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={records} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
                      <XAxis dataKey='dateLabel' tick={{ fill: 'var(--txt-secondary)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--txt-secondary)', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 10, fontSize: 11, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--txt-primary)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type='monotone' dataKey='heartRate'  stroke='#dc2626' strokeWidth={2} dot={false} name='Heart Rate' />
                      <Line type='monotone' dataKey='sugarLevel' stroke='#0d9488' strokeWidth={2} dot={false} name='Blood Sugar' />
                      <Line type='monotone' dataKey='weight'     stroke='#16a34a' strokeWidth={2} dot={false} name='Weight (kg)' />
                      <Line type='monotone' dataKey='temperature' stroke='#f97316' strokeWidth={2} dot={false} name='Temp (°F)' />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='flex h-full items-center justify-center text-xs text-center px-6' style={{ color: 'var(--txt-muted)' }}>
                    Add at least two vitals entries to view trend graphs.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* History table */
            <div className='rounded-xl border overflow-hidden' style={{ borderColor: 'var(--border)' }}>
              <div className='px-4 py-3 border-b' style={{ borderColor: 'var(--border)' }}>
                <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600'>Vitals History</p>
              </div>
              {records.length === 0 ? (
                <p className='p-6 text-xs text-center' style={{ color: 'var(--txt-muted)' }}>No records yet. Log your first entry!</p>
              ) : (
                <div className='overflow-x-auto max-h-72'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                        {['Date', 'BP', 'Heart Rate', 'Sugar', 'Weight', 'Temp', ''].map(h => (
                          <th key={h} className='px-4 py-2 text-left'>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {[...records].reverse().map(r => (
                          <motion.tr
                            key={r._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ borderBottom: '1px solid var(--border)' }}
                          >
                            <td className='px-4 py-2 font-semibold' style={{ color: 'var(--txt-secondary)' }}>{r.dateLabel}</td>
                            <td className='px-4 py-2' style={{ color: 'var(--txt-primary)' }}>{r.bloodPressure || '—'}</td>
                            <td className='px-4 py-2' style={{ color: 'var(--txt-primary)' }}>{r.heartRate ? `${r.heartRate} bpm` : '—'}</td>
                            <td className='px-4 py-2' style={{ color: 'var(--txt-primary)' }}>{r.sugarLevel ? `${r.sugarLevel} mg/dL` : '—'}</td>
                            <td className='px-4 py-2' style={{ color: 'var(--txt-primary)' }}>{r.weight ? `${r.weight} kg` : '—'}</td>
                            <td className='px-4 py-2' style={{ color: 'var(--txt-primary)' }}>{r.temperature ? `${r.temperature}°F` : '—'}</td>
                            <td className='px-4 py-2'>
                              <button
                                onClick={() => handleDelete(r._id)}
                                disabled={deleting === r._id}
                                className='text-red-400 hover:text-red-600 transition-colors disabled:opacity-40'
                                title='Delete record'
                              >
                                <FaTrash size={11} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: log form */}
        <div className='rounded-xl border p-4' style={{ borderColor: 'var(--border)' }}>
          <div className='flex items-center gap-2 mb-3'>
            <FaPlusCircle size={12} className='text-teal-600' />
            <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600'>Log Vitals</p>
          </div>
          <h3 className='text-sm font-bold mb-4' style={{ color: 'var(--txt-primary)' }}>
            Today's Measurements
          </h3>

          <form onSubmit={handleSubmit} className='space-y-3'>
            {[
              { key: 'date',          label: 'Date',              type: 'date',   placeholder: '' },
              { key: 'bloodPressure', label: 'Blood Pressure',    type: 'text',   placeholder: '120/80' },
              { key: 'heartRate',     label: 'Heart Rate (bpm)',  type: 'number', placeholder: '72' },
              { key: 'sugarLevel',    label: 'Blood Sugar (mg/dL)',type: 'number',placeholder: '110' },
              { key: 'weight',        label: 'Weight (kg)',        type: 'number', placeholder: '72' },
              { key: 'temperature',   label: 'Temperature (°F)',   type: 'number', placeholder: '98.6' },
            ].map(field => (
              <div key={field.key}>
                <label className='block text-[10px] font-semibold mb-1' style={{ color: 'var(--txt-muted)' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  step={field.type === 'number' ? '0.1' : undefined}
                  className='w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors'
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--bg-page)',
                    color: 'var(--txt-primary)'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0d9488'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

            <button
              type='submit'
              disabled={submitting}
              className='w-full rounded-xl py-2.5 text-xs font-bold text-white transition-all disabled:opacity-60'
              style={{ background: 'linear-gradient(105deg, #0f766e 0%, #0d9488 100%)' }}
            >
              {submitting ? 'Saving…' : '💾 Save Vitals'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default VitalsTracker
