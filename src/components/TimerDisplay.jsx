import React from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../utils/formatTime';

export function TimerDisplay({ timeLeft, totalDuration, sessionType, themeColor }) {
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress percentage (0 to 1)
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center w-80 h-80 my-8">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
        <circle
          cx="160"
          cy="160"
          r={radius}
          className="stroke-gray-200 dark:stroke-gray-800"
          strokeWidth="12"
          fill="transparent"
        />
        <motion.circle
          cx="160"
          cy="160"
          r={radius}
          stroke={themeColor}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'linear' }}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold tracking-widest uppercase opacity-75 mb-1">
          {sessionType ? sessionType.replace('_', ' ') : ''}
        </span>
        <motion.h1 
          key={timeLeft}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-extrabold tracking-tighter font-mono"
        >
          {formatTime(timeLeft)}
        </motion.h1>
      </div>
    </div>
  );
}