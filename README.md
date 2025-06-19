# Offline-First Shopping App

A React Native shopping app with offline-first architecture using TypeScript, WatermelonDB, and Redux Toolkit.

## Features

- Browse products offline
- Create and manage orders without internet
- Automatic sync when online
- Conflict resolution for data conflicts

## Tech Stack

- React Native 0.80
- TypeScript
- WatermelonDB (offline database)
- Redux Toolkit (state management)
- React Navigation

## Architecture

### Data Flow

```
UI → Custom Hooks → Storage Layer → WatermelonDB → Sync Manager → API
```

### Key Decisions

- **Products**: Direct storage (no Redux)
- **Orders**: Redux + WatermelonDB hybrid
- **Sync**: Queue-based with retry logic
- **Conflicts**: Last-write-wins strategy

## Setup

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio / Xcode

### Installation

```bash
# Clone and install
git clone git@github.com:justankit/OfflineFirstShoppingTestApp.git
cd OfflineShoppingTestApp
npm install

# iOS only
bundle install
cd ios && bundle exec pod install && cd ..
```

### Run App

```bash
# Start Metro
npm start

# Run on device
npm run android  # Android
npm run ios      # iOS
```

## Project Structure

```
src/
├── components/
│   └── common/           # Reusable components
│       ├── Button.tsx
│       ├── LoadingOverlay.tsx
│       ├── SyncStatusIndicator.tsx
│       └── icons/        # Icon components
├── contexts/
│   └── ThemeContext.tsx  # App theming
├── hooks/                # Custom hooks
│   ├── useOfflineProducts.ts      # Product management
│   ├── useOfflineOrderActions.ts  # Order creation/updates
│   └── useOrderManagement.ts      # Order viewing/deletion
├── navigation/
│   └── RootNavigator.tsx # Navigation setup
├── screens/              # Main app screens
│   ├── ProductListScreen/
│   │   ├── index.tsx
│   │   └── components/   # Screen-specific components
│   └── OrderScreen/
│       ├── index.tsx
│       └── components/
├── services/             # Business logic
│   ├── api/             # API layer
│   │   ├── config.ts    # API configuration
│   │   ├── orderService.ts
│   │   └── productService.ts
│   ├── storage/         # Local storage
│   │   ├── database/    # WatermelonDB setup
│   │   ├── orderStorage.ts
│   │   └── productStorage.ts
│   └── sync/            # Sync logic
│       ├── syncManager.ts
│       └── offlineFirstSyncManager.ts
├── store/               # Redux store
│   ├── index.ts         # Store configuration
│   ├── hooks.ts         # Typed hooks
│   └── slices/          # Redux slices
├── types/               # TypeScript definitions
└── App.tsx              # Root component
```

## Development

```bash
npm run lint    # Check code
npm test        # Run tests
```

## Troubleshooting

- **Metro issues**: `npx react-native start --reset-cache`
- **Android build**: `cd android && ./gradlew clean`
- **iOS build**: `cd ios && bundle exec pod install`
- **Database issues**: Increment schema version or reinstall app
