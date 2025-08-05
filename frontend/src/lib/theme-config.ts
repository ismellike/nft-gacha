/**
 * Custom HeroUI Theme Configuration
 * Defines glassmorphism variants and component customizations
 */

import { tv } from "tailwind-variants";

// Glassmorphism Button Variants
export const glassButton = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "backdrop-blur-xl rounded-xl transition-all duration-300 relative overflow-hidden",
    "focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background",
    "disabled:opacity-60 disabled:pointer-events-none",
  ],
  variants: {
    variant: {
      primary: [
        "bg-gradient-to-r from-warning to-orange-400 text-black font-medium",
        "shadow-[0_0_8px_rgba(255,191,0,0.25),0_0_16px_rgba(255,191,0,0.08)]",
        "hover:from-warning/90 hover:to-orange-500/90",
        "hover:shadow-[0_0_12px_rgba(255,191,0,0.3),0_0_24px_rgba(255,191,0,0.1)]",
        "data-[pressed=true]:scale-[0.97]",
      ],
      secondary: [
        "bg-content1/20 backdrop-blur-xl border border-white/20 text-foreground font-medium",
        "shadow-[0_0_6px_rgba(255,255,255,0.06),0_0_12px_rgba(255,255,255,0.03)]",
        "hover:bg-content1/30 hover:border-white/30",
        "hover:shadow-[0_0_8px_rgba(255,255,255,0.08),0_0_16px_rgba(255,255,255,0.04)]",
        "data-[pressed=true]:scale-[0.97]",
      ],
      danger: [
        "bg-danger/20 backdrop-blur-xl border border-danger/30 text-danger font-medium",
        "shadow-[0_0_6px_rgba(239,68,68,0.2),0_0_12px_rgba(239,68,68,0.08)]",
        "hover:bg-danger/30 hover:border-danger/40",
        "hover:shadow-[0_0_8px_rgba(239,68,68,0.25),0_0_16px_rgba(239,68,68,0.1)]",
        "data-[pressed=true]:scale-[0.97]",
      ],
      ghost: [
        "bg-transparent text-foreground/70 font-medium",
        "hover:bg-content1/20 hover:text-foreground",
        "data-[pressed=true]:scale-[0.97]",
      ],
    },
    size: {
      sm: "px-4 py-2 text-sm min-h-[36px]",
      md: "px-6 py-3 text-base min-h-[44px]",
      lg: "px-8 py-4 text-lg min-h-[52px]",
    },
    isLoading: {
      true: "cursor-wait",
    },
    animate: {
      true: "transition-transform",
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    animate: true,
  },
});

// Glassmorphism Card Variants
export const glassCard = tv({
  base: [
    "bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
    "transition-all duration-300",
  ],
  variants: {
    variant: {
      base: "",
      interactive: [
        "cursor-pointer",
        "hover:bg-content1/30 hover:border-white/20 hover:shadow-3xl",
        "focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background",
        "data-[pressed=true]:scale-[0.98]",
      ],
      highlight: [
        "border-warning/30 bg-gradient-to-r from-warning/10 to-orange-400/10",
        "shadow-xl shadow-warning/10",
      ],
      floating: [
        "shadow-xl shadow-black/20",
        "hover:shadow-2xl hover:shadow-black/30",
        "hover:-translate-y-1",
      ],
      error: [
        "bg-danger/10 border border-danger/20",
        "shadow-lg shadow-danger/5",
      ],
      success: [
        "bg-success/10 border border-success/20",
        "shadow-lg shadow-success/5",
      ],
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
    animate: {
      true: "transition-transform hover:scale-[1.02]",
      false: "",
    },
  },
  defaultVariants: {
    variant: "base",
    padding: "md",
    animate: false,
  },
});

// Glassmorphism Badge Variants
export const glassBadge = tv({
  base: [
    "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl",
    "backdrop-blur-xl border transition-all duration-200",
  ],
  variants: {
    variant: {
      primary: [
        "bg-gradient-to-r from-warning/20 to-orange-400/20",
        "border-warning/30 text-warning",
      ],
      secondary: [
        "bg-content1/20 border-white/20 text-foreground/80",
      ],
      success: [
        "bg-success/20 border-success/30 text-success",
      ],
      warning: [
        "bg-warning/20 border-warning/30 text-warning",
      ],
      danger: [
        "bg-danger/20 border-danger/30 text-danger",
      ],
      info: [
        "bg-primary/20 border-primary/30 text-primary",
      ],
    },
    size: {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-xs",
      lg: "px-4 py-2 text-sm",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// Glassmorphism Input Variants
export const glassInput = tv({
  base: [
    "bg-content1/20 backdrop-blur-xl border border-white/20 rounded-xl",
    "transition-all duration-200",
    "focus:bg-content1/30 focus:border-warning/50 focus:ring-2 focus:ring-warning/20",
    "placeholder:text-foreground/40",
  ],
  variants: {
    variant: {
      flat: "bg-content1/10",
      bordered: "border-2",
      underlined: "rounded-none border-0 border-b-2 bg-transparent",
    },
    size: {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-5 py-4 text-lg",
    },
    isInvalid: {
      true: [
        "border-danger/50 focus:border-danger/70",
        "focus:ring-danger/20",
      ],
    },
  },
  defaultVariants: {
    variant: "flat",
    size: "md",
  },
});

// Glassmorphism Modal Variants
export const glassModal = tv({
  slots: {
    wrapper: [
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-background/95 backdrop-blur-xl",
    ],
    backdrop: [
      "absolute inset-0 bg-black/40 backdrop-blur-sm",
      "data-[enter=true]:animate-in data-[enter=true]:fade-in-0",
      "data-[exit=true]:animate-out data-[exit=true]:fade-out-0",
    ],
    base: [
      "relative bg-content1/95 backdrop-blur-xl border border-white/20",
      "shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden",
      "data-[enter=true]:animate-in data-[enter=true]:zoom-in-95",
      "data-[exit=true]:animate-out data-[exit=true]:zoom-out-95",
    ],
    header: "flex flex-col gap-1 p-6 pb-2",
    body: "flex-1 px-6 py-2 overflow-auto",
    footer: "flex gap-2 p-6 pt-2",
  },
  variants: {
    size: {
      xs: { base: "max-w-xs" },
      sm: { base: "max-w-sm" },
      md: { base: "max-w-md" },
      lg: { base: "max-w-lg" },
      xl: { base: "max-w-xl" },
      "2xl": { base: "max-w-2xl" },
      full: { base: "w-full h-full max-w-none max-h-none rounded-none" },
    },
    placement: {
      center: { wrapper: "items-center justify-center" },
      top: { wrapper: "items-start justify-center pt-16" },
      bottom: { wrapper: "items-end justify-center pb-16" },
    },
  },
  defaultVariants: {
    size: "md",
    placement: "center",
  },
});

// Breadcrumb Variants
export const glassBreadcrumb = tv({
  slots: {
    base: "flex items-center space-x-2 text-sm",
    list: "flex items-center space-x-2",
    item: "flex items-center",
    link: [
      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
      "bg-content1/20 backdrop-blur-xl border border-white/10",
      "hover:bg-content1/30 hover:border-white/20",
      "focus:outline-none focus:ring-2 focus:ring-warning/50 focus:ring-offset-2 focus:ring-offset-background",
      "text-foreground/70 hover:text-foreground min-h-[36px] font-medium",
    ],
    current: [
      "flex items-center gap-2 px-3 py-2 rounded-lg",
      "bg-gradient-to-r from-warning/20 to-orange-400/20 border border-warning/30",
      "text-warning font-semibold",
    ],
    separator: "text-foreground/40 mx-1",
  },
});

// Navigation Variants
export const glassNavigation = tv({
  slots: {
    nav: [
      "bg-content1/30 backdrop-blur-xl border-b border-divider/50 shadow-lg",
      "flex justify-between items-center p-6",
    ],
    logo: [
      "flex items-center space-x-3 group",
    ],
    logoIcon: [
      "w-10 h-10 rounded-lg flex items-center justify-center",
      "group-hover:shadow-lg group-hover:shadow-warning/30 transition-all duration-200",
      "bg-gradient-to-r from-primary to-warning border border-warning/30",
    ],
    logoText: [
      "text-2xl font-bold tracking-tight transition-all duration-200",
      "bg-gradient-to-r from-foreground via-warning to-orange-400 bg-clip-text text-transparent",
      "group-hover:from-warning group-hover:to-orange-400",
    ],
    navItems: "hidden md:flex items-center space-x-2",
    navItem: [
      "relative px-4 py-2 rounded-xl transition-all duration-300",
    ],
    navItemContent: "flex items-center space-x-2",
    navItemText: "font-medium",
    activeIndicator: "absolute inset-0 rounded-xl",
  },
  variants: {
    itemState: {
      active: {
        navItem: [
          "bg-gradient-to-r from-warning/20 to-orange-400/20 backdrop-blur-xl",
          "border border-warning/30 shadow-lg shadow-warning/20",
        ],
        navItemText: "text-warning",
        activeIndicator: "bg-gradient-to-r from-warning/20 to-orange-400/20",
      },
      inactive: {
        navItem: [
          "hover:bg-content1/20 hover:backdrop-blur-xl border border-transparent",
          "hover:border-white/10 hover:shadow-lg hover:shadow-warning/10",
        ],
        navItemText: "text-foreground/70 hover:text-foreground",
      },
    },
  },
});

// Typography Variants
export const glassTypography = tv({
  variants: {
    variant: {
      mainHeading: [
        "text-3xl font-light text-foreground tracking-tight",
      ],
      secondaryHeading: [
        "text-2xl font-light text-foreground tracking-tight",
      ],
      accentHeading: [
        "text-xl font-bold bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent",
      ],
      body: "text-foreground",
      bodySecondary: "text-foreground/80",
      bodyMuted: "text-foreground/60",
      accent: "text-warning",
    },
  },
});

// Layout Container Variants
export const glassContainer = tv({
  variants: {
    variant: {
      main: "max-w-7xl mx-auto px-6",
      narrow: "max-w-4xl mx-auto px-6", 
      wide: "max-w-full px-6",
    },
  },
});

// Status/State Variants
export const glassStatus = tv({
  slots: {
    container: [
      "bg-content1/20 backdrop-blur-xl border shadow-lg rounded-xl p-4",
    ],
    text: "text-sm",
    icon: "",
  },
  variants: {
    variant: {
      error: {
        container: "bg-danger/10 border-danger/20 shadow-danger/5",
        text: "text-danger",
        icon: "text-danger",
      },
      success: {
        container: "bg-success/10 border-success/20 shadow-success/5", 
        text: "text-success",
        icon: "text-success",
      },
      loading: {
        container: "animate-pulse",
        text: "text-foreground/60",
        icon: "text-warning animate-spin",
      },
    },
  },
});

// Gradient Utilities
export const glassGradients = {
  primary: "bg-gradient-to-r from-warning to-orange-400",
  primaryText: "bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent",
  primaryGlow: "bg-gradient-to-r from-warning/20 to-orange-400/20",
  secondary: "bg-gradient-to-r from-primary to-warning",
  secondaryText: "bg-gradient-to-r from-foreground via-warning to-orange-400 bg-clip-text text-transparent",
  background: "bg-gradient-to-br from-background/95 to-background/80",
  content: "bg-gradient-to-r from-content1/40 via-background/95 to-content1/30",
} as const;

// Border Utilities  
export const glassBorders = {
  subtle: "border-white/10",
  medium: "border-white/20", 
  accent: "border-warning/30",
  danger: "border-danger/20",
} as const;

// Export all variants
export const glassTheme = {
  glassButton,
  glassCard,
  glassBadge,
  glassInput,
  glassModal,
  glassBreadcrumb,
  glassNavigation,
  glassTypography,
  glassContainer,
  glassStatus,
  glassGradients,
  glassBorders,
};