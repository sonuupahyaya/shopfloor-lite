# ShopFloor Lite

**Offline-First Manufacturing App for Android**

A production-ready React Native (Expo) mobile application designed for factory shop floor operations. Works completely offline and syncs automatically when connectivity returns.

![ShopFloor Lite](./assets/screenshot.png)

## 🎯 Business Problem

Factory workers operate in areas with unstable or no Wi-Fi. They must record machine downtime and maintenance tasks even when offline. Supervisors must see alerts, acknowledge them, and clear them.

**This app never loses data**, queues offline actions, and syncs automatically when internet returns.

## 👤 User Roles

### Operator
- Records machine downtime with photos
- Completes maintenance checklists
- Adds notes to maintenance items
- Works fully offline

### Supervisor
- Views and manages alerts
- Acknowledges and clears alerts
- Reviews summary KPIs and dashboards

## ✨ Features

### 1. Machine Dashboard
- View all machines with real-time status (RUN, IDLE, OFF)
- Visual indicators for machines currently in downtime
- Alert badges showing pending alerts per machine
- Pull-to-refresh for latest data

### 2. Downtime Capture (Operator)
- **Start Downtime** with one tap
- **Two-level reason tree** for categorizing downtime:
  - Power (Grid, Internal)
  - Changeover (Tooling)
  - Mechanical (Breakdown, Wear, Vibration)
  - Quality (Defective Output, Calibration)
  - Material (Shortage, Jam)
  - Operator (Break, Training, Absent)
- **Photo capture** with automatic compression (≤ 200 KB)
- **Works completely offline** - syncs when online
- Unique ID tracking to prevent duplicates

### 3. Maintenance Checklist (Operator)
- View maintenance items per machine
- Filter by status: Due, Overdue, Done
- Mark items as complete
- Add notes to maintenance items
- Visual indicators for overdue items

### 4. Alert System (Supervisor)
- **Simulated alerts** generated every 30 seconds
- Severity levels: Low, Medium, High, Critical
- Alert workflow: Created → Acknowledged → Cleared
- Visual badges and notifications
- Full audit trail (who, when)

### 5. Summary Dashboard (KPIs)
- **Total Downtime Today** - time and count
- **Machine Status** - Running vs Down/Idle
- **Alert Metrics** - Open vs Cleared
- **Maintenance Progress** - Completion percentage
- **Quick Stats** - Uptime, OEE indicators

## 🔄 Offline-First Sync Engine

The app includes a robust offline-first architecture:

- **SQLite local database** for all data
- **Sync queue** tracks pending changes
- **Automatic sync** when connectivity returns
- **Retry logic** for failed syncs (max 3 retries)
- **Duplicate prevention** using unique IDs
- **Visual sync status** bar showing pending items

```
🔄 Syncing... (3 pending)
☁️ Offline Mode
✓ All synced
```

## 🛠 Technology Stack

- **React Native** with Expo SDK 51
- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **Zustand** for state management
- **SQLite** (expo-sqlite) for local persistence
- **NetInfo** for connectivity detection
- **Expo Image Picker** + Image Manipulator for photos

## 📁 Project Structure

```
shopfloor-lite/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigator screens
│   │   ├── index.tsx       # Machines dashboard
│   │   ├── maintenance.tsx # Maintenance checklist
│   │   ├── alerts.tsx      # Alerts management
│   │   ├── kpis.tsx        # KPI dashboard
│   │   └── settings.tsx    # Settings & sync
│   ├── machine/[id].tsx    # Machine detail screen
│   ├── index.tsx           # Login screen
│   └── _layout.tsx         # Root layout
├── src/
│   ├── components/         # Reusable UI components
│   ├── constants/          # Theme, colors, spacing
│   ├── database/           # SQLite schema & operations
│   ├── services/           # API, image, alert services
│   ├── store/              # Zustand state stores
│   ├── sync/               # Sync engine
│   └── types/              # TypeScript definitions
├── assets/                 # App icons and images
├── .env                    # Environment variables
├── app.json                # Expo configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Expo Go app on your device (for testing)

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd Shopfloor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/emulator:**
   - Press `a` for Android
   - Scan QR code with Expo Go app
   - Press `w` for web (limited features)

### Environment Variables

The app uses a `.env` file for configuration:

```env
# MongoDB Atlas Connection (for future backend)
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=shopfloor_lite

# API Configuration
API_BASE_URL=https://api.shopfloor.local
API_TIMEOUT=30000

# App Configuration
TENANT_ID=tenant_demo
APP_ENV=development
```

## 📱 Usage

### Login
1. Enter any email address
2. Select your role (Operator or Supervisor)
3. Tap "Sign In"

### Recording Downtime (Operator)
1. Tap on a machine from the dashboard
2. Tap "Start Downtime"
3. Optionally take a photo
4. Tap "End Downtime & Select Reason"
5. Choose reason from the two-level picker

### Managing Alerts (Supervisor)
1. Go to Alerts tab
2. View all alerts sorted by status
3. Tap "Acknowledge" on new alerts
4. Tap "Clear" on acknowledged alerts

### Completing Maintenance (Operator)
1. Go to Maintenance tab
2. Filter by machine or status
3. Tap "Mark Done" to complete items
4. Add notes if needed

## 🔐 Authentication (Mocked)

For demo purposes, the app accepts any email address:
- Generates a mock JWT token
- Stores tenant_id = "tenant_demo"
- Persists session in local storage

## 🏭 Seed Data

### Machines
| ID | Name | Type |
|---|---|---|
| M-101 | Cutter 1 | cutter |
| M-102 | Roller A | roller |
| M-103 | Packing West | packer |

### Downtime Reasons
- **Power**: Grid, Internal
- **Changeover**: Tooling
- **Mechanical**: Breakdown, Wear & Tear, Vibration
- **Quality**: Defective Output, Calibration Required
- **Material**: Material Shortage, Material Jam
- **Operator**: Scheduled Break, Training, Operator Absent

## 📊 Database Schema

### Tables
- `users` - Authentication cache
- `machines` - Machine registry
- `downtime_events` - Downtime records
- `maintenance_items` - Maintenance tasks
- `alerts` - Alert records
- `sync_queue` - Offline sync queue

## 🔧 Build for Production

### Android APK
```bash
npx expo build:android -t apk
```

### Android AAB (Play Store)
```bash
npx expo build:android -t app-bundle
```

### EAS Build (Recommended)
```bash
npx eas build --platform android
```

## 🧪 Testing

```bash
# Run TypeScript check
npm run typecheck

# Run linting
npm run lint
```

## 📄 License

MIT License - feel free to use this for your manufacturing operations.

## 🤝 Support

For issues or feature requests, please open a GitHub issue.

---

Built with ❤️ for the manufacturing industry.
