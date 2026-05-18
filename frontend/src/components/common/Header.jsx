import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaMoon, FaSun, FaUserCircle, FaPhone, FaChevronDown, FaStethoscope } from 'react-icons/fa'
import { AuthContext } from '../../context/AuthContext'
import axiosInstance from '../../api/axiosInstance'

function getDiseases(specialization = '') {
  const s = specialization.toLowerCase()
  if (s.includes('cardio') || s.includes('heart')) return 'Heart Attacks, Arrhythmia, Hypertension, Heart Failure'
  if (s.includes('neuro') || s.includes('brain')) return 'Stroke, Epilepsy, Migraines, Neuropathy, Alzheimer\'s'
  if (s.includes('ortho') || s.includes('bone') || s.includes('spine')) return 'Fractures, Arthritis, Back Pain, Osteoporosis'
  if (s.includes('ophthal') || s.includes('eye')) return 'Cataracts, Glaucoma, Vision Loss, Retinal Detachment'
  if (s.includes('dental') || s.includes('tooth')) return 'Cavities, Gum Disease, Root Canals, Tooth Decay'
  if (s.includes('pulmo') || s.includes('lung')) return 'Asthma, COPD, Pneumonia, Bronchitis, Sleep Apnea'
  if (s.includes('pedia') || s.includes('child')) return 'Childhood Illnesses, Vaccinations, Growth Disorders'
  if (s.includes('gynae') || s.includes('women')) return 'Pregnancy, Menstrual Disorders, PCOS, Endometriosis'
  if (s.includes('derma') || s.includes('skin')) return 'Acne, Eczema, Psoriasis, Skin Cancer, Dermatitis'
  if (s.includes('pathol') || s.includes('lab')) return 'Diagnostic Testing, Blood Disorders, Anemia'
  if (s.includes('surg')) return 'General Surgery, Appendicitis, Hernias, Gallbladder Issues'
  return 'General Illnesses, Fever, Infections, Chronic Disease Management'
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const [theme, setTheme]         = useState(() => localStorage.getItem('theme') || 'light')
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [doctors, setDoctors] = useState([])
  const [showDoctorsDropdown, setShowDoctorsDropdown] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // Fetch doctors for the dropdown
    axiosInstance.get('/doctor-api/doctors')
      .then(res => setDoctors(res.data.payload || []))
      .catch(err => console.error('Failed to load doctors for navbar:', err))
  }, [])

  const isDark = theme === 'dark'

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? 'shadow-md' : ''
      }`}
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
    >
      {/* ── Top emergency bar ───────────────────────────────────────────────── */}
      <div className='hidden md:block bg-teal-700 text-white text-center py-1.5 text-xs font-medium tracking-wide'>
        <FaPhone className='inline mr-1.5 text-teal-200' size={10} />
        Emergency: <strong className='text-white'>108</strong>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        Helpline: <strong className='text-white'>040-68334470</strong>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        Open 24/7 — MediCare+ Hospital, Hyderabad
      </div>

      {/* ── Main nav ────────────────────────────────────────────────────────── */}
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>

        {/* Brand */}
        <Link to='/' className='flex items-center gap-3'>
          <div className='h-9 w-9 rounded-lg bg-teal-700 flex items-center justify-center shadow-sm flex-shrink-0'>
            <span className='text-white font-black text-base'>M</span>
          </div>
          <div>
            <p className='text-sm font-extrabold text-teal-700 dark:text-teal-400 leading-tight tracking-tight'>
              MediCare<span className='text-red-500'>+</span>
            </p>
            <p className='text-[9px] uppercase tracking-[0.22em] font-medium' style={{ color: 'var(--txt-muted)' }}>
              Multi-Specialty Hospital
            </p>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className='hidden md:flex items-center gap-6'>
          <Link to='/' className='text-xs font-semibold transition-colors duration-150' style={{ color: 'var(--txt-secondary)' }} onMouseEnter={e => e.target.style.color = '#0d9488'} onMouseLeave={e => e.target.style.color = 'var(--txt-secondary)'}>
            Home
          </Link>

          {/* Doctors Dropdown */}
          <div 
            className='relative' 
            onMouseEnter={() => setShowDoctorsDropdown(true)} 
            onMouseLeave={() => setShowDoctorsDropdown(false)}
          >
            <Link to='/doctors' className='flex items-center gap-1 text-xs font-semibold transition-colors duration-150' style={{ color: 'var(--txt-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = '#0d9488'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-secondary)'}>
              Doctors <FaChevronDown size={9} className='mt-0.5' />
            </Link>

            {showDoctorsDropdown && doctors.length > 0 && (
              <div className='absolute top-full left-0 pt-4 w-[400px] z-50'>
                <div 
                  className='rounded-xl shadow-xl overflow-hidden' 
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className='bg-teal-700 px-4 py-2.5'>
                    <p className='text-[10px] uppercase font-bold text-teal-100 tracking-wider'>Our Specialists</p>
                  </div>
                  <div className='max-h-[380px] overflow-y-auto divide-y' style={{ borderColor: 'var(--border)' }}>
                    {doctors.map(doc => (
                      <Link 
                        key={doc._id}
                        to={`/doctor/${doc._id}`}
                        className='block px-4 py-3.5 transition-colors'
                        style={{ background: 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className='flex items-start gap-3'>
                          <div className='h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5' style={{ background: 'rgba(13,148,136,0.12)' }}>
                            <FaStethoscope size={14} style={{ color: '#0d9488' }} />
                          </div>
                          <div>
                            <p className='text-xs font-bold' style={{ color: 'var(--txt-primary)' }}>Dr. {doc.name}</p>
                            <p className='text-[10px] font-bold mt-0.5' style={{ color: '#0d9488' }}>
                              {doc.specialization}
                            </p>
                            <p className='text-[10px] mt-1.5 leading-relaxed' style={{ color: 'var(--txt-muted)' }}>
                              <span className='font-semibold' style={{ color: 'var(--txt-secondary)' }}>Treats:</span> {getDiseases(doc.specialization)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className='p-2.5 text-center border-t' style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                    <Link to='/doctors' className='text-[10.5px] font-bold hover:underline' style={{ color: '#0d9488' }}>
                      View All Doctors Directory →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to='/appointments' className='text-xs font-semibold transition-colors duration-150' style={{ color: 'var(--txt-secondary)' }} onMouseEnter={e => e.target.style.color = '#0d9488'} onMouseLeave={e => e.target.style.color = 'var(--txt-secondary)'}>
            Appointments
          </Link>
        </nav>

        {/* Actions */}
        <div className='hidden md:flex items-center gap-2.5'>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className='flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors'
                style={{ borderColor: 'var(--border)', color: 'var(--txt-secondary)', background: 'transparent' }}
              >
                <FaUserCircle size={12} />
                {user?.name?.split(' ')[0] || 'Profile'}
              </button>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className='rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors'
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className='rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors'
                style={{ borderColor: 'var(--border)', color: 'var(--txt-secondary)', background: 'transparent' }}
              >
                Login
              </Link>
              <Link
                to='/register'
                className='rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 transition-colors shadow-sm'
              >
                Book Appointment
              </Link>
            </>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className='h-8 w-8 rounded-lg flex items-center justify-center transition-colors'
            style={{ border: '1px solid var(--border)', color: 'var(--txt-secondary)' }}
          >
            {isDark ? <FaSun size={12} /> : <FaMoon size={12} />}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className='md:hidden p-2 rounded-lg transition-colors'
          style={{ color: 'var(--txt-secondary)' }}
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className='md:hidden px-5 pb-4 pt-2 space-y-1 border-t'
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
        >
          <Link to='/' className='block rounded-lg px-3 py-2 text-xs font-semibold transition-colors' style={{ color: 'var(--txt-secondary)' }} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to='/doctors' className='block rounded-lg px-3 py-2 text-xs font-semibold transition-colors' style={{ color: 'var(--txt-secondary)' }} onClick={() => setMenuOpen(false)}>Doctors</Link>
          <Link to='/appointments' className='block rounded-lg px-3 py-2 text-xs font-semibold transition-colors' style={{ color: 'var(--txt-secondary)' }} onClick={() => setMenuOpen(false)}>Appointments</Link>
          
          <div className='pt-2 space-y-1'>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/profile') }}
                  className='w-full text-left rounded-lg border px-3 py-2 text-xs font-semibold'
                  style={{ borderColor: 'var(--border)', color: 'var(--txt-secondary)' }}
                >Profile</button>
                <button
                  onClick={() => { setMenuOpen(false); logout(); navigate('/login') }}
                  className='w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700'
                >Sign Out</button>
              </>
            ) : (
              <>
                <Link to='/login' onClick={() => setMenuOpen(false)}
                  className='block rounded-lg border px-3 py-2 text-xs font-semibold'
                  style={{ borderColor: 'var(--border)', color: 'var(--txt-secondary)' }}
                >Login</Link>
                <Link to='/register' onClick={() => setMenuOpen(false)}
                  className='block rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800'
                >Register</Link>
              </>
            )}
            <button
              onClick={() => { setTheme(isDark ? 'light' : 'dark'); setMenuOpen(false) }}
              className='w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold'
              style={{ borderColor: 'var(--border)', color: 'var(--txt-secondary)' }}
            >
              {isDark ? <FaSun size={11} /> : <FaMoon size={11} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header