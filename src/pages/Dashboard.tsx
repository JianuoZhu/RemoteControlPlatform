import { useState } from "react";
import { Button, Card, Badge } from "flowbite-react";
import { HiExclamation, HiBell } from "react-icons/hi";
import BatteryGauge from "../components/BatteryGauge";
import JointStatus  from "../components/JointStatus";
import TaskQueue    from "../components/TaskQueue";
import { triggerEmergencyAlert } from "../api";

export default function Dashboard() {
  const [triggering, setTriggering] = useState(false);

  const handleEmergencyAlert = async () => {
    if (window.confirm('确定要触发紧急报警吗？这将发送通知给所有配置的联系人。')) {
      setTriggering(true);
      try {
        await triggerEmergencyAlert('emergency_fall', {
          location: '客厅',
          severity: 'critical',
          description: '检测到老人摔倒，需要立即关注'
        });
        alert('紧急报警已触发！');
      } catch (error) {
        console.error('Failed to trigger emergency alert:', error);
        alert('触发紧急报警失败');
      } finally {
        setTriggering(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">状态监控看板</h1>
        <div className="flex gap-2">
          <Button 
            color="warning" 
            size="sm"
            onClick={handleEmergencyAlert}
            disabled={triggering}
            className="flex items-center gap-2"
          >
            <HiExclamation className="h-4 w-4" />
            {triggering ? '触发中...' : '紧急报警'}
          </Button>
        </div>
      </div>
      
      {/* 紧急报警状态卡片 */}
      <Card className="border-l-4 border-l-red-500">
        <div className="flex items-center gap-3">
          <HiBell className="h-6 w-6 text-red-500" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">紧急报警系统</h3>
            <p className="text-sm text-gray-600">监控老人安全状态，发现异常时自动报警</p>
          </div>
          <Badge color="green" className="text-xs">
            正常运行
          </Badge>
        </div>
      </Card>
      
      {/* 三列卡片区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BatteryGauge />
        <JointStatus />
        <TaskQueue />
      </div>
    </div>
  )
}
