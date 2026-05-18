import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  FaSearch, FaUserMd, FaStar, FaGraduationCap,
  FaHeartbeat, FaBrain, FaBone, FaEye, FaTooth, FaLungs,
  FaChild, FaFemale, FaAllergies, FaCut, FaFlask, FaStethoscope, FaTrash
} from 'react-icons/fa'
import { MdOutlineAttachMoney } from 'react-icons/md'
import axiosInstance from '../../api/axiosInstance'
import SkeletonCard from '../common/SkeletonCard'
import EmptyState from '../common/EmptyState'

// ── Specialty → icon + accent mapping ────────────────────────────────────────
function getSpecialtyMeta(specialization = '') {
  const s = specialization.toLowerCase()
  if (s.includes('cardio') || s.includes('heart'))
    return { Icon: FaHeartbeat, color: '#dc2626', bg: 'rgba(220,38,38,0.08)' }
  if (s.includes('neuro') || s.includes('brain'))
    return { Icon: FaBrain, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' }
  if (s.includes('ortho') || s.includes('bone') || s.includes('spine'))
    return { Icon: FaBone, color: '#d97706', bg: 'rgba(217,119,6,0.08)' }
  if (s.includes('ophthal') || s.includes('eye') || s.includes('vision'))
    return { Icon: FaEye, color: '#0369a1', bg: 'rgba(3,105,161,0.08)' }
  if (s.includes('dental') || s.includes('tooth') || s.includes('oral'))
    return { Icon: FaTooth, color: '#475569', bg: 'rgba(71,85,105,0.08)' }
  if (s.includes('pulmo') || s.includes('lung') || s.includes('respir'))
    return { Icon: FaLungs, color: '#0891b2', bg: 'rgba(8,145,178,0.08)' }
  if (s.includes('pedia') || s.includes('child'))
    return { Icon: FaChild, color: '#ea580c', bg: 'rgba(234,88,12,0.08)' }
  if (s.includes('gynae') || s.includes('obste') || s.includes('women'))
    return { Icon: FaFemale, color: '#db2777', bg: 'rgba(219,39,119,0.08)' }
  if (s.includes('derma') || s.includes('skin'))
    return { Icon: FaAllergies, color: '#65a30d', bg: 'rgba(101,163,13,0.08)' }
  if (s.includes('surg'))
    return { Icon: FaCut, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' }
  if (s.includes('pathol') || s.includes('lab'))
    return { Icon: FaFlask, color: '#059669', bg: 'rgba(5,150,105,0.08)' }
  return { Icon: FaStethoscope, color: '#0d9488', bg: 'rgba(13,148,136,0.08)' }
}

function getSampleFee(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fee = 2000 + (Math.abs(hash) % 3001); 
  return Math.round(fee / 100) * 100;
}

function Doctors() {
  const { role } = useContext(AuthContext)
  const [doctors, setDoctors]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  async function handleDelete(id) {
    if (!window.confirm('Remove this doctor?')) return
    try {
      await axiosInstance.delete(`/doctor-api/delete-doctor/${id}`)
      toast.success('Doctor removed')
      fetchDoctors(searchQuery)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  async function fetchDoctors(query = '') {
    try {
      setLoading(true)
      const url = query.trim()
        ? `/doctor-api/search/${encodeURIComponent(query.trim())}`
        : '/doctor-api/doctors'
      const res = await axiosInstance.get(url)
      setDoctors(res.data.payload || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDoctors() }, [])
  useEffect(() => {
    const t = setTimeout(() => fetchDoctors(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  return (
    <section className='py-16' style={{ background: 'var(--bg-page)' }}>
      <div className='max-w-7xl mx-auto px-8'>

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-[10px] uppercase tracking-widest font-bold text-teal-600 dark:text-teal-400'>
              Our Specialists
            </p>
            <h2 className='mt-1 text-xl font-bold' style={{ color: 'var(--txt-primary)' }}>
              Meet Our Doctors
            </h2>
            <p className='mt-0.5 text-xs' style={{ color: 'var(--txt-muted)' }}>
              Experienced specialists committed to your wellbeing.
            </p>
          </div>

          {/* Search */}
          <div className='relative w-full max-w-xs'>
            <FaSearch size={12} className='absolute left-3.5 top-1/2 -translate-y-1/2' style={{ color: 'var(--txt-muted)' }} />
            <input
              type='text'
              placeholder='Search by name or specialization...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-9 pr-4 py-2 rounded-lg border text-xs outline-none transition'
              style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--txt-primary)' }}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* ── Grid ───────────────────────────────────────────────────────── */}
        {loading ? (
          <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} className='h-64' />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState icon={FaUserMd} title='No doctors found' message='Try a different name or specialization.' />
        ) : (
          <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {doctors.map((doc, i) => {
              const { Icon, color, bg } = getSpecialtyMeta(doc.specialization)
              return (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className='rounded-xl overflow-hidden transition-shadow hover:shadow-md relative'
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* Avatar strip */}
                  <div
                    className='h-28 flex items-center justify-center'
                    style={{ background: 'linear-gradient(135deg, #0f2a28 0%, #134e4a 100%)' }}
                  >
                    <div
                      className='h-16 w-16 rounded-xl flex items-center justify-center'
                      style={{ background: bg, border: `1.5px solid ${color}40` }}
                    >
                      <Icon size={28} style={{ color }} />
                    </div>
                  </div>

                  {role === 'admin' && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className='absolute right-3 top-3 h-7 w-7 rounded-lg border flex items-center justify-center transition-colors'
                      style={{ borderColor: 'rgba(220,38,38,0.3)', color: '#dc2626', background: 'rgba(220,38,38,0.9)', zIndex: 10 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.9)'}
                      title="Delete Doctor"
                    >
                      <FaTrash size={10} style={{ color: 'white' }} />
                    </button>
                  )}

                  {/* Info */}
                  <div className='p-4'>
                    <h3 className='text-xs font-bold truncate' style={{ color: 'var(--txt-primary)' }}>
                      Dr. {doc.name}
                    </h3>
                    <p className='text-[10px] font-semibold mt-0.5 truncate' style={{ color }}>
                      {doc.specialization}
                    </p>

                    <div className='mt-3 space-y-1.5'>
                      {doc.experience > 0 && (
                        <div className='flex items-center gap-1.5'>
                          <FaStar size={10} style={{ color: '#f59e0b', flexShrink: 0 }} />
                          <span className='text-[10px]' style={{ color: 'var(--txt-muted)' }}>
                            {doc.experience} yrs experience
                          </span>
                        </div>
                      )}
                      {doc.qualification && (
                        <div className='flex items-center gap-1.5'>
                          <FaGraduationCap size={10} style={{ color: '#0d9488', flexShrink: 0 }} />
                          <span className='text-[10px] truncate' style={{ color: 'var(--txt-muted)' }}>
                            {doc.qualification}
                          </span>
                        </div>
                      )}
                      
                      <div className='flex items-center gap-1.5'>
                        <MdOutlineAttachMoney size={11} style={{ color: '#16a34a', flexShrink: 0 }} />
                        <span className='text-[10px]' style={{ color: 'var(--txt-muted)' }}>
                          ₹{doc.consultationFee > 0 ? doc.consultationFee : getSampleFee(doc._id)} consultation
                        </span>
                      </div>
                    </div>

                    {/* Specialty badge */}
                    <div className='mt-3'>
                      <span
                        className='inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold'
                        style={{ background: bg, color }}
                      >
                        <Icon size={9} />
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default Doctors