import { Outlet, NavLink } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="h-screen flex">
      {/* 侧边导航 */}
      <aside className="w-40 bg-gray-800 text-white flex flex-col">
        {/* 标题区域与导航分割 */}
        <h2 className="text-xl font-semibold p-4 border-b border-gray-700">
          远程操控平台
        </h2>

        {/* 等高分布的导航按钮 */}
        <nav className="flex-1 flex flex-col">
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center border-b border-gray-700 hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              } last:border-none`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="video-control"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center border-b border-gray-700 hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              } last:border-none`
            }
          >
            视频监控
          </NavLink>

          <NavLink
            to="agent-tasks"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center border-b border-gray-700 hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              } last:border-none`
            }
          >
            Agent 任务
          </NavLink>

          <NavLink
            to="remote-control"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center border-b border-gray-700 hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              } last:border-none`
            }
          >
            远程控制
          </NavLink>

          <NavLink
            to="logs"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              }`
            }
          >
            执行日志
          </NavLink>
        </nav>
      </aside>

      {/* 主体内容 */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
