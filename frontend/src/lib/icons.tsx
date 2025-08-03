/**
 * Icon utilities and mappings for the application
 * Uses Lucide React for consistent, beautiful icons
 */

import React from 'react';
import {
  Dice6,
  Coins,
  Wallet,
  Settings,
  TrendingUp,
  Trophy,
  Gem,
  Star,
  Sparkles,
  Crown,
  Gift,
  Zap,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Menu,
  Home,
  User,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Download,
  Upload,
  Share,
  Heart,
  Bookmark,
  Flag,
  MessageCircle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Loader2,
  type LucideIcon
} from 'lucide-react';

// Icon size configurations
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40
} as const;

export type IconSize = keyof typeof iconSizes;

// Icon component props
export interface IconProps {
  size?: IconSize | number;
  className?: string;
  strokeWidth?: number;
}

// Enhanced icon component wrapper
export function Icon({ 
  size = 'md', 
  className = '', 
  strokeWidth = 2,
  children 
}: IconProps & { children: React.ReactElement }) {
  const iconSize = typeof size === 'number' ? size : iconSizes[size];
  
  return React.cloneElement(children, {
    size: iconSize,
    strokeWidth,
    className: `transition-colors duration-200 ${className}`
  } as any);
}

// Navigation icons mapping
export const navigationIcons = {
  home: Home,
  gacha: Dice6,
  rewards: Coins,
  wallet: Wallet,
  settings: Settings,
  profile: User,
  trending: TrendingUp
} as const;

// Game/Gacha related icons
export const gachaIcons = {
  dice: Dice6,
  spin: RefreshCw,
  coins: Coins,
  gem: Gem,
  star: Star,
  sparkles: Sparkles,
  crown: Crown,
  gift: Gift,
  zap: Zap,
  trophy: Trophy
} as const;

// Rarity icons (can be used with colors)
export const rarityIcons = {
  common: Star,
  uncommon: Gem,
  rare: Sparkles,
  epic: Crown,
  legendary: Trophy
} as const;

// UI action icons
export const actionIcons = {
  close: X,
  check: Check,
  refresh: RefreshCw,
  search: Search,
  filter: Filter,
  sort: SortAsc,
  sortDesc: SortDesc,
  copy: Copy,
  share: Share,
  download: Download,
  upload: Upload,
  external: ExternalLink,
  eye: Eye,
  eyeOff: EyeOff,
  heart: Heart,
  bookmark: Bookmark,
  flag: Flag,
  more: MoreHorizontal,
  moreVertical: MoreVertical
} as const;

// Navigation/movement icons
export const directionIcons = {
  right: ChevronRight,
  left: ChevronLeft,
  up: ChevronUp,
  down: ChevronDown,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown
} as const;

// State/status icons
export const statusIcons = {
  loading: Loader2,
  success: Check,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info
} as const;

// Media control icons
export const mediaIcons = {
  play: Play,
  pause: Pause,
  stop: Square,
  next: SkipForward,
  prev: SkipBack,
  repeat: Repeat,
  shuffle: Shuffle,
  volume: Volume2,
  mute: VolumeX
} as const;

// Utility functions for common icon patterns
export const getIconByName = (name: string): LucideIcon | null => {
  const allIcons = {
    ...navigationIcons,
    ...gachaIcons,
    ...rarityIcons,
    ...actionIcons,
    ...directionIcons,
    ...statusIcons,
    ...mediaIcons
  };
  
  return allIcons[name as keyof typeof allIcons] || null;
};

// Icon with automatic sizing and styling
export const ThemedIcon = ({ 
  name, 
  size = 'md', 
  className = '',
  variant = 'default',
  ...props 
}: {
  name: string;
  size?: IconSize | number;
  className?: string;
  variant?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'danger';
} & Omit<React.ComponentProps<LucideIcon>, 'size'>) => {
  const IconComponent = getIconByName(name);
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  const variantClasses = {
    default: 'text-foreground',
    muted: 'text-foreground/60',
    accent: 'text-warning',
    success: 'text-success',
    warning: 'text-warning', 
    danger: 'text-danger'
  };
  
  const iconSize = typeof size === 'number' ? size : iconSizes[size];
  
  return (
    <IconComponent
      size={iconSize}
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

// Export specific icons for direct use
export {
  Dice6,
  Coins,
  Wallet,
  Settings,
  TrendingUp,
  Trophy,
  Gem,
  Star,
  Sparkles,
  Crown,
  Gift,
  Zap,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Loader2
};