import { FaHospital, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const links = {
  Services: [
    { label: 'General Medicine', path: '/info/services/general-medicine' },
    { label: 'Emergency Care', path: '/info/services/emergency-care' },
    { label: 'Surgery', path: '/info/services/surgery' },
    { label: 'Diagnostics', path: '/info/services/diagnostics' },
    { label: 'Pharmacy', path: '/info/services/pharmacy' }
  ],
  Departments: [
    { label: 'Cardiology', path: '/info/departments/cardiology' },
    { label: 'Neurology', path: '/info/departments/neurology' },
    { label: 'Orthopedics', path: '/info/departments/orthopedics' },
    { label: 'Pediatrics', path: '/info/departments/pediatrics' },
    { label: 'Oncology', path: '/info/departments/oncology' }
  ],
  Portal: [
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
    { label: 'Book Appointment', path: '/login' },
    { label: 'Find a Doctor', path: '/doctors' }
  ]
}

function Footer() {
  return (
    <footer style={{ background: '#0f1f1e', borderTop: '1px solid #1a3330' }}>
      {/* Main grid */}
      <div className='max-w-7xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-5 gap-10'>

        {/* Brand col */}
        <div className='md:col-span-2'>
          <div className='flex items-center gap-2.5 mb-4'>
            <div className='h-9 w-9 rounded-lg bg-teal-700 flex items-center justify-center flex-shrink-0'>
              <FaHospital size={15} className='text-white' />
            </div>
            <div>
              <p className='text-sm font-extrabold leading-tight'>
                <span className='text-teal-400'>Medi</span><span className='text-white'>Care</span><span className='text-red-400'>+</span>
              </p>
              <p className='text-[9px] uppercase tracking-[0.2em] text-slate-500'>Multi-Specialty Hospital</p>
            </div>
          </div>

          <p className='text-xs text-slate-400 leading-relaxed max-w-xs mb-5'>
            Delivering world-class healthcare with compassion, technology, and trust since 1998.
            NABH Accredited. ISO 9001:2015 Certified.
          </p>

          <div className='space-y-2.5'>
            <div className='flex items-center gap-2.5 text-xs text-slate-400'>
              <FaMapMarkerAlt size={11} className='text-teal-500 flex-shrink-0' />
              123 Health Avenue, Banjara Hills, Hyderabad — 500034
            </div>
            <div className='flex items-center gap-2.5 text-xs text-slate-400'>
              <FaPhone size={11} className='text-teal-500 flex-shrink-0' />
              040-68334470 &nbsp;|&nbsp; Emergency: 108
            </div>
            <div className='flex items-center gap-2.5 text-xs text-slate-400'>
              <FaEnvelope size={11} className='text-teal-500 flex-shrink-0' />
              support@medicare-hospital.in
            </div>
          </div>

          <div className='flex gap-3 mt-5'>
            {[FaFacebook, FaLinkedin, FaTwitter].map((Icon, i) => (
              <div key={i} className='h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors'
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(13,148,136,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
              >
                <Icon size={13} className='text-slate-400' />
              </div>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([heading, items]) => (
          <div key={heading}>
            <p className='text-xs font-bold text-white uppercase tracking-wider mb-4'>{heading}</p>
            <ul className='space-y-2.5'>
              {items.map(item => (
                <li key={item.label}>
                  <Link to={item.path} className='text-xs text-slate-400 hover:text-teal-400 cursor-pointer transition-colors block'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className='border-t py-5 px-8' style={{ borderColor:'#1a3330' }}>
        <div className='max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3'>
          <p className='text-xs text-slate-500'>© {new Date().getFullYear()} MediCare+ Hospitals Pvt. Ltd. All rights reserved.</p>
          <div className='flex gap-5'>
            {['Privacy Policy', 'Terms of Service', 'Sitemap'].map(label => (
              <span key={label} className='text-xs text-slate-500 hover:text-teal-400 cursor-pointer transition-colors'>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer