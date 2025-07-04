import { motion } from "framer-motion";
import { useEffect, useState, useRef} from 'react';
import { getTasks } from "../api";
type Task = { id: string; title: string; state: "queued" | "running" | "done" };

export default function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const intervalRef =useRef<null>(null);
  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    }
    fetchTasks();
    intervalRef.current = setInterval(fetchTasks, 5000);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  const badge = (s: Task["state"]) => {
    const map = {
      queued: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300",
      running: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
      done: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    };
    return map[s];
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white dark:bg-slate-800 rounded shadow
                 flex flex-col items-center gap-13"
    >
      <ul className="space-y-1 mt-6 w-4/5 max-w-xs">
        {tasks.map(t => (
          <li key={t.id} className="flex justify-between items-center px-3 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <span>{t.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${badge(t.state)}`}>{t.state}</span>
          </li>
        ))}
      </ul>
      <p className="text-slate-600 dark:text-slate-300">任务队列</p>
    </motion.div>
  );
}
