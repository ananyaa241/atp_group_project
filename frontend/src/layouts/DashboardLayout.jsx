import { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import {
  FaBars, FaTimes, FaTachometerAlt, FaUserMd,
  FaUsers, FaCalendarCheck, FaPrescriptionBottleAlt,
  FaUserCircle, FaSignOutAlt
} from 'react-icons/fa'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Sidebar from '../components/common/Sidebar'
import { toast } from 'react-hot-toast'

function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { role, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className='flex flex-col md:flex-row min-h-screen' style={{ background: 'var(--bg-page)' }}>
      {/* ── Mobile Dashboard Header ── */}
      <header
        className='md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40'
        style={{ background: '#0f1f1e', borderColor: '#1a3330' }}
      >
        <Link to='/dashboard' className='flex items-center gap-2'>
          <img
            src='/favicon.png'
            alt='MediCare+ Logo'
            className='h-7 w-7 rounded-lg object-contain bg-white/95 p-0.5 shadow-sm'
          />
          <span className='text-sm font-extrabold text-white'>
            Medi<span className='text-teal-400'>Care</span><span className='text-red-400'>+</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileNavOpen(v => !v)}
          className='p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10'
          aria-label='Toggle Dashboard Navigation'
        >
          {mobileNavOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </header>

      {/* ── Mobile Nav Dropdown ── */}
      {mobileNavOpen && (
        <div
          className='md:hidden border-b px-4 py-3 space-y-1 z-30'
          style={{ background: '#0c1817', borderColor: '#1a3330' }}
        >
          <div className='pb-2 mb-2 border-b border-teal-900/40 text-xs text-slate-300'>
            Signed in as <strong className='text-teal-300'>{user?.name || 'User'}</strong> ({role || 'guest'})
          </div>
          <NavLink
            to='/dashboard'
            onClick={() => setMobileNavOpen(false)}
            className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10'
          >
            <FaTachometerAlt size={12} className='text-teal-400' /> Dashboard
          </NavLink>
          {role !== 'doctor' && (
            <NavLink
              to='/doctors'
              onClick={() => setMobileNavOpen(false)}
              className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10'
            >
              <FaUserMd size={12} className='text-teal-400' /> Our Doctors
            </NavLink>
          )}
          {(role === 'admin' || role === 'doctor') && (
            <NavLink
              to='/patients'
              onClick={() => setMobileNavOpen(false)}
              className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10'
            >
              <FaUsers size={12} className='text-teal-400' /> Patients
            </NavLink>
          )}
          <NavLink
            to='/appointments'
            onClick={() => setMobileNavOpen(false)}
            className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10'
          >
            <FaCalendarCheck size={12} className='text-teal-400' /> Appointments
          </NavLink>
          {(role === 'admin' || role === 'doctor' || role === 'patient') && (
            <NavLink
              to='/prescriptions'
              onClick={() => setMobileNavOpen(false)}
              className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10'
            >
              <FaPrescriptionBottleAlt size={12} className='text-teal-400' /> Prescriptions
            </NavLink>
          )}
          <NavLink
            to='/profile'
            onClick={() => setMobileNavOpen(false)}
            className='flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10'
          >
            <FaUserCircle size={12} className='text-teal-400' /> My Profile
          </NavLink>
          <button
            onClick={() => { setMobileNavOpen(false); handleLogout() }}
            className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/40 text-left'
          >
            <FaSignOutAlt size={12} /> Sign Out
          </button>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <Sidebar />

      {/* ── Main Content Area ── */}
      <main className='flex-1 min-w-0 overflow-y-auto overflow-x-hidden'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout