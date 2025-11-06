# Button Usage Guidelines

## Overview

This document provides standardized guidelines for button usage throughout the NFT Gacha website to ensure consistent styling and behavior.

## Available Button Variants

### Glass Variant (`color="glass"`)
- **Purpose**: Secondary actions, non-destructive operations, general UI controls
- **Styling**: Subtle glassmorphism with backdrop blur, semi-transparent background, rounded corners
- **Usage**:
  - Cancel/close buttons
  - Reset actions
  - Navigation buttons
  - Settings toggles

### GlassPrimary Variant (`color="glassPrimary"`)
- **Purpose**: Primary actions, destructive operations, critical user flows
- **Styling**: Bold gradient background with warning/orange theme, prominent shadows, rounded corners
- **Usage**:
  - Submit/save buttons
  - Delete/remove actions
  - Spin gacha button
  - Primary CTAs

## Button Sizes

- `sm`: Small buttons for compact interfaces
- `md`: Default size for most use cases
- `lg`: Large buttons for primary actions
- `xl`: Extra large buttons for hero sections

## Design Features

### Rounded Aesthetic
- Both glass and glassPrimary variants use `rounded-2xl` by default
- Consistent with the spin button's modern, rounded design
- Provides a softer, more approachable user interface

## Best Practices

1. **Use the imported Button component**, not HeroButton directly
2. **Leverage color variants** instead of custom className overrides
3. **Maintain accessibility** - ensure proper contrast and focus states
4. **Consistent spacing** - use appropriate size prop for context
5. **Loading states** - use isLoading prop for async operations

## Implementation Examples

```tsx
// ✅ Correct - using proper variants
<Button color="glass" onPress={handleCancel}>
  Cancel
</Button>

<Button color="glassPrimary" onPress={handleSubmit}>
  Save Changes
</Button>

// ❌ Incorrect - custom className overrides
<Button className="bg-gradient-to-r from-warning to-orange-400">
  Save Changes
</Button>
```

## Migration Notes

Replace inline styling with the standardized GlassButton variants:

- Replace `bg-content1/20 backdrop-blur-xl` with `color="glass"`
- Replace `bg-gradient-to-r from-warning to-orange-400` with `color="glassPrimary"`
- Remove custom hover states and transitions (handled by variants)
- Use `isDisabled` prop instead of `disabled` className