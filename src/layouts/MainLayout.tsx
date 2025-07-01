import { Outlet, NavLink } from 'react-router-dom'
import { Component as FlowbiteSidebar } from '../components/Sidebar'
import Dock from '../components/Dock'
export default function MainLayout() {
  return (
    <div className="h-screen flex">
      {/* 侧边导航 */}
      <div className="hidden md:block">
        <FlowbiteSidebar />
      </div>
      {/* 主体内容 */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </main>
      <Dock />
    </div>
  )
}
