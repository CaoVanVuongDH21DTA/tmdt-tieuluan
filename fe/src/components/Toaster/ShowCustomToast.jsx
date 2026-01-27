import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

export function showCustomToast(message, type = "info") {
  toast.custom((t) => <CustomToast t={t} message={message} type={type} />, {
    duration: 5000,
  });
}

function CustomToast({ t, message, type }) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const duration = 5000; 
  const remainingTimeRef = useRef(duration); 
  const lastTimestampRef = useRef(Date.now()); 

  const colorMap = {
    success: { bar: "bg-green-500", icon: <CheckCircleIcon className="text-green-500" /> },
    error: { bar: "bg-red-500", icon: <ErrorIcon className="text-red-500" /> },
    warning: { bar: "bg-yellow-500", icon: <WarningIcon className="text-yellow-500" /> },
    info: { bar: "bg-blue-500", icon: <InfoIcon className="text-blue-500" /> },
  };
  const { bar, icon } = colorMap[type] || colorMap.info;

  useEffect(() => {
    let rafId;

    const tick = () => {
      if (!isPaused) {
        const now = Date.now();
        const delta = now - lastTimestampRef.current; 
        remainingTimeRef.current -= delta; 
        lastTimestampRef.current = now;

        const newProgress = Math.max((remainingTimeRef.current / duration) * 100, 0);
        setProgress(newProgress);

        if (remainingTimeRef.current <= 0) {
          toast.dismiss(t.id);
          return;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused, t.id]);

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
    lastTimestampRef.current = Date.now(); 
  };

  return (
    <AnimatePresence>
      {t.visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          className="bg-white shadow-lg rounded-lg p-4 w-80 relative flex items-start gap-3 border-l-4"
          style={{
            borderColor:
              type === "success"
                ? "#22c55e"
                : type === "error"
                ? "#ef4444"
                : type === "warning"
                ? "#eab308"
                : "#3b82f6",
          }}
        >
          <div className="pt-0.5">{icon}</div>
          <p className="text-gray-800 text-sm flex-1 break-words">
            {message || "Thông báo"}
          </p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <CloseIcon fontSize="small" />
          </button>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 overflow-hidden rounded-b-lg">
            <motion.div className={`h-full ${bar}`} style={{ width: `${progress}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
