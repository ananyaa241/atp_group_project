import { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaUserMd, FaCalendarCheck, FaPrescriptionBottleAlt,
  FaUsers, FaTachometerAlt, FaUserCircle, FaSignOutAlt,
  FaPhone, FaHospital, FaBrain
} from 'react-icons/fa'
import { AuthContext } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
          isActive
            ? 'bg-teal-700 text-white shadow-sm'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon size={13} className='flex-shrink-0' />
      {label}
    </NavLink>
  )
}

function Sidebar() {
  const { user, role, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside
      className='w-56 min-h-screen hidden md:flex flex-col flex-shrink-0 border-r'
      style={{
        background: 'linear-gradient(180deg, #0f1f1e 0%, #0a1512 100%)',
        borderColor: '#1a3330'
      }}
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div className='px-5 py-5 border-b' style={{ borderColor: '#1a3330' }}>
        <div className='flex items-center gap-2.5'>
          <div className='h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center flex-shrink-0'>
            <FaHospital size={13} className='text-white' />
          </div>
          <div>
            <p className='text-sm font-extrabold leading-tight'>
              <span className='text-teal-400'>Medi</span>
              <span className='text-white'>Care</span>
              <span className='text-red-400'>+</span>
            </p>
            <p className='text-[9px] text-slate-500 uppercase tracking-[0.2em]'>Hospital System</p>
          </div>
        </div>
      </div>

      {/* ── User card ─────────────────────────────────────────────────────── */}
      <div className='px-4 py-3.5 border-b' style={{ borderColor: '#1a3330' }}>
        <div className='flex items-center gap-2.5'>
          <div className='h-8 w-8 rounded-full bg-teal-700/30 border border-teal-600/40 flex items-center justify-center text-teal-400 font-bold text-sm flex-shrink-0'>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className='min-w-0'>
            <p className='text-xs font-semibold text-white truncate'>{user?.name || 'User'}</p>
            <p className='text-[10px] text-teal-400/80 capitalize'>{role || 'guest'}</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className='flex-1 px-3 py-4 space-y-0.5'>
        <p className='text-[9px] uppercase tracking-[0.2em] text-slate-600 font-semibold px-2 mb-2'>Main Menu</p>
        <NavItem to='/dashboard'     icon={FaTachometerAlt}           label='Dashboard' />
        {role !== 'doctor' && (
          <NavItem to='/doctors'       icon={FaUserMd}                  label='Our Doctors' />
        )}
        {(role === 'admin' || role === 'doctor') && (
          <NavItem to='/patients'    icon={FaUsers}                   label='Patients' />
        )}
        <NavItem to='/appointments'  icon={FaCalendarCheck}           label='Appointments' />
        {(role === 'admin' || role === 'doctor' || role === 'patient') && (
          <NavItem to='/prescriptions' icon={FaPrescriptionBottleAlt} label='Prescriptions' />
        )}
        {role === 'patient' && (
          <NavItem to='/symptom-checker' icon={FaBrain}               label='Symptom Checker' />
        )}
        <NavItem to='/profile'       icon={FaUserCircle}              label='My Profile' />
      </nav>

      {/* ── Emergency ─────────────────────────────────────────────────────── */}
      <div className='px-3 pb-3'>
        <div className='rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2.5'>
          <div className='flex items-center gap-2 mb-1'>
            <FaPhone size={9} className='text-red-400' />
            <p className='text-[10px] font-bold text-red-400'>Emergency</p>
          </div>
          <p className='text-xs font-black text-white'>108</p>
          <p className='text-[9px] text-red-300/70'>Ambulance • 24/7</p>
        </div>
      </div>

      {/* ── Sign out ──────────────────────────────────────────────────────── */}
      <div className='px-3 pb-5'>
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-red-900/30 hover:text-red-300 transition-colors'
        >
          <FaSignOutAlt size={12} /> Sign Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar