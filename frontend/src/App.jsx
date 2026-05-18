import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Unauthorized from './pages/Unauthorized'
import Doctors from './components/doctor/Doctors'
import PatientList from './components/patient/PatientList'
import Appointments from './components/appointment/Appointments'
import Prescription from './components/prescription/Prescription'
import DoctorProfile from './components/doctor/DoctorProfile'
import InfoPage from './pages/InfoPage'
import SymptomChecker from './components/patient/SymptomChecker'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — with Header + Footer */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path='login'        element={<Login />} />
          <Route path='register'     element={<Register />} />
          <Route path='unauthorized' element={<Unauthorized />} />
          <Route path='doctors'      element={<Doctors />} />
          <Route path='doctor/:id'   element={<DoctorProfile />} />
          <Route path='info/:category/:slug' element={<InfoPage />} />
        </Route>

        {/* Protected routes — with Sidebar dashboard layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path='dashboard'    element={<Dashboard />} />
            <Route
              path='patients'
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <PatientList />
                </ProtectedRoute>
              }
            />
            <Route path='appointments' element={<Appointments />} />
            <Route
              path='prescriptions'
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                  <Prescription />
                </ProtectedRoute>
              }
            />
            <Route path='profile' element={<Profile />} />
            <Route
              path='symptom-checker'
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <SymptomChecker />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path='*' element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App