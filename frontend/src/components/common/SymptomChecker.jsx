import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { FaHeartbeat, FaAllergies, FaBrain, FaBone, FaStethoscope, FaSearch, FaUserMd } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import axiosInstance from '../../api/axiosInstance'
import EmptyState from './EmptyState'
import { AuthContext } from '../../context/AuthContext'

const conditions = [
  { label: 'Heart discomfort', value: 'heart pain', spec: 'Cardiology', icon: FaHeartbeat, color: '#dc2626' },
  { label: 'Skin rash', value: 'skin rash', spec: 'Dermatology', icon: FaAllergies, color: '#65a30d' },
  { label: 'Headache / dizziness', value: 'headache', spec: 'Neurology', icon: FaBrain, color: '#7c3aed' },
  { label: 'Joint pain', value: 'joint pain', spec: 'Orthopedics', icon: FaBone, color: '#d97706' },
  { label: 'Cough or breath', value: 'coughing', spec: 'Pulmonology', icon: FaStethoscope, color: '#0891b2' },
  { label: 'Women health', value: 'women health', spec: 'Gynecology', icon: FaUserMd, color: '#db2777' },
]

function getSpecialtyMeta(specialization = '') {
  const s = specialization.toLowerCase()
  if (s.includes('cardio') || s.includes('heart')) return { Icon: FaHeartbeat, color: '#dc2626' }
  if (s.includes('derma') || s.includes('skin')) return { Icon: FaAllergies, color: '#65a30d' }
  if (s.includes('neuro') || s.includes('brain')) return { Icon: FaBrain, color: '#7c3aed' }
  if (s.includes('ortho') || s.includes('bone')) return { Icon: FaBone, color: '#d97706' }
  return { Icon: FaStethoscope, color: '#0d9488' }
}

function buildRating(experience = 0) {
  return Math.min(5, 3 + Math.round(experience * 0.14 * 10) / 10)
}

function SymptomChecker() {
  const { role, isAuthenticated } = useContext(AuthContext)
  const [symptoms, setSymptoms] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const isPatient = isAuthenticated && role === 'patient'

  async function handleAnalyze(e) {
    e.preventDefault()

    if (!isPatient) {
      toast.error('Please log in as a patient to use the symptom checker.')
      return
    }

    if (!symptoms.trim()) {
      toast.error('Please enter your symptoms to analyze.')
      return
    }

    setLoading(true)
    setAnalysis(null)

    try {
      const response = await axiosInstance.post('/appointment-api/symptom-check', {
        symptoms: symptoms.trim()
      })

      setAnalysis(response.data.payload)
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to analyze symptoms right now.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='py-16' style={{ background: 'var(--bg-page)' }}>
      <div className='max-w-7xl mx-auto px-8'>
        <div className='mb-8'>
          <p className='text-[10px] uppercase tracking-widest font-bold text-teal-600 dark:text-teal-400'>Symptom Checker</p>
          <h2 className='mt-1 text-xl font-bold' style={{ color: 'var(--txt-primary)' }}>Not sure which specialist you need?</h2>
          <p className='mt-1 text-xs' style={{ color: 'var(--txt-muted)' }}>
            Describe how you feel and get a research-backed recommendation, first precautions and the most appropriate doctor from our database.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='rounded-xl overflow-hidden'
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className='p-6'>
            <form onSubmit={handleAnalyze} className='space-y-4'>
              <div>
                <label className='block text-xs font-semibold mb-2' style={{ color: 'var(--txt-secondary)' }}>
                  Describe your symptoms
                </label>
                <textarea
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder='e.g. I have chest pain when I exercise, or itchy rash on my arm...'
                  rows={4}
                  className='w-full rounded-xl border px-4 py-3 text-xs outline-none transition resize-none'
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-page)', color: 'var(--txt-primary)' }}
                />
              </div>
              <div className='flex flex-wrap gap-2'>
                {conditions.map(condition => (
                  <button
                    key={condition.label}
                    type='button'
                    onClick={() => setSymptoms(condition.value)}
                    className='rounded-full border px-3 py-2 text-[10px] font-semibold transition'
                    style={{ borderColor: condition.color, color: condition.color }}
                  >
                    {condition.label}
                  </button>
                ))}
              </div>
              <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
                <button
                  type='submit'
                  disabled={!isPatient || loading}
                  className='rounded-xl bg-teal-700 px-5 py-3 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 transition disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {loading ? 'Analyzing…' : 'Analyze Symptoms'}
                </button>
                <p className='text-[11px]' style={{ color: 'var(--txt-muted)' }}>
                  Only registered patients can access this symptom analysis service.
                </p>
              </div>
            </form>
          </div>

          <div className='border-t' style={{ borderColor: 'var(--border)' }}>
            {analysis ? (
              <div className='p-6 grid gap-6 md:grid-cols-[1.4fr_1fr]'>
                <div className='space-y-6'>
                  <div className='rounded-2xl border p-6' style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
                    <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600'>Suggested Specialty</p>
                    <p className='mt-2 text-lg font-semibold' style={{ color: 'var(--txt-primary)' }}>{analysis.specialization || 'General Medicine'}</p>
                    <p className='mt-3 text-sm leading-6' style={{ color: 'var(--txt-muted)' }}>{analysis.explanation}</p>
                  </div>

                  <div className='rounded-2xl border p-6' style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
                    <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600'>First Precautions</p>
                    <ul className='mt-3 space-y-2 text-sm text-slate-600'>
                      {Array.isArray(analysis.precautions) ? (
                        analysis.precautions.map((item, index) => (
                          <li key={index} className='list-disc pl-4'>{item}</li>
                        ))
                      ) : (
                        <li>{analysis.precautions}</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className='text-xs uppercase tracking-widest font-semibold text-teal-600 mb-3'>Recommended Doctors</h4>
                  {analysis.recommendedDoctors?.length ? (
                    <div className='space-y-3'>
                      {analysis.recommendedDoctors.map((doc) => {
                        const { Icon, color } = getSpecialtyMeta(doc.specialization)
                        return (
                          <motion.div
                            key={doc._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='rounded-3xl border px-4 py-4'
                            style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}
                          >
                            <div className='flex items-center justify-between gap-3'>
                              <div>
                                <p className='text-sm font-semibold' style={{ color: 'var(--txt-primary)' }}>Dr. {doc.name}</p>
                                <p className='text-[11px] mt-1' style={{ color: 'var(--txt-muted)' }}>{doc.specialization}</p>
                              </div>
                              <div className='h-10 w-10 rounded-2xl flex items-center justify-center' style={{ background: `${color}15`, color }}>
                                <Icon size={16} />
                              </div>
                            </div>
                            <div className='mt-3 flex flex-wrap gap-2 text-[10px]'>
                              <span className='rounded-full bg-slate-100 px-2.5 py-1' style={{ color: 'var(--txt-secondary)' }}>
                                {doc.experience || 0} yrs experience
                              </span>
                              <span className='rounded-full bg-slate-100 px-2.5 py-1' style={{ color: 'var(--txt-secondary)' }}>
                                Rating {buildRating(doc.experience)} ⭐
                              </span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <EmptyState icon={FaUserMd} title='No doctor recommendations' message='Try refining your symptoms or try again later.' />
                  )}
                </div>
              </div>
            ) : (
              <div className='p-6'>
                <EmptyState
                  icon={FaSearch}
                  title={isPatient ? 'Submit symptoms to analyze' : 'Patient-only access'}
                  message={isPatient ? 'Enter your symptoms and tap analyze to see recommended doctors.' : 'Only logged-in patients can use the symptom checker.'}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SymptomChecker
