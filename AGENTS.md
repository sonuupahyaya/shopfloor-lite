# ShopFloor Lite - Agent Instructions

## Commands

### Development
```bash
npm install          # Install dependencies
npm start            # Start Expo development server
npm run android      # Run on Android device/emulator
npm run ios          # Run on iOS simulator (macOS only)
npm run web          # Run in web browser
```

### Type Checking & Linting
```bash
npm run typecheck    # Run TypeScript type check
npm run lint         # Run ESLint
```

### Building
```bash
npx expo build:android -t apk           # Build Android APK
npx eas build --platform android        # EAS Build for Android
```

## Project Structure

- `app/` - Expo Router screens (file-based routing)
- `src/components/` - Reusable UI components
- `src/store/` - Zustand state management stores
- `src/database/` - SQLite schema and database operations
- `src/services/` - API, image handling, alert generator
- `src/sync/` - Offline sync engine
- `src/types/` - TypeScript type definitions
- `src/constants/` - Theme, colors, spacing constants

## Key Patterns

### State Management
- Uses Zustand for global state
- Each domain has its own store (auth, machines, downtime, alerts, sync, kpis)
- Stores are located in `src/store/`

### Database
- Uses expo-sqlite for local persistence
- Schema defined in `src/database/schema.ts`
- Operations in `src/database/index.ts`

### Offline-First
- All actions are stored locally first
- Sync queue tracks pending changes
- SyncManager handles automatic sync on connectivity

### Components
- Themed components in `src/components/`
- Theme constants in `src/constants/theme.ts`
- Use existing components before creating new ones

## Coding Standards

- Use TypeScript for all files
- Follow existing code patterns
- Keep components small and focused
- Use the existing theme constants for styling
- Handle offline scenarios in all data operations
