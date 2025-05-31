"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface NeonGradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * @default <div />
   */
  as?: React.ElementType;
  /**
   * @default ""
   */
  className?: string;
  /**
   * @default ""
   */
  children?: React.ReactNode;
  /**
   * @default 5
   */
  borderSize?: number;
  /**
   * @default 20
   */
  borderRadius?: number;
  /**
   * @default "purple"
   */
  neonColors?: {
    firstColor: string;
    secondColor: string;
  };
}

const NeonGradientCard: React.FC<NeonGradientCardProps> = ({
  className,
  children,
  borderSize = 2,
  borderRadius = 20,
  neonColors = {
    firstColor: "#ff00aa",
    secondColor: "#00FFF1",
  },
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative z-10 h-fit w-fit rounded-[var(--border-radius)] bg-white p-[var(--border-size)] dark:bg-black",
        className,
      )}
      style={
        {
          "--border-size": `${borderSize}px`,
          "--border-radius": `${borderRadius}px`,
          "--neon-first-color": neonColors.firstColor,
          "--neon-second-color": neonColors.secondColor,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        className={cn(
          "relative z-20 h-full w-full rounded-[calc(var(--border-radius)-var(--border-size))] bg-gray-100 p-3 dark:bg-gray-900",
        )}
      >
        {children}
      </div>

      {/* Gradient border */}
      <div
        className={cn(
          "absolute inset-0 z-0 rounded-[var(--border-radius)] p-[var(--border-size)]",
          "bg-gradient-to-r from-[var(--neon-first-color)] via-purple-500 to-[var(--neon-second-color)]",
          "before:absolute before:inset-0 before:rounded-[var(--border-radius)] before:p-[var(--border-size)]",
          "before:bg-gradient-to-r before:from-[var(--neon-first-color)] before:via-purple-500 before:to-[var(--neon-second-color)]",
          "before:blur-md before:brightness-150",
          "animate-background-position-spin",
        )}
      />
    </div>
  );
};

export { NeonGradientCard };
