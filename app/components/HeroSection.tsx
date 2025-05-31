"use client";

import AnimatedGradientText from "./magicui/animated-gradient-text";

export default function HeroSection() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20 rounded-3xl" />
      
      {/* Main heading */}
      <div className="relative z-10 space-y-6">
        <AnimatedGradientText className="text-sm">
          🚀 Route Visualization Made Easy
        </AnimatedGradientText>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            GitThatFlow
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Instantly visualize your React app's routing structure. Paste any GitHub repository URL and get beautiful Mermaid diagrams of your routes.
        </p>

        <div className="mt-6">
          <p className="text-sm text-gray-500">
            👇 Try it with any public GitHub repository
          </p>
        </div>
      </div>
    </div>
  );
}
