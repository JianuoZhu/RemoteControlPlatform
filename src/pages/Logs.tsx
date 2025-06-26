export default function Logs() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">执行日志系统</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="p-2">时间</th>
            <th className="p-2">任务类型</th>
            <th className="p-2">状态</th>
            <th className="p-2">耗时</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">--:--:--</td>
            <td className="p-2">示例任务</td>
            <td className="p-2">成功</td>
            <td className="p-2">123ms</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
