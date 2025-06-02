"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/* eslint-disable @typescript-eslint/no-unused-vars */

interface AnimatedBeamProps {
  className?: string;
  containerRef?: React.RefObject<HTMLElement>;
  fromRef?: React.RefObject<HTMLElement>;
  toRef?: React.RefObject<HTMLElement>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className,
      )}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      style={{
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient
          id={`gradient-${Math.random()}`}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          x2="100%"
          y1="0%"
          y2="0%"
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <motion.path
        d="M 10,50 Q 50,10 90,50"
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatType: reverse ? "reverse" : "loop",
          ease: "easeInOut",
        }}
      />
      
      <motion.path
        d="M 10,50 Q 50,10 90,50"
        stroke={`url(#gradient-${Math.random()})`}
        strokeWidth={pathWidth + 1}
        fill="none"
        initial={{ pathLength: 0, pathOffset: 1 }}
        animate={{ pathLength: 1, pathOffset: 0 }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatType: reverse ? "reverse" : "loop",
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}
