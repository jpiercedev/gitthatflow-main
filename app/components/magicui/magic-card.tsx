"use client";

import React, { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

const MagicCard: React.FC<MagicCardProps> = ({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
}) => {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mounted) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      e.currentTarget.style.setProperty("--x", `${x}px`);
      e.currentTarget.style.setProperty("--y", `${y}px`);
    },
    [mounted],
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex size-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
        "before:absolute before:size-full before:opacity-0 before:transition-opacity before:duration-500 before:content-['']",
        "before:bg-[radial-gradient(var(--gradientSize)px_circle_at_var(--x)_var(--y),var(--gradientColor),transparent_40%)]",
        "hover:before:opacity-[var(--gradientOpacity)]",
        className,
      )}
      style={
        {
          "--gradientSize": `${gradientSize}`,
          "--gradientColor": gradientColor,
          "--gradientOpacity": gradientOpacity,
        } as React.CSSProperties
      }
    >
      <div className="relative z-10 size-full">{children}</div>
    </div>
  );
};

export { MagicCard };
