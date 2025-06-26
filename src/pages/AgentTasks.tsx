export default function AgentTasks() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Agent 任务调度</h1>
      <ul className="space-y-2">
        <li className="p-4 bg-white rounded shadow">任务解析模块（LLM → 动作序列）</li>
        <li className="p-4 bg-white rounded shadow">优先级管理（紧急任务插队）</li>
      </ul>
    </div>
  )
}
