"use client";

import AnimatedGradientText from "./magicui/animated-gradient-text";
import { BorderBeam } from "./magicui/border-beam";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center px-4">
      {/* Seamless header layout */}
      <motion.div
        className="flex flex-col md:flex-row items-center justify-between w-full space-y-4 md:space-y-0 md:space-x-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Left side - Branding */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                GitThatFlow
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatedGradientText className="text-xs">
              🚀 Route & Flow Visualization
            </AnimatedGradientText>
          </motion.div>
        </div>

        {/* Right side - Quick description and features */}
        <motion.div
          className="flex-1 text-center md:text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm md:text-base text-gray-300 mb-3 max-w-md md:ml-auto">
            Transform GitHub repos into interactive diagrams or map website flows
            <span className="text-blue-400 font-medium"> (up to 30 pages)</span>
          </p>

          <div className="flex items-center justify-center md:justify-end space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
              React Router
            </span>
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
              Next.js
            </span>
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1.5"></span>
              Website Flows
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
