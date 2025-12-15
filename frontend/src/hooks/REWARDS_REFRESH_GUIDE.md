# Rewards Data Refresh System

This guide explains how to use the new coordinated rewards data refresh system implemented in `useRewardsData.tsx`.

## Overview

The rewards refresh system provides a centralized way to refresh all rewards-related data across the application. It uses a React Context-based callback registry that allows components to register their Wagmi query refetch functions, which can then be triggered collectively.

## Components

### 1. RewardsRefetchProvider

A React context provider that manages the registry of refetch callbacks.

> **Note**: The `RewardsRefetchProvider` is already configured in `src/app/providers.tsx` and wraps the entire application, so you don't need to add it manually.

```tsx
import { RewardsRefetchProvider } from '@/hooks/useRewardsData';

// Wrap your app or relevant section
<RewardsRefetchProvider>
  <YourApp />
</RewardsRefetchProvider>
```

### 2. useRewardsData

Main hook that provides the coordinated refresh functionality:

```tsx
const { refetchAllRewardsData, registerRefetch, unregisterRefetch } = useRewardsData();
```

### 3. useRegisterRewardsRefetch

Helper hook for components to register their refetch functions:

```tsx
import { useRegisterRewardsRefetch } from '@/hooks/useRewardsData';

// Register a refetch function
useRegisterRewardsRefetch("myDataKey", refetchFunction);
```

## Usage Examples

### Component Registration

Components that have Wagmi queries should register their refetch functions:

```tsx
import { useRegisterRewardsRefetch } from '@/hooks/useRewardsData';

function MyComponent() {
  const { data, refetch } = useReadMyContract({
    address: contractAddress,
    // ... other options
  });

  // Register this refetch with the rewards system
  useRegisterRewardsRefetch("myData", refetch);

  return <div>{data}</div>;
}
```

### Manual Refresh

Trigger a coordinated refresh of all registered rewards data:

```tsx
function RefreshButton() {
  const { refetchAllRewardsData } = useRewardsData();

  const handleRefresh = async () => {
    await refetchAllRewardsData();
  };

  return <button onClick={handleRefresh}>Refresh All Rewards</button>;
}
```

## Registered Callbacks

The system currently registers the following refetch callbacks:

### ProfileDashboard
- `userProfile` - User profile data from treasury
- `userGacha` - User gacha statistics

### CardRewardsList
- `feeToken` - Fee token address
- `feeTokenDecimals` - Fee token decimals
- `feeTokenSymbol` - Fee token symbol
- `treasuryCards` - User's deposited cards

### EconomyDashboard
- `economyData` - Economy manager statistics
- `depositorVault` - Depositor vault data
- `buybackVault` - Buyback vault data
- `protocolTreasury` - Protocol treasury data

## Implementation Details

### Callback Registration

Components register their refetch functions using the `useRegisterRewardsRefetch` hook. This automatically handles cleanup when components unmount.

### Coordinated Execution

When `refetchAllRewardsData()` is called, the system:

1. Logs the start of the refresh process
2. Executes all registered refetch functions in parallel using `Promise.allSettled`
3. Logs completion and any errors
4. Ensures individual failures don't prevent other refetches

### Error Handling

The system is designed to be resilient:
- Individual refetch failures are logged but don't stop other refetches
- All errors are caught and reported without crashing the refresh process
- Components continue to function even if some refetches fail

## Best Practices

1. **Register Early**: Register refetch functions as early as possible in component lifecycle
2. **Use Descriptive Keys**: Use clear, unique keys for refetch registration
3. **Handle Loading States**: Components should handle their own loading states during refetch
4. **Avoid Duplicate Registrations**: The system automatically handles cleanup to prevent duplicates

## Adding New Components

To add a new component's refetch to the system:

1. Import `useRegisterRewardsRefetch`
2. Extract the `refetch` function from your Wagmi query
3. Register it with a unique key:

```tsx
import { useRegisterRewardsRefetch } from '@/hooks/useRewardsData';

function NewComponent() {
  const { data, refetch } = useReadNewData({
    address: contractAddress,
  });

  useRegisterRewardsRefetch("newData", refetch);

  // ... rest of component
}
```