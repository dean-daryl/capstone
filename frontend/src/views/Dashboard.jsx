import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../components/SideBar'

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className='flex h-screen w-full'>
      <SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-100 ${isSidebarOpen ? 'ml-[270px]' : 'ml-0'}`}>
        <main className='h-full overflow-auto '>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Dashboard