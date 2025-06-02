"use client";

import { MagicCard } from "./magicui/magic-card";
import { NeonGradientCard } from "./magicui/neon-gradient-card";

/**
 * FeatureShowcase Component
 * 
 * A reusable component that displays GitThatFlow's key features in an interactive grid layout.
 * Extracted from the main page to improve layout flexibility and component reusability.
 * 
 * Features:
 * - 6 feature cards showcasing different capabilities
 * - Interactive hover effects with MagicCard and NeonGradientCard
 * - Technology badges showing the tech stack
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
 * 
 * Usage:
 * ```tsx
 * import FeatureShowcase from './components/FeatureShowcase'
 * 
 * function AboutPage() {
 *   return (
 *     <div>
 *       <h1>About GitThatFlow</h1>
 *       <FeatureShowcase />
 *     </div>
 *   )
 * }
 * ```
 */

const features = [
  {
    title: "Website Flow Analysis",
    description: "Discover navigation paths and user journeys by crawling any website. Interactive React Flow visualization with up to 30 pages.",
    icon: "🌐",
    type: "neon" as const,
    gradient: true,
  },
  {
    title: "Next.js App Router",
    description: "Full support for Next.js 13+ App Router structure with nested layouts and route groups.",
    icon: "⚡",
    type: "magic" as const,
  },
  {
    title: "React Router",
    description: "Visualize React Router configurations including nested routes and dynamic segments.",
    icon: "🔄",
    type: "magic" as const,
  },
  {
    title: "Next.js Pages",
    description: "Classic Next.js Pages Router with file-based routing and API routes visualization.",
    icon: "📄",
    type: "magic" as const,
  },
  {
    title: "GitHub Integration",
    description: "Direct repository analysis from GitHub URLs with intelligent file parsing and caching.",
    icon: "🔗",
    type: "magic" as const,
  },
  {
    title: "Interactive Diagrams",
    description: "Beautiful, unified React Flow visualizations with drag, zoom, and pan controls for both code and website analysis.",
    icon: "📊",
    type: "magic" as const,
  },
];

const techBadges = [
  { name: "Next.js", icon: "⚡" },
  { name: "React", icon: "⚛️" },
  { name: "React Flow", icon: "🌊" },
  { name: "GitHub API", icon: "🐙" },
  { name: "TypeScript", icon: "🔷" },
  { name: "Tailwind CSS", icon: "🎨" },
  { name: "Supabase", icon: "💾" },
];

interface FeatureShowcaseProps {
  /**
   * Optional className for additional styling
   */
  className?: string;
  /**
   * Whether to show the technology badges section
   * @default true
   */
  showTechBadges?: boolean;
  /**
   * Custom title for the showcase section
   */
  title?: string;
  /**
   * Custom subtitle/description for the showcase section
   */
  subtitle?: string;
}

export default function FeatureShowcase({ 
  className = "",
  showTechBadges = true,
  title,
  subtitle
}: FeatureShowcaseProps) {
  return (
    <div className={`relative px-4 py-12 ${className}`}>
      {/* Optional Header */}
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
      )}

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {features.map((feature, index) => {
          if (feature.type === "neon" && feature.gradient) {
            return (
              <NeonGradientCard
                key={index}
                className="group cursor-pointer"
                neonColors={{
                  firstColor: "#ff0080",
                  secondColor: "#7928ca",
                }}
              >
                <div className="p-6 h-full">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{feature.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  {feature.title === "Website Flow Analysis" && (
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-teal-600 text-white">
                      NEW
                    </div>
                  )}
                </div>
              </NeonGradientCard>
            );
          }

          return (
            <MagicCard
              key={index}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              gradientColor="#1a1a2e"
              gradientOpacity={0.6}
            >
              <div className="p-6 h-full">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </MagicCard>
          );
        })}
      </div>

      {/* Tech Badges */}
      {showTechBadges && (
        <div className="flex flex-wrap justify-center gap-4 mt-12 max-w-4xl mx-auto">
          {techBadges.map((tech, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <span className="text-sm">{tech.icon}</span>
              <span className="text-sm font-medium text-gray-300">{tech.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Export the feature data for potential reuse in other components
 */
export { features, techBadges };

/**
 * Export type definitions for external usage
 */
export type { FeatureShowcaseProps };
