import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  FaBrain, FaHeartbeat, FaUserMd, FaStethoscope,
  FaExclamationCircle, FaShieldAlt, FaArrowRight,
  FaSpinner, FaStar, FaThermometerHalf, FaLungs,
  FaBone, FaEye, FaTooth, FaFlask
} from 'react-icons/fa'
import axiosInstance from '../../api/axiosInstance'

const QUICK_CHIPS = [
  { label: '🤕 Headache',        value: 'severe headache and dizziness' },
  { label: '💓 Chest Pain',      value: 'chest pain and shortness of breath' },
  { label: '🤒 Fever & Chills',  value: 'high fever, chills and body aches' },
  { label: '🦴 Joint Pain',      value: 'joint pain and swelling in knees' },
  { label: '👁️ Eye Issues',      value: 'blurred vision and eye irritation' },
  { label: '🫁 Breathing',       value: 'difficulty breathing and wheezing' },
  { label: '🩺 Skin Rash',       value: 'skin rash, itching and redness' },
  { label: '🦷 Toothache',       value: 'severe toothache and jaw pain' },
  { label: '🧠 Anxiety',         value: 'anxiety, stress and panic attacks' },
  { label: '💊 Stomach Pain',    value: 'severe abdominal pain and nausea' },
  { label: '🩸 Sugar Issues',    value: 'excessive thirst, frequent urination, fatigue' },
  { label: '👂 Ear Pain',        value: 'ear pain, ringing and hearing loss' },
]

const SPEC_ICONS = {
  Cardiology:     <FaHeartbeat />,
  Neurology:      <FaBrain />,
  Pulmonology:    <FaLungs />,
  Orthopedics:    <FaBone />,
  Ophthalmology:  <FaEye />,
  Dentistry:      <FaTooth />,
  Dermatology:    <FaFlask />,
  default:        <FaStethoscope />
}

function getSpecIcon(spec) {
  return SPEC_ICONS[spec] || SPEC_ICONS.default
}

function SymptomChecker() {
  const navigate = useNavigate()
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = symptoms.trim()
    if (!trimmed) {
      toast.error('Please describe your symptoms first.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await axiosInstance.post('/appointment-api/symptom-check', { symptoms: trimmed })
      setResult(res.data.payload)
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleChip(value) {
    setSymptoms(value)
    setResult(null)
  }

  return (
    <div className='page-transition'>
      {/* ── Page header ─────────────────────────────── */}
      <div className='mb-7 pb-5 border-b' style={{ borderColor: 'var(--border)' }}>
        <p className='text-xs uppercase tracking-widest font-semibold text-teal-600'>AI-Powered</p>
        <h1 className='mt-1 text-xl font-bold' style={{ color: 'var(--txt-primary)' }}>
          Symptom Checker
        </h1>
        <p className='text-xs mt-1' style={{ color: 'var(--txt-muted)' }}>
          Describe how you're feeling and our AI will recommend the right specialist for you.
        </p>
      </div>

      {/* ── Input card ─────────────────────────────── */}
      <div className='rounded-2xl border p-6 mb-5' style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-600 mb-3'>Quick Select</p>
        <div className='flex flex-wrap gap-2 mb-5'>
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip.value}
              type='button'
              onClick={() => handleChip(chip.value)}
              className='rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all'
              style={{
                borderColor: symptoms === chip.value ? '#0d9488' : 'var(--border)',
                background: symptoms === chip.value ? 'rgba(13,148,136,0.12)' : 'var(--bg-subtle)',
                color: symptoms === chip.value ? '#0d9488' : 'var(--txt-secondary)'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <label className='block text-xs font-semibold mb-2' style={{ color: 'var(--txt-secondary)' }}>
            Or describe your symptoms in detail
          </label>
          <textarea
            value={symptoms}
            onChange={e => { setSymptoms(e.target.value); setResult(null) }}
            rows={4}
            placeholder='e.g. I have been experiencing severe chest pain radiating to my left arm, along with shortness of breath and sweating for the past two hours...'
            className='w-full rounded-xl border px-4 py-3 text-xs resize-none outline-none transition-colors'
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--txt-primary)'
            }}
            onFocus={e => e.target.style.borderColor = '#0d9488'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            type='submit'
            disabled={loading || !symptoms.trim()}
            className='mt-4 flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50'
            style={{ background: 'linear-gradient(105deg, #0f766e 0%, #0d9488 100%)' }}
          >
            {loading
              ? <><FaSpinner className='animate-spin' size={12} /> Analyzing your symptoms…</>
              : <><FaBrain size={12} /> Analyze with AI <FaArrowRight size={10} /></>
            }
          </button>
        </form>
      </div>

      {/* ── Loading animation ─────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className='rounded-2xl border p-8 flex flex-col items-center gap-4 mb-5'
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className='relative flex items-center justify-center'>
              <div className='h-14 w-14 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin' />
              <FaBrain className='absolute text-teal-600' size={18} />
            </div>
            <div className='text-center'>
              <p className='text-sm font-bold' style={{ color: 'var(--txt-primary)' }}>AI is analysing your symptoms</p>
              <p className='text-xs mt-1' style={{ color: 'var(--txt-muted)' }}>Consulting medical knowledge base…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result ───────────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Recommended specialisation banner */}
            <div
              className='rounded-2xl p-6 mb-5 text-white'
              style={{ background: 'linear-gradient(105deg, #0f766e 0%, #0d9488 60%, #134e4a 100%)' }}
            >
              <p className='text-[10px] uppercase tracking-widest font-semibold text-teal-200 mb-1'>
                AI Recommendation
              </p>
              <div className='flex items-center gap-3 mb-3'>
                <div className='h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg'>
                  {getSpecIcon(result.specialization)}
                </div>
                <div>
                  <h2 className='text-lg font-extrabold leading-tight'>{result.specialization}</h2>
                  <p className='text-xs text-teal-100'>Recommended Specialisation</p>
                </div>
              </div>
              <p className='text-sm text-teal-50 leading-relaxed'>{result.explanation}</p>
            </div>

            {/* Precautions */}
            {result.precautions?.length > 0 && (
              <div
                className='rounded-2xl border p-5 mb-5'
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className='flex items-center gap-2 mb-3'>
                  <FaShieldAlt size={13} className='text-amber-500' />
                  <p className='text-xs font-bold' style={{ color: 'var(--txt-primary)' }}>
                    Immediate Precautions
                  </p>
                </div>
                <ul className='space-y-2'>
                  {result.precautions.map((p, i) => (
                    <li key={i} className='flex items-start gap-2.5 text-xs' style={{ color: 'var(--txt-secondary)' }}>
                      <span
                        className='flex-shrink-0 mt-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-black text-white'
                        style={{ background: '#d97706' }}
                      >
                        {i + 1}
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended doctors */}
            {result.recommendedDoctors?.length > 0 && (
              <div className='rounded-2xl border overflow-hidden' style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className='px-5 py-4 border-b' style={{ borderColor: 'var(--border)' }}>
                  <div className='flex items-center gap-2'>
                    <FaUserMd size={13} className='text-teal-600' />
                    <p className='text-xs font-bold' style={{ color: 'var(--txt-primary)' }}>
                      Top {result.specialization} Specialists
                    </p>
                  </div>
                  <p className='text-[10px] mt-0.5' style={{ color: 'var(--txt-muted)' }}>
                    Recommended based on your symptoms
                  </p>
                </div>
                <div className='divide-y' style={{ borderColor: 'var(--border)' }}>
                  {result.recommendedDoctors.map((doc, i) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className='flex items-center gap-4 px-5 py-4 transition-colors'
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Avatar */}
                      <div className='h-11 w-11 rounded-full bg-teal-700/20 border-2 border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-sm flex-shrink-0 overflow-hidden'>
                        {doc.profileImage
                          ? <img src={doc.profileImage} alt={doc.name} className='h-full w-full object-cover' />
                          : doc.name?.charAt(0)?.toUpperCase() || 'D'
                        }
                      </div>

                      {/* Info */}
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-bold truncate' style={{ color: 'var(--txt-primary)' }}>
                          Dr. {doc.name}
                        </p>
                        <p className='text-[10px] mt-0.5' style={{ color: 'var(--txt-muted)' }}>
                          {doc.specialization}
                          {doc.experience ? ` · ${doc.experience} yrs exp` : ''}
                          {doc.qualification ? ` · ${doc.qualification}` : ''}
                        </p>
                        {doc.consultationFee > 0 && (
                          <p className='text-[10px] mt-0.5 font-semibold text-teal-600'>
                            ₹{doc.consultationFee} consultation
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => navigate('/appointments')}
                        className='flex-shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white transition-all'
                        style={{ background: '#0d9488' }}
                      >
                        Book →
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className='mt-4 flex items-start gap-2 text-[10px]' style={{ color: 'var(--txt-muted)' }}>
              <FaExclamationCircle className='flex-shrink-0 mt-0.5 text-amber-400' size={11} />
              <p>
                This is an AI-assisted recommendation only and does not constitute medical advice.
                Always consult a qualified healthcare professional for diagnosis and treatment.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SymptomChecker
