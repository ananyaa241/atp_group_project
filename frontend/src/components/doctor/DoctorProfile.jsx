import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUserMd, FaStar, FaGraduationCap, FaArrowLeft, FaHeartbeat, FaBrain, FaBone, FaEye, FaTooth, FaLungs, FaChild, FaFemale, FaAllergies, FaCut, FaFlask, FaStethoscope, FaCheckCircle, FaHospitalUser } from 'react-icons/fa'
import { MdOutlineAttachMoney } from 'react-icons/md'
import axiosInstance from '../../api/axiosInstance'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'

function getSpecialtyMeta(specialization = '') {
  const s = specialization.toLowerCase()
  if (s.includes('cardio') || s.includes('heart')) return { Icon: FaHeartbeat, color: '#dc2626', bg: 'rgba(220,38,38,0.08)' }
  if (s.includes('neuro') || s.includes('brain')) return { Icon: FaBrain, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' }
  if (s.includes('ortho') || s.includes('bone') || s.includes('spine')) return { Icon: FaBone, color: '#d97706', bg: 'rgba(217,119,6,0.08)' }
  if (s.includes('ophthal') || s.includes('eye') || s.includes('vision')) return { Icon: FaEye, color: '#0369a1', bg: 'rgba(3,105,161,0.08)' }
  if (s.includes('dental') || s.includes('tooth') || s.includes('oral')) return { Icon: FaTooth, color: '#475569', bg: 'rgba(71,85,105,0.08)' }
  if (s.includes('pulmo') || s.includes('lung') || s.includes('respir')) return { Icon: FaLungs, color: '#0891b2', bg: 'rgba(8,145,178,0.08)' }
  if (s.includes('pedia') || s.includes('child')) return { Icon: FaChild, color: '#ea580c', bg: 'rgba(234,88,12,0.08)' }
  if (s.includes('gynae') || s.includes('obste') || s.includes('women')) return { Icon: FaFemale, color: '#db2777', bg: 'rgba(219,39,119,0.08)' }
  if (s.includes('derma') || s.includes('skin')) return { Icon: FaAllergies, color: '#65a30d', bg: 'rgba(101,163,13,0.08)' }
  if (s.includes('surg')) return { Icon: FaCut, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' }
  if (s.includes('pathol') || s.includes('lab')) return { Icon: FaFlask, color: '#059669', bg: 'rgba(5,150,105,0.08)' }
  return { Icon: FaStethoscope, color: '#0d9488', bg: 'rgba(13,148,136,0.08)' }
}

function getMockDetails(specialization = '') {
  const s = specialization.toLowerCase()
  if (s.includes('cardio')) {
    return {
      bio: "Dr. is a renowned Cardiologist with a profound commitment to cardiovascular health. With extensive training in interventional cardiology and advanced heart failure management, they bring cutting-edge treatment protocols to their patients. They focus on comprehensive heart care, including preventative cardiology, complex arrhythmias, and non-invasive diagnostic techniques. Their philosophy centers on empowering patients through education and personalized lifestyle modifications, ensuring optimal heart function and long-term vitality.",
      expertise: ["Coronary Artery Disease Management", "Echocardiography & Stress Testing", "Heart Failure & Transplant Cardiology", "Arrhythmia Ablation Procedures", "Preventative Cardiovascular Medicine"],
      diseases: ["Heart Attacks (Myocardial Infarction)", "Hypertension (High Blood Pressure)", "Atrial Fibrillation", "Congestive Heart Failure", "Valvular Heart Disease"]
    }
  }
  if (s.includes('neuro')) {
    return {
      bio: "An accomplished Neurologist specializing in complex disorders of the central and peripheral nervous systems. With a keen clinical eye and access to advanced neuroimaging techniques, they provide accurate diagnoses and targeted treatment plans for debilitating neurological conditions. They are actively involved in clinical trials for neurodegenerative diseases and are dedicated to improving the quality of life for patients experiencing cognitive decline, movement disorders, or chronic pain syndromes.",
      expertise: ["Advanced Neuroimaging Interpretation", "Electromyography (EMG) & Nerve Conduction", "Stroke Management & Rehabilitation", "Cognitive Behavioral Neurology", "Deep Brain Stimulation Management"],
      diseases: ["Ischemic & Hemorrhagic Strokes", "Epilepsy & Seizure Disorders", "Migraines & Chronic Headaches", "Parkinson's & Alzheimer's Disease", "Multiple Sclerosis"]
    }
  }
  if (s.includes('ortho')) {
    return {
      bio: "A highly skilled Orthopedic Specialist dedicated to restoring mobility and eliminating musculoskeletal pain. They utilize minimally invasive surgical techniques and state-of-the-art orthopedic implants to ensure faster recovery times and better functional outcomes. Whether treating a high-performance athlete with a sports injury or an elderly patient with severe osteoarthritis, they tailor their approach to each individual's lifestyle goals, emphasizing both surgical excellence and comprehensive physical rehabilitation.",
      expertise: ["Minimally Invasive Joint Replacement", "Arthroscopic Surgery", "Sports Medicine & Injury Rehab", "Spinal Decompression & Fusion", "Complex Fracture Care"],
      diseases: ["Osteoarthritis & Rheumatoid Arthritis", "ACL Tears & Meniscus Injuries", "Spinal Disc Herniations", "Osteoporosis", "Carpal Tunnel Syndrome"]
    }
  }
  // Default for others
  return {
    bio: `A dedicated and compassionate ${specialization} specialist committed to delivering exceptional patient care. They utilize evidence-based medical practices and the latest clinical research to provide accurate diagnoses and effective treatment strategies. Known for their excellent bedside manner, they take the time to listen to patient concerns and collaboratively develop personalized care plans. Their holistic approach to medicine ensures that both the physical and emotional well-being of the patient are addressed.`,
    expertise: ["Comprehensive Clinical Evaluations", "Advanced Diagnostic Procedures", "Personalized Treatment Planning", "Preventative Healthcare & Screening", "Chronic Disease Management"],
    diseases: ["Acute Infections & Fevers", "Chronic Inflammatory Conditions", "Metabolic Disorders", "Autoimmune Diseases", "General Undiagnosed Symptoms"]
  }
}

function getSampleFee(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fee = 2000 + (Math.abs(hash) % 3001); 
  return Math.round(fee / 100) * 100;
}

function DoctorProfile() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    axiosInstance.get('/doctor-api/doctor/' + id)
      .then(res => setDoctor(res.data.payload))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="pt-20"><Loader /></div>
  
  if (!doctor) {
    return (
      <div className="pt-20 max-w-4xl mx-auto px-6">
        <EmptyState icon={FaUserMd} title="Doctor Not Found" message="The doctor profile you are looking for does not exist." />
      </div>
    )
  }

  const { Icon, color, bg } = getSpecialtyMeta(doctor.specialization)
  const details = getMockDetails(doctor.specialization)

  return (
    <div className="min-h-[85vh] pb-20" style={{ background: 'var(--bg-page)' }}>
      {/* ── Banner ── */}
      <div className="h-48 w-full relative" style={{ background: 'linear-gradient(135deg, #0f2a28 0%, #134e4a 100%)' }}>
        <div className="absolute top-6 left-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-semibold text-xs transition">
            <FaArrowLeft size={10} /> Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative -mt-20">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* ── Left Column (Profile Card) ── */}
          <div className="md:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="rounded-2xl p-6 shadow-lg text-center" 
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div 
                className="h-32 w-32 mx-auto rounded-2xl flex items-center justify-center shadow-inner mb-5"
                style={{ background: bg, border: `2px solid ${color}40` }}
              >
                <Icon size={56} style={{ color }} />
              </div>

              <h1 className="text-xl font-extrabold" style={{ color: 'var(--txt-primary)' }}>Dr. {doctor.name}</h1>
              <p className="text-sm font-bold mt-1" style={{ color }}>{doctor.specialization}</p>

              <div className="mt-6 space-y-3 text-left border-t pt-5" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                    <FaStar size={12} style={{ color: '#d97706' }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--txt-muted)' }}>Experience</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--txt-primary)' }}>{doctor.experience} Years</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(13, 148, 136, 0.1)' }}>
                    <FaGraduationCap size={14} style={{ color: '#0d9488' }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--txt-muted)' }}>Qualification</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--txt-primary)' }}>{doctor.qualification || 'MBBS, MD'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                    <MdOutlineAttachMoney size={16} style={{ color: '#2563eb' }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--txt-muted)' }}>Consultation Fee</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--txt-primary)' }}>₹{doctor.consultationFee > 0 ? doctor.consultationFee : getSampleFee(doctor._id)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/register" className="block w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
                  Book Appointment
                </Link>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column (Details) ── */}
          <div className="md:col-span-2 pt-6 md:pt-24">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--txt-primary)' }}>
                <FaHospitalUser size={16} style={{ color: '#0d9488' }} /> About Dr. {doctor.name}
              </h2>
              <div className="p-6 rounded-2xl mb-8 leading-relaxed text-sm shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--txt-secondary)' }}>
                {details.bio.replace('Dr. is', `Dr. ${doctor.name} is`)}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--txt-primary)' }}>
                    <FaCheckCircle size={14} style={{ color: '#0d9488' }} /> Clinical Expertise
                  </h3>
                  <div className="space-y-3">
                    {details.expertise.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                        <p className="text-xs font-semibold" style={{ color: 'var(--txt-secondary)' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--txt-primary)' }}>
                    <FaCheckCircle size={14} style={{ color: '#dc2626' }} /> Conditions Treated
                  </h3>
                  <div className="space-y-3">
                    {details.diseases.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#dc2626' }} />
                        <p className="text-xs font-semibold" style={{ color: 'var(--txt-secondary)' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
