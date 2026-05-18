import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'

function DashboardLayout() {
  return (
    <div className='flex min-h-screen' style={{ background: 'var(--bg-page)' }}>
      <Sidebar />
      <main className='flex-1 overflow-y-auto'>
        <div className='max-w-5xl mx-auto px-6 py-8'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout