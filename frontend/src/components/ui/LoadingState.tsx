/**
 * Loading State Component
 * Provides consistent loading indicators with glassmorphism styling
 */

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/theme";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  variant?: "spinner" | "dots" | "pulse";
  fullScreen?: boolean;
}

export function LoadingState({ 
  size = "md", 
  text, 
  className,
  variant = "spinner",
  fullScreen = false
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const containerClasses = cn(
    "flex flex-col items-center justify-center space-y-3",
    fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
    className
  );

  const SpinnerComponent = () => (
    <Loader2 className={cn(sizeClasses[size], "animate-spin text-warning")} />
  );

  const DotsComponent = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            "bg-warning rounded-full",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );

  const PulseComponent = () => (
    <motion.div
      className={cn(
        "bg-gradient-to-r from-warning/20 to-orange-400/20 backdrop-blur-xl border border-warning/30 rounded-full",
        sizeClasses[size]
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  const renderVariant = () => {
    switch (variant) {
      case "dots":
        return <DotsComponent />;
      case "pulse":
        return <PulseComponent />;
      default:
        return <SpinnerComponent />;
    }
  };

  return (
    <div className={containerClasses}>
      {renderVariant()}
      {text && (
        <motion.p 
          className={cn(
            "text-foreground/70 font-medium",
            textSizeClasses[size]
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}