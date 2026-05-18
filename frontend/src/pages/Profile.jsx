import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FaUser, FaEnvelope, FaPhone, FaTint, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { AuthContext } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import { FaPrescriptionBottleAlt, FaCalendarCheck } from 'react-icons/fa'

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className='flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5  dark:bg-[var(--bg-subtle)]'>
      <div className='mt-0.5 text-teal-600'>
        <Icon />
      </div>
      <div>
        <p className='text-xs text-[color:var(--txt-muted)] uppercase tracking-wider font-semibold'>{label}</p>
        <p className='mt-1 font-semibold text-[color:var(--txt-primary)] '>{value || '—'}</p>
      </div>
    </div>
  )
}

function Profile() {
  const navigate = useNavigate()
  const { user, role, logout, login } = useContext(AuthContext)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loadingExtra, setLoadingExtra] = useState(true)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    qualification: user?.qualification || '',
    consultationFee: user?.consultationFee || '',
    age: user?.age || '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })

  useEffect(() => {
    if (!user?._id) { setLoadingExtra(false); return }

    async function loadExtra() {
      try {
        setLoadingExtra(true)
        if (role === 'patient') {
          const [apptRes, rxRes] = await Promise.all([
            axiosInstance.get(`/appointment-api/patient/${user._id}`),
            axiosInstance.get(`/prescription-api/patient/${user._id}`)
          ])
          setAppointments(apptRes.data.payload || [])
          setPrescriptions(rxRes.data.payload || [])
        } else if (role === 'doctor') {
          const apptRes = await axiosInstance.get(`/appointment-api/doctor/${user._id}`)
          setAppointments(apptRes.data.payload || [])
        }
      } catch (err) {
        // Non-critical — don't toast here
        console.warn('Could not load profile extras:', err.message)
      } finally {
        setLoadingExtra(false)
      }
    }
    loadExtra()
  }, [user, role])

  async function handleUpdate(e) {
    e.preventDefault()
    if (!user?._id) return toast.error('User ID not found')
    try {
      setLoading(true)
      const endpoint = role === 'doctor'
        ? `/doctor-api/update-doctor/${user._id}`
        : `/patient-api/update-patient/${user._id}`

      await axiosInstance.put(endpoint, formData)

      // Update local auth state so the sidebar name reflects changes
      const updatedUser = { ...user, ...formData }
      login({ token: localStorage.getItem('token'), role, user: updatedUser })

      toast.success('Profile updated successfully')
      setEditMode(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const STATUS_BADGE = {
    Pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Approved:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Completed: 'bg-teal-100 text-teal-800  dark:text-cyan-300',
    Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page header */}
      <div className='flex items-center justify-between gap-4 mb-6 pb-5 flex-wrap border-b' style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className='text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-400'>Account</p>
          <h1 className='mt-1 text-xl font-bold text-[color:var(--txt-primary)] '>My Profile</h1>
        </div>
        <div className='flex gap-3'>
          {editMode ? (
            <button
              onClick={() => setEditMode(false)}
              className='flex items-center gap-2 rounded-2xl border border-[var(--border)] px-5 py-3 text-[color:var(--txt-secondary)] hover:bg-slate-100 transition  '
            >
              <FaTimes /> Cancel
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className='flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700 transition shadow-lg'
            >
              <FaEdit /> Edit Profile
            </button>
          )}
          <button
            onClick={() => { logout(); navigate('/login') }}
            className='rounded-2xl border border-[var(--border)] px-5 py-3 text-[color:var(--txt-secondary)] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition  '
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className='grid lg:grid-cols-[1.4fr_1fr] gap-6'>
        {/* LEFT — Profile card */}
        <div className='space-y-6'>
          <div className='rounded-3xl bg-[var(--bg-card)] p-8 shadow-xl dark:bg-[var(--bg-card)]'>
            {/* Avatar */}
            <div className='flex items-center gap-5'>
              <div className='h-20 w-20 rounded-3xl bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-4xl font-black text-white shadow-lg'>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className='text-3xl font-black text-[color:var(--txt-primary)] '>{user?.name || 'User'}</h2>
                <p className='text-[color:var(--txt-muted)] dark:text-[color:var(--txt-muted)] mt-1 capitalize'>{role || 'visitor'}</p>
                {role === 'doctor' && user?.specialization && (
                  <p className='text-teal-600 font-semibold mt-0.5'>{user.specialization}</p>
                )}
              </div>
            </div>

            {/* View mode */}
            {!editMode && (
              <div className='mt-7 grid gap-3'>
                <InfoField icon={FaEnvelope} label='Email' value={user?.email} />
                {(role === 'patient') && (
                  <>
                    {user?.phone && <InfoField icon={FaPhone} label='Phone' value={user.phone} />}
                    {user?.bloodGroup && <InfoField icon={FaTint} label='Blood Group' value={user.bloodGroup} />}
                    {user?.age && <InfoField icon={FaUser} label='Age' value={`${user.age} years`} />}
                    {user?.gender && <InfoField icon={FaUser} label='Gender' value={user.gender} />}
                    {user?.address && <InfoField icon={FaMapMarkerAlt} label='Address' value={user.address} />}
                  </>
                )}
                {role === 'doctor' && (
                  <>
                    {user?.qualification && <InfoField icon={FaUser} label='Qualification' value={user.qualification} />}
                    {user?.experience && <InfoField icon={FaUser} label='Experience' value={`${user.experience} years`} />}
                    {user?.consultationFee && <InfoField icon={FaUser} label='Consultation Fee' value={`₹${user.consultationFee}`} />}
                  </>
                )}
              </div>
            )}

            {/* Edit form */}
            {editMode && (
              <form onSubmit={handleUpdate} className='mt-7 space-y-4'>
                <div className='grid md:grid-cols-2 gap-4'>
                  {[
                    { label: 'Full Name', field: 'name', type: 'text' },
                    { label: 'Email', field: 'email', type: 'email' },
                    ...(role === 'patient' ? [
                      { label: 'Phone', field: 'phone', type: 'tel' },
                      { label: 'Age', field: 'age', type: 'number' },
                      { label: 'Blood Group', field: 'bloodGroup', type: 'text' },
                      { label: 'Gender', field: 'gender', type: 'text' },
                    ] : [
                      { label: 'Specialization', field: 'specialization', type: 'text' },
                      { label: 'Experience (years)', field: 'experience', type: 'number' },
                      { label: 'Qualification', field: 'qualification', type: 'text' },
                      { label: 'Consultation Fee (₹)', field: 'consultationFee', type: 'number' },
                    ])
                  ].map(({ label, field, type }) => (
                    <label key={field} className='block'>
                      <span className='text-sm text-[color:var(--txt-muted)] dark:text-[color:var(--txt-muted)]'>{label}</span>
                      <input
                        type={type}
                        value={formData[field] || ''}
                        onChange={e => handleChange(field, e.target.value)}
                        className='mt-1.5 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-[color:var(--txt-primary)] outline-none focus:border-teal-600 transition  dark:bg-[var(--bg-card)] '
                      />
                    </label>
                  ))}
                  {role === 'patient' && (
                    <label className='block md:col-span-2'>
                      <span className='text-sm text-[color:var(--txt-muted)] dark:text-[color:var(--txt-muted)]'>Address</span>
                      <textarea
                        value={formData.address || ''}
                        onChange={e => handleChange('address', e.target.value)}
                        rows={2}
                        className='mt-1.5 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-[color:var(--txt-primary)] outline-none focus:border-teal-600 transition resize-none  dark:bg-[var(--bg-card)] '
                      />
                    </label>
                  )}
                </div>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 py-4 font-bold text-white hover:bg-teal-700 transition disabled:opacity-60'
                >
                  {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT — Appointments + Prescriptions */}
        <div className='space-y-6'>
          {/* My Appointments */}
          <div className='rounded-3xl bg-[var(--bg-card)] p-7 shadow-xl dark:bg-[var(--bg-card)]'>
            <h2 className='text-xl font-bold text-[color:var(--txt-primary)]  mb-5 flex items-center gap-2'>
              <FaCalendarCheck className='text-teal-600' /> My Appointments
            </h2>
            {loadingExtra ? (
              <div className='py-6 flex justify-center'>
                <div className='h-8 w-8 rounded-full border-4 border-teal-600 border-t-transparent animate-spin' />
              </div>
            ) : appointments.length === 0 ? (
              <EmptyState
                icon={FaCalendarCheck}
                title='No appointments yet'
                message='Your upcoming appointments will appear here.'
              />
            ) : (
              <div className='space-y-3 max-h-72 overflow-y-auto pr-1'>
                {appointments.slice(0, 6).map(a => (
                  <div key={a._id} className='flex items-center justify-between rounded-2xl bg-[var(--bg-subtle)] px-4 py-3 dark:bg-[var(--bg-subtle)]'>
                    <div>
                      <p className='font-semibold text-[color:var(--txt-primary)]  text-sm'>
                        {role === 'patient' ? `Dr. ${a.doctorId?.name || '—'}` : a.patientId?.name || '—'}
                      </p>
                      <p className='text-xs text-[color:var(--txt-muted)] mt-0.5'>
                        {new Date(a.appointmentDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Prescriptions (patient only) */}
          {role === 'patient' && (
            <div className='rounded-3xl bg-[var(--bg-card)] p-7 shadow-xl dark:bg-[var(--bg-card)]'>
              <h2 className='text-xl font-bold text-[color:var(--txt-primary)]  mb-5 flex items-center gap-2'>
                <FaPrescriptionBottleAlt className='text-teal-600' /> My Prescriptions
              </h2>
              {loadingExtra ? (
                <div className='py-6 flex justify-center'>
                  <div className='h-8 w-8 rounded-full border-4 border-teal-600 border-t-transparent animate-spin' />
                </div>
              ) : prescriptions.length === 0 ? (
                <EmptyState
                  icon={FaPrescriptionBottleAlt}
                  title='No prescriptions'
                  message='Your prescription records will appear here.'
                />
              ) : (
                <div className='space-y-3 max-h-72 overflow-y-auto pr-1'>
                  {prescriptions.map(rx => (
                    <div key={rx._id} className='rounded-2xl bg-[var(--bg-subtle)] p-4 dark:bg-[var(--bg-subtle)]'>
                      <p className='font-semibold text-[color:var(--txt-primary)]  text-sm'>
                        Dr. {rx.doctorId?.name || '—'}
                      </p>
                      <p className='text-xs text-[color:var(--txt-muted)] mt-0.5'>
                        {new Date(rx.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {rx.medicines?.slice(0, 3).map((m, j) => (
                          <span key={j} className='rounded-xl bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800  dark:text-cyan-300'>
                            {m.medicineName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Medical History (patient only) */}
          {role === 'patient' && user?.medicalHistory?.length > 0 && (
            <div className='rounded-3xl bg-[var(--bg-card)] p-7 shadow-xl dark:bg-[var(--bg-card)]'>
              <h2 className='text-xl font-bold text-[color:var(--txt-primary)]  mb-5'>Medical History</h2>
              <div className='space-y-3'>
                {user.medicalHistory.map((h, i) => (
                  <div key={i} className='rounded-2xl border border-[var(--border)] p-4 '>
                    <p className='font-semibold text-[color:var(--txt-primary)] '>{h.disease}</p>
                    {h.diagnosisDate && (
                      <p className='text-xs text-[color:var(--txt-muted)] mt-1'>
                        {new Date(h.diagnosisDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                    {h.notes && <p className='text-sm text-[color:var(--txt-secondary)] dark:text-[color:var(--txt-muted)] mt-2'>{h.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Profile
