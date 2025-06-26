import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard     from './pages/Dashboard'
import VideoControl  from './pages/VideoControl'
import AgentTasks    from './pages/AgentTasks'
import RemoteControl from './pages/RemoteControl'
import Logs          from './pages/Logs'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<Dashboard />} />
        <Route path="video-control" element={<VideoControl />} />
        <Route path="agent-tasks"   element={<AgentTasks />} />
        <Route path="remote-control"element={<RemoteControl />} />
        <Route path="logs"          element={<Logs />} />
      </Route>
    </Routes>
  )
}
