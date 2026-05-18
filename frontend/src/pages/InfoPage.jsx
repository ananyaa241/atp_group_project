import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaStethoscope, FaHeartbeat, FaBrain, FaBone, FaBaby, 
  FaVial, FaPills, FaAmbulance, FaSyringe, FaProcedures, FaArrowLeft, FaCheckCircle
} from 'react-icons/fa'

const INFO_DATA = {
  // Services
  'general-medicine': {
    title: 'General Medicine',
    icon: FaStethoscope,
    description: 'Our General Medicine department is the first point of contact for patients. We focus on the prevention, diagnosis, and treatment of adult diseases. Our team of highly skilled physicians ensures comprehensive and personalized care for a wide range of acute and chronic conditions.',
    features: ['Comprehensive Health Checkups', 'Chronic Disease Management', 'Preventive Care & Vaccinations', 'Fever & Infection Treatment']
  },
  'emergency-care': {
    title: 'Emergency Care',
    icon: FaAmbulance,
    description: 'Our 24/7 Emergency Care unit is equipped with state-of-the-art life-saving technology and staffed by expert trauma physicians and nurses. We are always ready to handle critical medical emergencies with rapid response times to save lives.',
    features: ['24/7 Trauma Center', 'Advanced Life Support Ambulances', 'Dedicated Resuscitation Bays', 'Rapid Stroke & Heart Attack Protocols']
  },
  'surgery': {
    title: 'Surgery',
    icon: FaSyringe,
    description: 'The Department of Surgery at MediCare+ offers advanced surgical interventions across multiple specialties. We utilize the latest minimally invasive and robotic techniques to ensure precision, faster recovery, and minimal scarring for our patients.',
    features: ['Minimally Invasive Laparoscopy', 'Robotic-Assisted Surgery', 'Pre & Post-Operative Care', 'Day Care Surgical Procedures']
  },
  'diagnostics': {
    title: 'Diagnostics',
    icon: FaVial,
    description: 'Accurate treatment begins with accurate diagnosis. Our advanced Diagnostics center features cutting-edge imaging technology and fully automated pathology labs to provide fast, reliable, and precise test results.',
    features: ['High-Resolution MRI & CT Scans', 'Advanced Digital X-Rays', 'Fully Automated Pathology Lab', 'Ultrasound & Color Doppler']
  },
  'pharmacy': {
    title: 'Pharmacy',
    icon: FaPills,
    description: 'Our in-house Pharmacy operates 24/7, providing authentic and high-quality medications. We ensure strict quality control and offer a comprehensive range of prescription drugs, over-the-counter medicines, and surgical supplies.',
    features: ['24/7 Availability', 'Genuine & Verified Medicines', 'Home Delivery Options', 'Expert Pharmacist Consultations']
  },

  // Departments
  'cardiology': {
    title: 'Cardiology',
    icon: FaHeartbeat,
    description: 'The Cardiology department is dedicated to the diagnosis, treatment, and prevention of heart and blood vessel diseases. Our expert cardiologists use advanced techniques to manage complex cardiovascular conditions and improve patient heart health.',
    features: ['Angiography & Angioplasty', 'Echocardiogram (ECG & 2D Echo)', 'Pacemaker Implantation', 'Heart Failure Management']
  },
  'neurology': {
    title: 'Neurology',
    icon: FaBrain,
    description: 'Our Neurology department provides comprehensive care for disorders of the brain, spinal cord, and nervous system. We offer advanced neuro-diagnostics and treatment protocols for stroke, epilepsy, movement disorders, and more.',
    features: ['Stroke Unit & Rehabilitation', 'Epilepsy & Seizure Management', 'Advanced Neuro-Imaging', 'Headache & Migraine Clinics']
  },
  'orthopedics': {
    title: 'Orthopedics',
    icon: FaBone,
    description: 'The Orthopedics department specializes in the care of bones, joints, ligaments, tendons, and muscles. From joint replacements to sports injuries, our specialized surgeons help restore mobility and improve quality of life.',
    features: ['Total Knee & Hip Replacements', 'Arthroscopy & Sports Medicine', 'Complex Trauma & Fracture Care', 'Spine Surgery & Rehab']
  },
  'pediatrics': {
    title: 'Pediatrics',
    icon: FaBaby,
    description: 'Our Pediatrics department provides compassionate, family-centered care for infants, children, and adolescents. We focus on growth, development, and the treatment of childhood illnesses in a child-friendly environment.',
    features: ['Neonatal Intensive Care (NICU)', 'Pediatric Immunization', 'Child Nutrition & Growth Tracking', 'Pediatric Emergency Services']
  },
  'oncology': {
    title: 'Oncology',
    icon: FaProcedures,
    description: 'The Oncology department offers comprehensive cancer care, focusing on early detection, advanced treatment therapies, and compassionate palliative care. Our multidisciplinary tumor board designs personalized treatment plans for every patient.',
    features: ['Medical & Surgical Oncology', 'Targeted Radiation Therapy', 'Chemotherapy Day Care', 'Cancer Screening & Prevention']
  }
}

function InfoPage() {
  const { category, slug } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const data = INFO_DATA[slug]

  if (!data) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center p-6'>
        <p className='text-slate-500 mb-4'>Information not found for this {category || 'page'}.</p>
        <Link to='/' className='text-teal-600 font-semibold hover:underline flex items-center gap-2'>
          <FaArrowLeft /> Return Home
        </Link>
      </div>
    )
  }

  const Icon = data.icon

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.4 }}
      className='min-h-screen pb-20'
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-teal-800 text-white py-20 px-6'>
        <div className='absolute inset-0 opacity-10' style={{ background: 'radial-gradient(circle at 80% 20%, white, transparent 50%)' }} />
        
        <div className='max-w-4xl mx-auto relative z-10'>
          <button 
            onClick={() => navigate(-1)} 
            className='flex items-center gap-2 text-teal-200 hover:text-white transition-colors text-sm font-semibold mb-8'
          >
            <FaArrowLeft size={12} /> Back
          </button>

          <div className='flex items-center gap-5'>
            <div className='h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg'>
              <Icon size={30} className='text-teal-300' />
            </div>
            <div>
              <p className='text-teal-300 text-xs font-bold uppercase tracking-widest mb-1'>{category === 'services' ? 'Our Service' : 'Department'}</p>
              <h1 className='text-4xl md:text-5xl font-black tracking-tight'>{data.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='max-w-4xl mx-auto px-6 -mt-8 relative z-20'>
        <div className='rounded-3xl p-8 shadow-xl border' style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          
          <h2 className='text-2xl font-bold mb-4' style={{ color: 'var(--txt-primary)' }}>Overview</h2>
          <p className='text-base leading-relaxed mb-10' style={{ color: 'var(--txt-secondary)' }}>
            {data.description}
          </p>

          <h3 className='text-lg font-bold mb-5 flex items-center gap-2' style={{ color: 'var(--txt-primary)' }}>
            <FaCheckCircle className='text-teal-600' /> Key Features & Treatments
          </h3>
          
          <div className='grid sm:grid-cols-2 gap-4 mb-10'>
            {data.features.map((feature, idx) => (
              <div key={idx} className='flex items-center gap-3 p-4 rounded-2xl border' style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                <div className='h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 dark:bg-teal-900/30'>
                  <Icon size={14} className='text-teal-600 dark:text-teal-400' />
                </div>
                <p className='text-sm font-semibold' style={{ color: 'var(--txt-primary)' }}>{feature}</p>
              </div>
            ))}
          </div>

          <div className='border-t pt-8 text-center' style={{ borderColor: 'var(--border)' }}>
            <h4 className='text-lg font-bold mb-3' style={{ color: 'var(--txt-primary)' }}>Ready to schedule your visit?</h4>
            <p className='text-sm mb-6 max-w-md mx-auto' style={{ color: 'var(--txt-secondary)' }}>
              Log in to your patient portal to book an appointment with our {data.title} specialists directly.
            </p>
            <Link 
              to='/login'
              className='inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700 transition-colors'
            >
              Book an Appointment
            </Link>
          </div>

        </div>
      </div>
    </motion.div>
  )
}

export default InfoPage
