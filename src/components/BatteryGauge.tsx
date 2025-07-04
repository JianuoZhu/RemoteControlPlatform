import { motion } from "framer-motion";// 0–100
import { useEffect, useState, useRef} from 'react';
import { getBatteryStatus } from "../api";
export default function BatteryGauge() {
  const [level, setLevel] = useState(0);
  const intervalRef = useRef<null>(null);
  useEffect(() => {
    async function fetchBattery() {
      try {
        const data = await getBatteryStatus();
        setLevel(data.level);
      } catch (error) {
        console.error("Failed to fetch battery status:", error);
      }
    }
    fetchBattery();
    intervalRef.current = setInterval(fetchBattery, 5000);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const deg = (level / 100) * 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white dark:bg-slate-800 rounded shadow flex flex-col items-center"
    >
      <div
        className="relative w-40 h-40 rounded-full"
        style={{
          background: `conic-gradient(#16a34a ${deg}deg, #e5e7eb ${deg}deg)`,
        }}
      >
        {/* 留个白心，让它像仪表盘 */}
        <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-700 dark:text-slate-200">
            {level}%
          </span>
        </div>
      </div>
      <p className="mt-4 text-slate-600 dark:text-slate-300">电量</p>
    </motion.div>
  );
}
