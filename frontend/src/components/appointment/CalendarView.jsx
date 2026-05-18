import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const STATUS_COLOR = {
  Pending:   '#b45309', // darker amber
  Approved:  '#0f766e', // darker teal
  Completed: '#1d4ed8', // darker blue
  Cancelled: '#b91c1c', // darker red
}

const STATUS_BG = {
  Pending:   '#fef3c7', // amber-100
  Approved:  '#ccfbf1', // teal-100
  Completed: '#dbeafe', // blue-100
  Cancelled: '#fee2e2', // red-100
}

const STATUS_BG_DARK = {
  Pending:   'rgba(245, 158, 11, 0.2)',
  Approved:  'rgba(13, 148, 136, 0.2)',
  Completed: 'rgba(37, 99, 235, 0.2)',
  Cancelled: 'rgba(220, 38, 38, 0.2)',
}

const STATUS_COLOR_DARK = {
  Pending:   '#fcd34d',
  Approved:  '#5eead4',
  Completed: '#93c5fd',
  Cancelled: '#fca5a5',
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function CalendarView({ appointments = [], role }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Helpers for calendar generation
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Organize appointments by day of current month
  const appointmentsByDay = {}
  appointments.forEach(appt => {
    const d = new Date(appt.appointmentDate)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!appointmentsByDay[day]) appointmentsByDay[day] = []
      appointmentsByDay[day].push(appt)
    }
  })

  // Generate grid cells
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  // Need to fill the end of the grid to make it a multiple of 7
  const totalCells = blanks.length + days.length
  const nextMonthBlanks = Array.from({ length: totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7) }, (_, i) => i)

  const isDarkTheme = document.documentElement.classList.contains('dark')

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* ── Header ── */}
      <div className='mb-6 pb-5 border-b flex items-center justify-between' style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className='text-xs uppercase tracking-widest font-semibold text-teal-600 dark:text-teal-400'>Schedule</p>
          <h1 className='mt-1 text-xl font-bold' style={{ color: 'var(--txt-primary)' }}>Appointment Calendar</h1>
        </div>
        <div className='flex items-center gap-3'>
          <button onClick={handlePrevMonth} className='p-2 rounded-lg transition-colors' style={{ background: 'var(--bg-subtle)' }}>
            <FaChevronLeft size={11} style={{ color: 'var(--txt-secondary)' }} />
          </button>
          <p className='text-xs uppercase tracking-wider font-bold w-32 text-center' style={{ color: 'var(--txt-primary)' }}>
            {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
          <button onClick={handleNextMonth} className='p-2 rounded-lg transition-colors' style={{ background: 'var(--bg-subtle)' }}>
            <FaChevronRight size={11} style={{ color: 'var(--txt-secondary)' }} />
          </button>
        </div>
      </div>

      {/* ── Matrix Calendar ── */}
      <div className='rounded-xl overflow-hidden' style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Days of week */}
        <div className='grid grid-cols-7 border-b' style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className='py-2.5 text-center text-[10px] uppercase tracking-widest font-bold' style={{ color: 'var(--txt-muted)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className='grid grid-cols-7 auto-rows-[100px]'>
          {blanks.map(b => (
            <div key={`blank-${b}`} className='border-b border-r' style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }} />
          ))}

          {days.map(day => {
            const dayEvents = appointmentsByDay[day] || []
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year

            return (
              <div 
                key={day} 
                className='border-b border-r p-1.5 relative overflow-y-auto custom-scrollbar' 
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Date Number */}
                <div className='mb-1 flex justify-end'>
                  <span 
                    className={`inline-flex items-center justify-center h-6 w-6 text-[10px] font-bold rounded-full ${isToday ? 'bg-teal-600 text-white shadow-md' : ''}`}
                    style={{ color: isToday ? '#fff' : 'var(--txt-secondary)' }}
                  >
                    {day}
                  </span>
                </div>

                {/* Events List */}
                <div className='space-y-1.5'>
                  {dayEvents.map((appt, i) => {
                    const title = role === 'doctor' 
                      ? appt.patientId?.name?.split(' ')[0] || 'Patient' 
                      : `Dr. ${appt.doctorId?.name?.split(' ')[0] || 'Doctor'}`
                    
                    const time = new Date(appt.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                    const bg = isDarkTheme ? STATUS_BG_DARK[appt.status] : STATUS_BG[appt.status]
                    const color = isDarkTheme ? STATUS_COLOR_DARK[appt.status] : STATUS_COLOR[appt.status]

                    return (
                      <div 
                        key={i} 
                        className='px-1.5 py-1 rounded border shadow-sm cursor-pointer hover:opacity-80 transition-opacity'
                        title={`${title} at ${time} (${appt.status})`}
                        style={{ background: bg, color: color, borderColor: color }}
                      >
                        <p className='text-[8.5px] font-bold truncate leading-tight uppercase'>{time}</p>
                        <p className='text-[9px] font-semibold truncate leading-tight mt-0.5'>{title}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          
          {nextMonthBlanks.map(b => (
            <div key={`next-blank-${b}`} className='border-b border-r' style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }} />
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}} />
    </motion.div>
  )
}

export default CalendarView