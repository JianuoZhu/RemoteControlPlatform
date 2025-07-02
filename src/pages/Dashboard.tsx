import BatteryGauge from "../components/BatteryGauge";
import JointStatus  from "../components/JointStatus";
import TaskQueue    from "../components/TaskQueue";


export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">状态监控看板</h1>
      
    {/* 三列卡片区域 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BatteryGauge />
      <JointStatus />
      <TaskQueue />
    </div>
    </div>
  )
}
