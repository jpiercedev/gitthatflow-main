"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-unused-vars */

interface ShimmerButtonProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  className,
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  borderRadius = "100px",
  shimmerDuration = "3s",
  background = "rgba(0, 0, 0, 1)",
  onClick,
  disabled = false,
  type = "button",
}) => {
  return (
    <button
      type={type}
      className={cn(
        "group relative overflow-hidden rounded-full px-6 py-3 text-white transition-all duration-300 ease-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      style={{
        borderRadius,
        background,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      <div
        className="absolute inset-0 -top-[2px] -bottom-[2px] -left-[2px] -right-[2px] rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          animation: `shimmer ${shimmerDuration} infinite`,
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </button>
  );
};

export { ShimmerButton };
