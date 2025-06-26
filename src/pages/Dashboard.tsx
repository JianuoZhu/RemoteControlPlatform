export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">状态监控看板</h1>
      <div className="grid grid-cols-3 gap-4">
        {/* 电量/关节状态/任务队列 等卡片 */}
        <div className="p-4 bg-white rounded shadow">电量仪表盘（Placeholder）</div>
        <div className="p-4 bg-white rounded shadow">关节状态（Placeholder）</div>
        <div className="p-4 bg-white rounded shadow">任务队列（Placeholder）</div>
      </div>
    </div>
  )
}
