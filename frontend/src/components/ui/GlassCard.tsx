/**
 * Reusable Glass Card Component
 * Implements consistent glassmorphism styling with variants and smooth interactions
 */

import { Card, CardBody, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn, glassmorphism, animations } from "../../lib/theme";

interface GlassCardProps {
  children: ReactNode;
  header?: ReactNode;
  variant?: "base" | "interactive" | "highlight" | "floating";
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({ 
  children, 
  header, 
  variant = "base", 
  className,
  animate = false,
  onClick,
  padding = "md"
}: GlassCardProps) {
  const baseClasses = glassmorphism.card.base;
  const variantClasses = {
    base: "",
    interactive: cn(
      glassmorphism.card.hover, 
      glassmorphism.card.interactive,
      "focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background"
    ),
    highlight: "border-warning/30 bg-gradient-to-r from-warning/10 to-orange-400/10 shadow-xl shadow-warning/10",
    floating: "shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transform hover:-translate-y-1"
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6", 
    lg: "p-8"
  };

  const cardClasses = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    "transition-all duration-300",
    onClick && "cursor-pointer",
    className
  );

  const CardComponent = animate ? motion(Card) : Card;

  const motionProps = animate ? {
    whileHover: variant === "interactive" ? { scale: 1.02, y: -2 } : { scale: 1.01 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 400, damping: 17 }
  } : {};

  return (
    <CardComponent 
      className={cardClasses} 
      isPressable={!!onClick}
      onPress={onClick}
      {...motionProps}
    >
      {header && (
        <CardHeader className={cn("pb-6", padding === "none" && "p-6 pb-0")}>
          {header}
        </CardHeader>
      )}
      <CardBody className={cn(padding === "none" ? "p-6" : "", header ? "pt-0" : "")}>
        {children}
      </CardBody>
    </CardComponent>
  );
}