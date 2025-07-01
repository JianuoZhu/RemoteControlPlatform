// src/components/Dock.tsx
import { useLocation, useNavigate } from 'react-router-dom'
import {
  HiChartPie,
  HiInbox,
} from 'react-icons/hi'
import {
  IoVideocam,
  IoGameController,
} from 'react-icons/io5'
import { FaTasks, FaBook } from 'react-icons/fa'

const dockItems = [
  { to: '/dashboard',    icon: HiChartPie,      label: '仪表盘' },
  { to: '/video-control',icon: IoVideocam,      label: '监控'       },
  { to: '/remote-control',icon: IoGameController,label: '远控'       },
  { to: '/agent-tasks',   icon: FaTasks,         label: '任务'       },
  { to: '/logs',          icon: FaBook,          label: '日志'       },
]

export default function Dock() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="dock dock-lg bg-sky-100 rounded-4xl md:hidden">
      {dockItems.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to
        return (
          <button
            key={to}
            type="button"
            className={isActive ? 'dock-active' : ''}
            onClick={() => navigate(to)}
          >
            <Icon className="size-[1.2em]" />
            <span className="dock-label">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
