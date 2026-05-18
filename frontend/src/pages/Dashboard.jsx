import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import AdminDashboard from '../components/admin/AdminDashboard'
import DoctorDashboard from '../components/doctor/DoctorDashboard'
import PatientDashboard from '../components/patient/PatientDashboard'

function Dashboard() {
  const { role } = useContext(AuthContext)

  if (role === 'admin')   return <AdminDashboard />
  if (role === 'doctor')  return <DoctorDashboard />
  if (role === 'patient') return <PatientDashboard />

  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <p className='text-slate-500 dark:text-slate-400'>Unknown role. Please contact support.</p>
    </div>
  )
}

export default Dashboard