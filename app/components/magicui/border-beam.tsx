"use client";

import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-unused-vars */

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  reverse?: boolean;
  initialOffset?: number;
}

export function BorderBeam({
  className,
  size = 50,
  duration = 6,
  delay = 0,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  reverse = false,
  initialOffset = 0,
}: BorderBeamProps) {
  const id = `border-beam-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor={colorFrom} />
            <stop offset="60%" stopColor={colorTo} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="12"
          ry="12"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="1"
          strokeDasharray="25 75"
          style={{
            animation: `border-beam-dash ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        />
      </svg>

      <style jsx>{`
        @keyframes border-beam-dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 100;
          }
        }
      `}</style>
    </div>
  );
}
