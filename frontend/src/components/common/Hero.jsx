import { useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaCalendarPlus, FaArrowRight, FaShieldAlt,
  FaUserMd, FaHeartbeat, FaAmbulance, FaCheckCircle
} from 'react-icons/fa'
import { AuthContext } from '../../context/AuthContext'

const stats = [
  { num: '50,000+', label: 'Patients Treated' },
  { num: '250+',    label: 'Specialist Doctors' },
  { num: '40+',     label: 'Specialities' },
  { num: '24/7',    label: 'Emergency Care' },
]

const features = [
  { icon: FaShieldAlt,  text: 'HIPAA-Compliant Records' },
  { icon: FaUserMd,     text: '250+ Verified Specialists' },
  { icon: FaAmbulance,  text: '24/7 Emergency Response' },
]

const services = ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Gynecology']

function Hero() {
  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

  return (
    <section className='relative min-h-[88vh] flex items-center overflow-hidden'>
      {/* BG image */}
      <img
        src='https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2070'
        className='absolute inset-0 w-full h-full object-cover'
        alt='Hospital corridor'
      />
      <div className='absolute inset-0 hero-overlay' />

      <div className='relative w-full max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-16 items-center'>

        {/* ── Left ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Accreditation tag */}
          <div className='inline-flex items-center gap-2 bg-teal-700/25 border border-teal-500/40 rounded-full px-4 py-1.5 mb-6'>
            <FaCheckCircle size={11} className='text-teal-400' />
            <span className='text-teal-300 text-xs font-semibold'>NABH Accredited Hospital</span>
          </div>

          <h1 className='text-4xl md:text-5xl font-extrabold text-white leading-tight'>
            Advanced Care<br />
            <span className='text-teal-400'>You Can Trust</span>
          </h1>

          <p className='mt-5 text-sm text-slate-300 leading-relaxed max-w-lg'>
            MediCare+ brings together world-class specialists, cutting-edge technology, and compassionate care — all in one trusted platform.
          </p>

          {/* Feature chips */}
          <div className='mt-6 flex flex-wrap gap-2'>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className='flex items-center gap-1.5 glass rounded-full px-3.5 py-1.5 text-xs text-white'>
                <Icon size={11} className='text-teal-400' />
                {text}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className='mt-8 flex flex-wrap gap-3'>
            <button
              onClick={() => isAuthenticated ? navigate('/appointments') : navigate('/register')}
              className='flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg transition hover:-translate-y-0.5'
            >
              <FaCalendarPlus size={13} />
              {isAuthenticated ? 'My Appointments' : 'Book Appointment'}
            </button>
            <Link
              to='/doctors'
              className='flex items-center gap-2 glass text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/20 transition'
            >
              Find a Doctor <FaArrowRight size={11} />
            </Link>
          </div>

          {/* Stats row */}
          <div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-6'>
            {stats.map(({ num, label }) => (
              <div key={label}>
                <p className='text-2xl font-extrabold text-white'>{num}</p>
                <p className='text-xs text-slate-400 mt-0.5'>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Right panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className='hidden md:block'
        >
          {/* Info card */}
          <div
            className='rounded-2xl overflow-hidden shadow-2xl'
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(20px)' }}
          >
            {/* Card header */}
            <div className='bg-teal-700/80 px-6 py-4'>
              <p className='text-xs text-teal-200 font-semibold uppercase tracking-wider'>Our Specialities</p>
            </div>
            {/* Doctor image */}
            <div className='relative'>
              <img
                src='https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1974'
                className='w-full object-cover'
                style={{ maxHeight: 260 }}
                alt='Doctor'
              />
            </div>
            {/* Speciality grid */}
            <div className='px-5 py-4 grid grid-cols-3 gap-2'>
              {services.map(s => (
                <div key={s} className='rounded-lg text-center px-2 py-2 text-[10px] font-semibold text-teal-300' style={{ background: 'rgba(13,148,136,0.18)' }}>
                  {s}
                </div>
              ))}
            </div>
            {/* Status pill */}
            <div className='px-5 pb-5'>
              <div className='flex items-center gap-2 rounded-lg bg-emerald-900/40 border border-emerald-700/40 px-3 py-2'>
                <span className='h-2 w-2 rounded-full bg-green-400 flex-shrink-0 animate-pulse' />
                <FaHeartbeat size={11} className='text-green-400' />
                <span className='text-xs text-green-300 font-semibold'>All systems operational — Open 24/7</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero