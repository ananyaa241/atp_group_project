import { useEffect, useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FaSearch, FaUsers, FaTrash, FaHeartbeat } from 'react-icons/fa'
import axiosInstance from '../../api/axiosInstance'
import { AuthContext } from '../../context/AuthContext'
import SkeletonCard from '../common/SkeletonCard'
import EmptyState from '../common/EmptyState'

function PatientList() {
  const { role, user } = useContext(AuthContext)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchPatients(query = '') {
    try {
      setLoading(true)
      if (role === 'doctor' && user?._id) {
        const res = await axiosInstance.get(`/appointment-api/doctor/${user._id}`)
        const appts = res.data.payload || []
        const patientMap = new Map()
        appts.forEach(a => {
          if (a.patientId && a.patientId._id) {
            patientMap.set(a.patientId._id, a.patientId)
          }
        })
        let list = Array.from(patientMap.values())
        if (query.trim()) {
          const q = query.toLowerCase()
          list = list.filter(p => p.name?.toLowerCase().includes(q))
        }
        setPatients(list)
      } else {
        const url = query.trim()
          ? `/patient-api/search/${encodeURIComponent(query.trim())}`
          : '/patient-api/patients'
        const res = await axiosInstance.get(url)
        setPatients(res.data.payload || [])
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPatients() }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(searchQuery), 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  async function handleDelete(id) {
    if (!window.confirm('Remove this patient?')) return
    try {
      await axiosInstance.delete(`/patient-api/delete-patient/${id}`)
      toast.success('Patient removed')
      fetchPatients(searchQuery)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b' style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className='text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-400'>Registry</p>
          <h1 className='mt-1 text-xl font-bold' style={{ color: 'var(--txt-primary)' }}>Patients</h1>
        </div>

        {/* Search */}
        <div className='relative w-full max-w-xs'>
          <FaSearch size={12} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
          <input
            type='text'
            placeholder='Search by name...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full pl-9 pr-4 py-2 rounded-lg border text-xs outline-none transition'
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--txt-primary)' }}
            onFocus={e => e.target.style.borderColor = '#0d9488'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className='grid md:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className='h-52' />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState icon={FaUsers} title='No patients found' message='Try a different search term.' />
      ) : (
        <div className='grid md:grid-cols-3 gap-4'>
          <AnimatePresence>
            {patients.map((patient, i) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className='relative rounded-xl overflow-hidden transition-shadow hover:shadow-md'
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {/* Avatar strip */}
                <div
                  className='h-16 flex items-center gap-3 px-5'
                  style={{ background: 'linear-gradient(135deg, #0f2a28 0%, #134e4a 100%)' }}
                >
                  <div
                    className='h-10 w-10 rounded-xl flex items-center justify-center text-base font-bold text-teal-400 flex-shrink-0'
                    style={{ background: 'rgba(13,148,136,0.2)', border: '1.5px solid rgba(13,148,136,0.35)' }}
                  >
                    {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div className='min-w-0'>
                    <h2 className='text-xs font-bold text-white truncate'>{patient.name}</h2>
                    <p className='text-[10px] text-teal-300 truncate'>{patient.email}</p>
                  </div>
                </div>

                {/* Details */}
                <div className='p-4 grid grid-cols-2 gap-2'>
                  {patient.age && (
                    <div className='rounded-lg px-3 py-2' style={{ background: 'var(--bg-subtle)' }}>
                      <p className='text-[10px] font-semibold uppercase tracking-wide' style={{ color: 'var(--txt-muted)' }}>Age</p>
                      <p className='text-xs font-bold mt-0.5' style={{ color: 'var(--txt-primary)' }}>{patient.age} yrs</p>
                    </div>
                  )}
                  {patient.gender && (
                    <div className='rounded-lg px-3 py-2' style={{ background: 'var(--bg-subtle)' }}>
                      <p className='text-[10px] font-semibold uppercase tracking-wide' style={{ color: 'var(--txt-muted)' }}>Gender</p>
                      <p className='text-xs font-bold mt-0.5 capitalize' style={{ color: 'var(--txt-primary)' }}>{patient.gender}</p>
                    </div>
                  )}
                  {patient.bloodGroup && (
                    <div className='rounded-lg px-3 py-2' style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.15)' }}>
                      <p className='text-[10px] font-semibold uppercase tracking-wide' style={{ color: '#ef4444' }}>Blood</p>
                      <p className='text-xs font-bold mt-0.5' style={{ color: '#dc2626' }}>{patient.bloodGroup}</p>
                    </div>
                  )}
                  {patient.phone && (
                    <div className='rounded-lg px-3 py-2' style={{ background: 'var(--bg-subtle)' }}>
                      <p className='text-[10px] font-semibold uppercase tracking-wide' style={{ color: 'var(--txt-muted)' }}>Phone</p>
                      <p className='text-xs font-bold mt-0.5' style={{ color: 'var(--txt-primary)' }}>{patient.phone}</p>
                    </div>
                  )}
                </div>

                {role === 'admin' && (
                  <button
                    onClick={() => handleDelete(patient._id)}
                    className='absolute right-4 top-4 h-7 w-7 rounded-lg border flex items-center justify-center transition-colors'
                    style={{ borderColor: 'rgba(220,38,38,0.3)', color: '#dc2626', background: 'rgba(220,38,38,0.08)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                  >
                    <FaTrash size={10} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && patients.length > 0 && (
        <p className='mt-4 text-xs' style={{ color: 'var(--txt-muted)' }}>
          Showing <strong style={{ color: 'var(--txt-secondary)' }}>{patients.length}</strong> patients
        </p>
      )}
    </motion.div>
  )
}

export default PatientList