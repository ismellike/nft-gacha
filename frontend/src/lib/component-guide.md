# HeroUI Glassmorphism Component Guide

This guide provides standardized usage patterns for our HeroUI-based glassmorphism design system.

## Design Philosophy

- **HeroUI-first**: Leverage HeroUI's built-in theming and component variants
- **Minimal Tailwind**: Use HeroUI extendVariants instead of custom Tailwind classes
- **Consistent Glassmorphism**: All glass effects use the same blur, opacity, and border values
- **Accessible**: Maintain proper contrast ratios and interactive states

## Core Components

### Button Component

```tsx
import { Button } from "@/ui";

// Glass button (default)
<Button>Click me</Button>

// Glass primary button for CTAs
<Button color="glassPrimary">Primary Action</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Card Component

```tsx
import { Card } from "@/ui";

// Glass card (default)
<Card>
  <p>Card content</p>
</Card>

// Interactive card with hover effects
<Card color="glassInteractive">
  <p>Clickable content</p>
</Card>
```

### Input Component

```tsx
import { Input } from "@/ui";

// Glass input (default)
<Input placeholder="Enter text..." />

// Different variants
<Input variant="bordered" placeholder="Bordered input" />
<Input variant="faded" placeholder="Faded input" />
```

### Modal Component

```tsx
import { Modal } from "@/ui";

<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button>Close</Button>
  </Modal.Footer>
</Modal>
```

### Badge & Chip Components

```tsx
import { Badge, Chip } from "@/ui";

// Glass badges
<Badge color="glass">Default</Badge>
<Badge color="primary">Primary</Badge>
<Badge color="success">Success</Badge>

// Status chips
<Chip color="warning">Pending</Chip>
<Chip color="danger">Error</Chip>
<Chip color="success">Complete</Chip>
```

## Color System

### Glass Colors
- `glass`: Standard glass morphism effect
- `glassPrimary`: Primary gradient glass for CTAs
- `glassInteractive`: Glass with hover/active states

### Status Colors
- `success`: Green for positive states
- `warning`: Yellow/amber for warnings
- `danger`: Red for error states
- `primary`: Blue for information

## Sizing System

### Button Sizes
- `sm`: 32px height, small padding
- `md`: 44px height, medium padding (default)
- `lg`: 48px height, large padding
- `xl`: 64px height, extra large padding

### Card Radius
- `small`: 8px border radius
- `medium`: 12px border radius (default)
- `large`: 16px border radius

## Spacing Guidelines

### Component Internal Spacing
- Cards: Use `p-4` (sm), `p-6` (md), `p-8` (lg)
- Buttons: Built-in padding via size props
- Inputs: Built-in padding via size props

### Layout Spacing
- Section gaps: `gap-4` to `gap-8`
- Component margins: `space-y-4` to `space-y-8`

## Typography

Use HeroUI's built-in text props:
```tsx
<Text size="sm" weight="medium">Small medium text</Text>
<Text size="lg" weight="bold">Large bold text</Text>
```

## Best Practices

### 1. Use Component Props Over Custom Classes
```tsx
// ✅ Good - Use component props
<Button size="lg" color="glassPrimary">Action</Button>

// ❌ Avoid - Custom Tailwind classes
<Button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500">Action</Button>
```

### 2. Leverage HeroUI State Management
```tsx
// ✅ Good - Use built-in states
<Card isPressable isHoverable>
  <p>Interactive content</p>
</Card>

// ❌ Avoid - Manual hover states
<Card className="hover:bg-content1/30 cursor-pointer">
  <p>Interactive content</p>
</Card>
```

### 3. Maintain Consistent Visual Hierarchy
```tsx
// Primary actions
<Button color="glassPrimary">Main CTA</Button>

// Secondary actions
<Button>Secondary Action</Button>

// Destructive actions
<Button color="danger">Delete</Button>
```

### 4. Accessibility First
- Ensure proper contrast ratios (automatically handled by HeroUI)
- Use semantic HTML elements
- Provide proper focus states
- Include ARIA labels where needed

## Migration Guidelines

When updating existing components:

1. **Replace custom glass classes** with HeroUI color props
2. **Standardize spacing** using HeroUI size props
3. **Remove redundant Tailwind** that duplicates HeroUI functionality
4. **Use consistent naming** for glass variants

Example migration:
```tsx
// Before
<Card className="bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hover:bg-content1/30 hover:border-white/20 hover:shadow-3xl transition-all duration-300 cursor-pointer">
  <p>Content</p>
</Card>

// After
<Card color="glassInteractive">
  <p>Content</p>
</Card>
```

This approach ensures consistency, reduces maintenance overhead, and leverages the full power of the HeroUI component library.