# 🩸 RaktaSevaConnect
### Life-Saving Blood Donor Network

<div align="center">

![RaktaSeva Banner](assets/icon.png)

**A real-time cross-platform mobile application connecting blood donors and hospitals**

[![React Native](https://img.shields.io/badge/React_Native-0.76-blue?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-52-black?logo=expo)](https://expo.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)](https://firebase.google.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Platform](https://img.shields.io/badge/Platform-Android-green?logo=android)](https://android.com)

</div>

---

## 🎓 About This Project

This application was developed as part of the **Industrial Internship (BINT803B)** at **JSS Academy of Technical Education, Bengaluru** under the guidance of:

- **External Guide:** Mr. Tirumal Mutalikdesai, Program Coordinator, MindMatrix
- **Internal Guide:** Mrs. N Nagarathna, Assistant Professor, Dept. of E&IE

**Student:** Tejas S (1JS22EI049)
**Department:** Electronics & Instrumentation Engineering
**University:** Visvesvaraya Technological University (VTU)
**Academic Year:** 2025-2026

---

## 📱 About the App

**RaktaSevaConnect** (meaning "Blood Service Connection") is a dual-role real-time mobile application built to solve the critical problem of blood donation coordination in India. Hospitals face emergencies where they cannot quickly reach nearby blood donors, and donors have no way to know when their blood group is urgently needed.

This app bridges that gap by providing:
- A **Donor Portal** for blood donors to register, browse requests, and respond to emergencies
- A **Hospital Portal** for hospitals to post emergency requests and directly reach nearby donors

---

## ✨ Features

### 🩸 Donor Features
- Register with blood group, city, and contact details
- View live blood availability across all 8 blood groups
- Browse active emergency requests from hospitals
- Accept blood donation requests with one tap
- Receive real-time notifications for matching blood group requests
- Toggle availability status (hospitals can only see active donors)
- View and manage donor profile

### 🏥 Hospital Features
- Register hospital with auto-generated unique code (e.g. `FOR546`)
- Login using hospital code and password
- View real-time blood availability dashboard
- Post emergency blood requests to all matching donors within 10km
- Send direct requests to specific nearby donors
- Track how many donors have responded
- View active requests with urgency levels (CRITICAL/HIGH)

### 🔔 Notification System
- Emergency broadcast notifications to all matching donors
- Direct request notifications from specific hospitals
- Real-time delivery via Firebase Firestore
- Mark all as read functionality
- Unread count badge on notification icon

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React Native** | Cross-platform mobile framework |
| **Expo CLI** | Build system and SDK |
| **JavaScript ES6+** | Programming language |
| **Firebase Firestore** | Real-time NoSQL cloud database |
| **React Context API** | Global state management |
| **AsyncStorage** | Local session persistence |
| **React Navigation** | Stack-based screen navigation |
| **Animated API** | Smooth UI animations |
| **Gradle** | Android APK compilation |
| **ADB Logcat** | Crash debugging |

---

## 📁 Project Structure

```
RaktaSevaConnect/
│
├── App.js                          # Root component with navigation setup
├── index.js                        # App entry point
├── app.json                        # Expo configuration
├── firestore.rules                 # Firebase security rules
│
├── assets/                         # App icons and images
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
│
└── src/
    ├── components/
    │   ├── Cards.js                # Reusable card components
    │   └── CustomAlert.js          # Custom alert and toast system
    │
    ├── data/
    │   └── mockData.js             # Blood groups and helper functions
    │
    ├── screens/
    │   ├── SplashScreen.js         # App entry, auto session routing
    │   ├── OnboardingScreen.js     # Animated welcome slides
    │   ├── DonorLoginScreen.js     # Donor authentication
    │   ├── RegisterScreen.js       # Donor registration
    │   ├── HomeScreen.js           # Donor dashboard
    │   ├── FindScreen.js           # Browse emergency requests
    │   ├── DonorsScreen.js         # View available donors
    │   ├── NotificationsScreen.js  # Real-time notifications
    │   ├── ProfileScreen.js        # Donor profile management
    │   ├── HospitalLoginScreen.js  # Hospital auth and registration
    │   ├── HospitalDashboardScreen.js # Hospital management portal
    │   └── NewRequestScreen.js     # Post new blood request
    │
    └── utils/
        ├── AppContext.js           # Global state and Firebase functions
        ├── firebaseConfig.js       # Firebase initialization
        └── theme.js                # Design system (colors, fonts, spacing)
```

---

## 🗄️ Firebase Database Structure

```
Firestore Collections:
│
├── donors/                         # Indexed by phone number
│   └── {phoneNumber}
│       ├── name
│       ├── phone
│       ├── blood
│       ├── city
│       ├── available (boolean)
│       ├── role: "donor"
│       └── createdAt
│
├── hospitals/                      # Indexed by hospital code
│   └── {hospitalCode}
│       ├── name
│       ├── city
│       ├── phone
│       ├── code (e.g. "FOR546")
│       ├── role: "hospital"
│       └── createdAt
│
├── requests/                       # Emergency blood requests
│   └── {autoId}
│       ├── blood
│       ├── units
│       ├── urgency (critical/high)
│       ├── contact
│       ├── contactPhone
│       ├── hospital
│       ├── status: "active"
│       ├── accepted: []
│       └── createdAt
│
└── notifications/                  # Donor alerts
    └── {autoId}
        ├── targetId (donor phone)
        ├── type (emergency/direct)
        ├── title
        ├── desc
        ├── unread (boolean)
        └── createdAt
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Firebase project

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Tejascodz/RaktaSevaConnect.git
cd RaktaSevaConnect
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Start Metro Bundler**
```bash
npx expo start -c
```

5. **Build Android APK**
```bash
cd android
.\gradlew.bat assembleRelease
```

APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 App Screens

| Screen | Description |
|--------|-------------|
| **Splash** | Auto-detects session and routes to correct screen |
| **Onboarding** | 3-slide animated introduction with role selection |
| **Donor Login** | Phone + password authentication |
| **Register** | New donor registration with blood group selection |
| **Home Dashboard** | Live emergency banner, stats, blood grid, active requests |
| **Emergency Requests** | Searchable list of all active hospital requests |
| **Donors List** | Browse all available donors by blood group |
| **Notifications** | Real-time alerts and hospital requests |
| **Profile** | Donor info, availability toggle, logout |
| **Hospital Login** | Hospital code + password, registration tab |
| **Hospital Dashboard** | Stats, blood availability, post emergency, donor list |
| **Post Emergency** | Blood group, units, urgency, contact details form |

---

## 🐛 Bugs Fixed During Development

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| App crash on HomeScreen | `Easing.ease` doesn't exist in React Native | Replaced with `Easing.quad` |
| App crash on HomeScreen | `Easing.sine` doesn't exist in React Native | Replaced with `Easing.sin` |
| App crash on toast | `Easing.in(Easing.ease)` invalid | Replaced with `Easing.in(Easing.quad)` |
| Blank hospital dashboard | Animation opacity started at 0, never fired | Changed initial opacity to 1 |
| Login doesn't navigate | Missing `navigation.replace()` after success | Added navigation to all auth flows |
| Hospital register stuck | Alert had no `onPress` navigation | Added `navigation.replace('HospitalMain')` |
| Content behind status bar | SafeAreaView missing on 11 screens | Added SafeAreaView to all screens |
| Splash crash on reopen | Corrupted AsyncStorage JSON | Added safe JSON parsing with fallback |

All bugs identified using **ADB logcat** analysis on a real OnePlus Android device.

---

## 🏗️ Architecture

```
App.js (ErrorBoundary + NavigationContainer)
│
├── AppProvider (React Context API)
│   ├── Firebase Listeners (donors, requests, notifications)
│   ├── AsyncStorage (session persistence)
│   └── State: user, hospital, donors, requests, notifications
│
└── Stack Navigator
    ├── Splash → (routes based on session)
    ├── Onboarding
    ├── DonorLogin / Register → Main
    ├── Main (HomeScreen)
    │   ├── Find
    │   ├── Donors
    │   ├── Notifications
    │   └── Profile
    └── HospitalLogin → HospitalMain
        └── HospitalDashboard
```

---

## 🔒 Security

- Firebase API keys stored in `.env` file (not committed to GitHub)
- Passwords hashed using custom hash function before storing in Firestore
- Session data stored locally in AsyncStorage
- `.env.example` provided as safe template
- `google-services.json` excluded from repository

---

## 📊 Build Information

| Metric | Value |
|--------|-------|
| Build Tool | Gradle 8.10.2 |
| Build Time (clean) | ~4 minutes 15 seconds |
| Gradle Tasks | 675 |
| JavaScript Modules | 825 |
| APK Size | ~64 MB |
| Target Platform | Android |
| Min SDK | Android 6.0+ |

---

## 📄 License

This project is developed for educational purposes as part of an internship program.

---

<div align="center">

**Made with ❤️ for saving lives**

*RaktaSevaConnect — Every drop counts when saving a life*

</div>
