/**
 * Reusable Glass Button Component
 * Implements consistent button styling with variants and smooth UX
 */

import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn, components, animations } from "../../lib/theme";
import { Loader2 } from "lucide-react";

interface GlassButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  loadingText?: string;
}

export function GlassButton({ 
  children, 
  variant = "primary", 
  size = "md",
  isLoading = false,
  isDisabled = false,
  className,
  animate = true,
  onClick,
  loadingText
}: GlassButtonProps) {
  const variantClasses = {
    primary: cn(
      "bg-gradient-to-r from-warning to-orange-400 text-black font-medium shadow-xl shadow-warning/20",
      "hover:from-warning/90 hover:to-orange-500/90",
      "disabled:from-gray-400 disabled:to-gray-500 disabled:text-gray-600",
      isLoading && "cursor-wait"
    ),
    secondary: cn(
      "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground font-medium",
      "hover:bg-content1/30 hover:border-white/30",
      "disabled:bg-content1/10 disabled:border-white/10 disabled:text-foreground/40",
      isLoading && "cursor-wait"
    ),
    danger: cn(
      "bg-danger/20 backdrop-blur-xl border border-danger/30 text-danger font-medium",
      "hover:bg-danger/30 hover:border-danger/40",
      "disabled:bg-danger/10 disabled:border-danger/20 disabled:text-danger/40",
      isLoading && "cursor-wait"
    )
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-8",
    md: "px-6 py-3 text-base min-h-10", 
    lg: "px-8 py-4 text-lg min-h-12"
  };

  const buttonClasses = cn(
    "backdrop-blur-xl rounded-xl transition-all duration-300 relative overflow-hidden",
    "focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background",
    variantClasses[variant],
    sizeClasses[size],
    animate && !isLoading && !isDisabled && "hover:scale-105 active:scale-95",
    (isLoading || isDisabled) && "opacity-80",
    className
  );

  const ButtonComponent = animate ? motion(Button) : Button;

  const motionProps = animate && !isLoading && !isDisabled ? {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring" as const, stiffness: 400, damping: 17 }
  } : {};

  // Content to display
  const buttonContent = isLoading ? (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{loadingText || "Loading..."}</span>
    </div>
  ) : children;

  return (
    <ButtonComponent
      className={buttonClasses}
      isLoading={false} // Handle loading state manually for better control
      isDisabled={isDisabled || isLoading}
      onPress={onClick}
      {...motionProps}
    >
      {/* Shimmer effect for primary variant */}
      {variant === "primary" && !isLoading && !isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out" />
      )}
      
      <span className="relative z-10">
        {buttonContent}
      </span>
    </ButtonComponent>
  );
}