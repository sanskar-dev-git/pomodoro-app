import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function Controls({ isRunning, onToggle, onReset }) {
  return (
    <div className="flex items-center gap-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white bg-slate-900 dark:bg-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all"
        aria-label={isRunning ? "Pause Timer" : "Start Timer"}
      >
        {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
        {isRunning ? 'Pause' : 'Start'}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1, rotate: -45 }}
        whileTap={{ scale: 0.9 }}
        onClick={onReset}
        className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition-colors"
        aria-label="Reset Timer"
      >
        <RotateCcw className="w-5 h-5" />
      </motion.button>
    </div>
  );
}