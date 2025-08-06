/**
 * Icon utilities and mappings for the application
 * Uses Heroicons React for consistent, beautiful icons
 */

import React from "react";
import {
	CubeIcon as Dice6,
	CurrencyDollarIcon as Coins,
	WalletIcon as Wallet,
	CogIcon as Settings,
	ChartBarIcon as TrendingUp,
	TrophyIcon as Trophy,
	GiftIcon as Gem,
	StarIcon as Star,
	SparklesIcon as Sparkles,
	StarIcon as Crown,
	GiftIcon as Gift,
	BoltIcon as Zap,
	ArrowPathIcon as RefreshCw,
	XMarkIcon as X,
	XCircleIcon as XCircle,
	CheckIcon as Check,
	ExclamationTriangleIcon as AlertTriangle,
	InformationCircleIcon as Info,
	ArrowTopRightOnSquareIcon as ExternalLink,
	ClipboardIcon as Copy,
	EyeIcon as Eye,
	EyeSlashIcon as EyeOff,
	ChevronRightIcon as ChevronRight,
	ChevronLeftIcon as ChevronLeft,
	ChevronUpIcon as ChevronUp,
	ChevronDownIcon as ChevronDown,
	Bars3Icon as Menu,
	HomeIcon as Home,
	UserIcon as User,
	MagnifyingGlassIcon as Search,
	FunnelIcon as Filter,
	BarsArrowUpIcon as SortAsc,
	BarsArrowDownIcon as SortDesc,
	CalendarIcon as Calendar,
	ClockIcon as Clock,
	ArrowRightIcon as ArrowRight,
	ArrowLeftIcon as ArrowLeft,
	ArrowUpIcon as ArrowUp,
	ArrowDownIcon as ArrowDown,
	PlusIcon as Plus,
	MinusIcon as Minus,
	EllipsisHorizontalIcon as MoreHorizontal,
	EllipsisVerticalIcon as MoreVertical,
	ArrowDownTrayIcon as Download,
	ArrowUpTrayIcon as Upload,
	ShareIcon as Share,
	HeartIcon as Heart,
	BookmarkIcon as Bookmark,
	FlagIcon as Flag,
	ChatBubbleLeftIcon as MessageCircle,
	BellIcon as Bell,
	BellSlashIcon as BellOff,
	SpeakerWaveIcon as Volume2,
	SpeakerXMarkIcon as VolumeX,
	PlayIcon as Play,
	PauseIcon as Pause,
	StopIcon as Square,
	ForwardIcon as SkipForward,
	BackwardIcon as SkipBack,
	ArrowPathRoundedSquareIcon as Repeat,
	ArrowsRightLeftIcon as Shuffle,
	ArrowsPointingOutIcon as Maximize,
	ArrowsPointingInIcon as Minimize,
	ArrowPathIcon as RotateCcw,
	ArrowPathIcon as RotateCw,
	ArrowPathIcon as Loader2,
	FolderOpenIcon as FolderOpen,
	ArchiveBoxIcon as Archive,
	ShieldCheckIcon as ShieldCheck,
	LinkIcon as Link,
} from "@heroicons/react/24/outline";

export type HeroIcon = React.ForwardRefExoticComponent<
	Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
		title?: string | undefined;
		titleId?: string | undefined;
	} & React.RefAttributes<SVGSVGElement>
>;

// Icon size configurations
export const iconSizes = {
	xs: 12,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 32,
	"2xl": 40,
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
	size = "md",
	className = "",
	strokeWidth = 2,
	children,
}: IconProps & { children: React.ReactElement }) {
	const iconSize = typeof size === "number" ? size : iconSizes[size];

	return React.cloneElement(children, {
		width: iconSize,
		height: iconSize,
		strokeWidth,
		className: `transition-colors duration-200 ${className}`,
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
	trending: TrendingUp,
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
	trophy: Trophy,
} as const;

// Rarity icons (can be used with colors)
export const rarityIcons = {
	common: Star,
	uncommon: Gem,
	rare: Sparkles,
	epic: Crown,
	legendary: Trophy,
} as const;

// UI action icons
export const actionIcons = {
	close: X,
	"x-circle": XCircle,
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
	link: Link,
	eye: Eye,
	eyeOff: EyeOff,
	heart: Heart,
	bookmark: Bookmark,
	flag: Flag,
	more: MoreHorizontal,
	moreVertical: MoreVertical,
	"folder-open": FolderOpen,
	archive: Archive,
	"shield-check": ShieldCheck,
	plus: Plus,
	clock: Clock,
} as const;

// Navigation/movement icons
export const directionIcons = {
	right: ChevronRight,
	left: ChevronLeft,
	up: ChevronUp,
	down: ChevronDown,
	arrowRight: ArrowRight,
	arrowLeft: ArrowLeft,
	"arrow-left": ArrowLeft,
	arrowUp: ArrowUp,
	arrowDown: ArrowDown,
} as const;

// State/status icons
export const statusIcons = {
	loading: Loader2,
	success: Check,
	error: AlertTriangle,
	warning: AlertTriangle,
	"alert-triangle": AlertTriangle,
	info: Info,
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
	mute: VolumeX,
} as const;

// Utility functions for common icon patterns
export const getIconByName = (name: string): HeroIcon | null => {
	const allIcons = {
		...navigationIcons,
		...gachaIcons,
		...rarityIcons,
		...actionIcons,
		...directionIcons,
		...statusIcons,
		...mediaIcons,
	};

	return allIcons[name as keyof typeof allIcons] || null;
};

// Icon with automatic sizing and styling
export const ThemedIcon = ({
	name,
	size = "md",
	className = "",
	variant = "default",
	...props
}: {
	name: string;
	size?: IconSize | number;
	className?: string;
	variant?: "default" | "muted" | "accent" | "success" | "warning" | "danger";
} & Omit<React.ComponentProps<HeroIcon>, "width" | "height">) => {
	const IconComponent = getIconByName(name);

	if (!IconComponent) {
		console.warn(`Icon "${name}" not found`);
		return null;
	}

	const variantClasses = {
		default: "text-foreground",
		muted: "text-foreground/60",
		accent: "text-warning",
		success: "text-success",
		warning: "text-warning",
		danger: "text-danger",
	};

	const iconSize = typeof size === "number" ? size : iconSizes[size];

	return (
		<IconComponent
			width={iconSize}
			height={iconSize}
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
	XCircle,
	Check,
	AlertTriangle,
	Info,
	ExternalLink,
	Copy,
	Eye,
	EyeOff,
	Loader2,
	FolderOpen,
	Archive,
	ShieldCheck,
	Link,
	Plus,
	Clock,
};
