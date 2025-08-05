/**
 * Legacy theme utilities - maintained for backward compatibility
 * New components should use the HeroUI custom variants system in theme-config.ts
 */

// Design tokens for glassmorphism effects
export const glassmorphism = {
  // Card variants
  card: {
    base: "bg-content1/20 backdrop-blur-xl border border-white/10 shadow-2xl",
    hover: "hover:bg-content1/30 hover:border-white/20 hover:shadow-3xl transition-all duration-300",
    interactive: "cursor-pointer transition-all duration-200"
  },
  
  // Navigation variants
  nav: {
    base: "bg-content1/30 backdrop-blur-xl border-b border-divider/50 shadow-lg",
    item: "bg-content1/20 backdrop-blur-xl border border-white/10 hover:border-white/20"
  },
  
  // Modal variants
  modal: {
    overlay: "bg-background/95 backdrop-blur-xl",
    content: "bg-content1/95 backdrop-blur-xl border border-white/20 shadow-2xl"
  },
  
  // Input variants
  input: {
    base: "bg-content1/10 backdrop-blur-xl border border-white/20 focus:border-warning/50",
    focus: "focus:bg-content1/20 focus:shadow-lg"
  }
} as const;

// Color schemes and gradients
export const colors = {
  // Primary gradients (warning/orange theme)
  gradients: {
    primary: "bg-gradient-to-r from-warning to-orange-400",
    primaryText: "bg-gradient-to-r from-warning to-orange-400 bg-clip-text text-transparent",
    primaryGlow: "bg-gradient-to-r from-warning/20 to-orange-400/20",
    
    // Secondary gradients
    secondary: "bg-gradient-to-r from-primary to-warning",
    secondaryText: "bg-gradient-to-r from-foreground to-warning bg-clip-text text-transparent",
    
    // Background gradients
    background: "bg-gradient-to-br from-background/95 to-background/80",
    content: "bg-gradient-to-r from-content1/40 via-background/95 to-content1/30"
  },
  
  // Border colors
  borders: {
    subtle: "border-white/10",
    medium: "border-white/20",
    accent: "border-warning/30",
    danger: "border-danger/20"
  },
  
  // Text colors
  text: {
    primary: "text-foreground",
    secondary: "text-foreground/80",
    muted: "text-foreground/60",
    accent: "text-warning"
  }
} as const;

// Animation classes
export const animations = {
  // Floating animations
  float: {
    gentle: "animate-float",
    subtle: "float-gentle"
  },
  
  // Loading animations
  loading: {
    spin: "animate-spin",
    pulse: "animate-pulse",
    wobble: "spin-wobble"
  },
  
  // Interaction animations
  interaction: {
    hover: "transition-all duration-300",
    press: "transition-all duration-150",
    bounce: "animate-bounce"
  }
} as const;

// Component style variants
export const components = {
  // Button variants
  button: {
    primary: `${glassmorphism.card.base} ${colors.gradients.primary} text-black font-medium px-6 py-3 rounded-xl ${animations.interaction.hover}`,
    secondary: `${glassmorphism.card.base} ${colors.borders.medium} ${colors.text.primary} font-medium px-6 py-3 rounded-xl ${animations.interaction.hover}`,
    danger: `${glassmorphism.card.base} bg-danger/20 ${colors.borders.danger} text-danger font-medium px-6 py-3 rounded-xl ${animations.interaction.hover}`
  },
  
  // Card variants
  card: {
    base: glassmorphism.card.base,
    interactive: `${glassmorphism.card.base} ${glassmorphism.card.hover} ${glassmorphism.card.interactive}`,
    highlight: `${glassmorphism.card.base} ${colors.borders.accent} ${colors.gradients.primaryGlow}`
  },
  
  // Header variants
  header: {
    main: `text-3xl font-light ${colors.text.primary} tracking-tight`,
    secondary: `text-2xl font-light ${colors.text.primary} tracking-tight`,
    accent: `text-xl font-bold ${colors.gradients.primaryText}`
  },
  
  // Badge variants
  badge: {
    primary: `${glassmorphism.card.base} ${colors.gradients.primaryGlow} ${colors.borders.accent} px-4 py-2 rounded-xl`,
    info: `${glassmorphism.card.base} ${colors.borders.medium} px-4 py-2 rounded-xl`,
    success: `${glassmorphism.card.base} border-success/30 bg-success/10 px-4 py-2 rounded-xl`
  }
} as const;

// Layout and spacing
export const layout = {
  // Container variants
  container: {
    main: "max-w-7xl mx-auto px-6",
    narrow: "max-w-4xl mx-auto px-6",
    wide: "max-w-full px-6"
  },
  
  // Grid variants
  grid: {
    main: "grid lg:grid-cols-2 gap-16 items-start",
    cards: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    list: "space-y-4"
  },
  
  // Spacing
  spacing: {
    section: "space-y-16",
    component: "space-y-8",
    element: "space-y-4"
  }
} as const;

// Utility functions for combining classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Theme variants for different contexts
export const variants = {
  // Error states
  error: {
    container: `${glassmorphism.card.base} bg-danger/10 ${colors.borders.danger}`,
    text: "text-danger text-sm",
    icon: "text-danger"
  },
  
  // Success states
  success: {
    container: `${glassmorphism.card.base} bg-success/10 border-success/30`,
    text: "text-success text-sm",
    icon: "text-success"
  },
  
  // Loading states
  loading: {
    container: `${glassmorphism.card.base} ${animations.loading.pulse}`,
    text: `${colors.text.muted} text-sm`,
    spinner: `${animations.loading.spin} text-warning`
  }
} as const;

// Responsive utilities
export const responsive = {
  // Hide/show utilities
  mobile: "block md:hidden",
  desktop: "hidden md:block",
  
  // Grid responsive
  gridCols: {
    responsive: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  },
  
  // Text responsive
  text: {
    heading: "text-2xl md:text-3xl lg:text-4xl",
    subheading: "text-lg md:text-xl lg:text-2xl",
    body: "text-sm md:text-base"
  }
} as const;