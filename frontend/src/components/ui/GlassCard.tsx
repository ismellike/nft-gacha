/**
 * Reusable Glass Card Component
 * Implements glassmorphism styling using HeroUI's custom variants system
 */

import { Card, CardBody, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { glassCard } from "../../lib/theme-config";

interface GlassCardProps {
  children: ReactNode;
  header?: ReactNode;
  variant?: "base" | "interactive" | "highlight" | "floating" | "error" | "success";
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
  // Generate classes using our custom variant system
  const cardStyles = glassCard({
    variant,
    padding,
    animate,
    className,
  });

  const CardComponent = animate ? motion(Card) : Card;

  const motionProps = animate ? {
    whileHover: { scale: 1.02 },
    transition: { type: "spring" as const, stiffness: 400, damping: 17 }
  } : {};

  return (
    <CardComponent 
      className={cardStyles} 
      isPressable={!!onClick}
      onPress={onClick}
      {...motionProps}
    >
      {header && (
        <CardHeader className={padding === "none" ? "p-6 pb-0" : "pb-6"}>
          {header}
        </CardHeader>
      )}
      <CardBody className={header ? "pt-0" : ""}>
        {children}
      </CardBody>
    </CardComponent>
  );
}