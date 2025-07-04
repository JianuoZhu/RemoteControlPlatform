//假设机器人有六个关节
import { motion } from "framer-motion";
import { useEffect, useState, useRef} from 'react';
import { getJointsStatus } from "../api";
type Joint = { name: string; angle: number; healthy: boolean };


export default function JointStatus() {
  const [joints, setJoints] = useState<Joint[]>([]);
  const intervalRef = useRef<null>(null);
  useEffect(() => {
    async function fetchJoints() {
      try {
        const data = await getJointsStatus();
        setJoints(data);
      } catch (error) {
        console.error("Failed to fetch joints status:", error);
      }
    }
    fetchJoints();
    intervalRef.current = setInterval(fetchJoints, 5000);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    //  className="p-4 bg-white dark:bg-slate-800 rounded shadow flex flex-col justify-between items-center"
      className="p-4 bg-white dark:bg-slate-800 rounded shadow flex flex-col items-center gap-14"
    >
      <ul className="space-y-1 mt-6 w-4/5 max-w-xs">
        {joints.map(j => (
          <li
            key={j.name}
            className={`flex justify-between px-3 py-1 rounded ${
              j.healthy
                ? "bg-emerald-900/30"
                : "bg-rose-900/30 animate-pulse"
            }`}
          >
            <span>{j.name}</span>
            <span>{j.angle}°</span>
          </li>
        ))}
      </ul>


      <p className="text-slate-600 dark:text-slate-300">关节状态</p>
    </motion.div>
  );
}
