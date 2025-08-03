/**
 * Reusable Glass Badge Component
 * Implements consistent badge styling with variants and smooth animations
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn, glassmorphism, colors } from "../../lib/theme";

interface GlassBadgeProps {
  children: ReactNode;
  variant?: "primary" | "info" | "success" | "warning" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
  glow?: boolean;
  pulse?: boolean;
}

export function GlassBadge({ 
  children, 
  variant = "info", 
  size = "md",
  className,
  animate = false,
  glow = false,
  pulse = false
}: GlassBadgeProps) {
  const variantClasses = {
    primary: `${glassmorphism.card.base} bg-gradient-to-r from-warning/20 to-orange-400/20 border-warning/30 text-warning`,
    info: `${glassmorphism.card.base} border-white/20 text-foreground/80`,
    success: `${glassmorphism.card.base} border-success/30 bg-success/10 text-success`,
    warning: `${glassmorphism.card.base} border-warning/30 bg-warning/10 text-warning`,
    danger: `${glassmorphism.card.base} border-danger/30 bg-danger/10 text-danger`
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs rounded-md",
    sm: "px-2 py-1 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl"
  };

  const glowClasses = glow ? "shadow-xl shadow-current/30" : "";
  const pulseClasses = pulse ? "animate-pulse" : "";

  const badgeClasses = cn(
    "inline-flex items-center font-medium transition-all duration-300",
    variantClasses[variant],
    sizeClasses[size],
    glowClasses,
    pulseClasses,
    className
  );

  const BadgeComponent = animate ? motion.div : "div";

  const motionProps = animate ? {
    whileHover: { scale: 1.05 },
    transition: { type: "spring" as const, stiffness: 400, damping: 17 }
  } : {};

  return (
    <BadgeComponent className={badgeClasses} {...motionProps}>
      {children}
    </BadgeComponent>
  );
}