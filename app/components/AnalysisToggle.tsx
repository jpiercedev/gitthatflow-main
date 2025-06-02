"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AnalysisMode = 'github' | 'website';

interface AnalysisToggleProps {
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  className?: string;
}

export default function AnalysisToggle({ mode, onModeChange, className }: AnalysisToggleProps) {
  return (
    <motion.div 
      className={cn("relative flex items-center justify-center", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative bg-black/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-2 flex">
        {/* Background slider */}
        <motion.div
          className="absolute top-2 bottom-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl pointer-events-none"
          initial={false}
          animate={{
            left: mode === 'github' ? '8px' : '50%',
            width: mode === 'github' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        
        {/* GitHub Button */}
        <button
          onClick={() => {
            console.log('GitHub button clicked, changing mode to github')
            onModeChange('github')
          }}
          className={cn(
            "relative z-10 flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
            mode === 'github'
              ? "text-white"
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          <span className="text-lg">🔗</span>
          <span>GitHub Analysis</span>
        </button>

        {/* Website Button */}
        <button
          onClick={() => {
            console.log('Website button clicked, changing mode to website')
            onModeChange('website')
          }}
          className={cn(
            "relative z-10 flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
            mode === 'website'
              ? "text-white"
              : "text-gray-400 hover:text-gray-200"
          )}
        >
          <span className="text-lg">🌐</span>
          <span>Website Flow</span>
        </button>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 pointer-events-none" />
    </motion.div>
  );
}
