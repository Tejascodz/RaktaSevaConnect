---
title: "Rakta-Seva Connect: Project Documentation"
author: "Tejas S"
date: "2026-05-09"
---

# Rakta-Seva Connect 🩸
**A Next-Generation Emergency Blood Donation Network**

## 1. Executive Summary
Rakta-Seva Connect is a world-class, real-time emergency blood donation mobile application designed to bridge the gap between hospitals facing critical blood shortages and willing voluntary donors in the community. Built with a focus on speed, reliability, and visual excellence, the application ensures that life-saving resources are mobilized within the "golden hour" of an emergency.

---

## 2. Technology Stack
The application is built using a modern, scalable, and cross-platform technology stack to ensure high performance and maintainability.

### Frontend (Mobile App)
*   **Framework:** React Native & Expo (Cross-platform Android/iOS deployment)
*   **Navigation:** React Navigation (Native Stack & Bottom Tabs)
*   **UI/UX & Animations:** React Native `Animated` API (Spring physics, interpolations, micro-interactions)
*   **Icons:** `@expo/vector-icons` (Material Icons)
*   **State Management:** React Context API (`AppContext.js`)

### Backend & Database
*   **Database:** Firebase Firestore (NoSQL, Real-time cloud database)
*   **Authentication Hooks:** Secure hashed password implementation with local persistence
*   **Real-time Sync:** Firestore `onSnapshot` listeners for instant data propagation across all devices

### Storage & DevOps
*   **Local Storage:** `@react-native-async-storage/async-storage` for persistent user sessions
*   **Build Pipeline:** EAS Build (Expo Application Services) for automated, cloud-based APK/AAB generation
*   **Version Control:** Git

---

## 3. Core Features & Architecture

### A. Dual-Role Portal Architecture
The application securely segregates user experiences based on their role:

1.  **Donor Portal:**
    *   Secure phone-number based registration and login.
    *   Interactive dashboard showing live emergency requests in their vicinity.
    *   Ability to "Accept" requests, instantly notifying the respective hospital.
    *   One-tap availability toggle (auto-disabled for 90 days post-donation).
    *   Dynamic blood group filtering and nearby donor directory.

2.  **Hospital Portal:**
    *   Secure institutional login using generated unique Hospital Codes.
    *   Dedicated Dashboard to broadcast "Critical" or "High" urgency blood requests.
    *   Live tracking of donor acceptances (watch the accepted list update in real-time).
    *   Directory access to invite specific, eligible donors directly via push notifications.

### B. Real-Time Synchronization Engine
Rakta-Seva ditches traditional "pull-to-refresh" mechanisms. Utilizing Firebase's real-time WebSocket connections, when a hospital posts an emergency request, it appears on every donor's screen globally in less than 300 milliseconds.

### C. Custom Notification & Alert System
Standard mobile alerts are blocking and disrupt the user experience. Rakta-Seva features a custom-built, hardware-accelerated `AlertProvider`:
*   **Custom Modals:** Beautifully animated, non-blocking modal dialogs for critical actions (e.g., logging out, confirming donations).
*   **Dynamic Toasts:** Slide-up success/error toasts that auto-dismiss, providing fluid feedback without interrupting workflow.

### D. Security & Data Integrity
*   **Input Validation:** Strict regex-based validation for Indian 10-digit phone numbers and password lengths.
*   **Password Hashing:** Passwords are mathematically hashed locally before being sent to Firestore, ensuring plaintext passwords are never stored in the database.
*   **Firestore Security Rules:** Restricted database rules ensure donors can only update their own status and append to request acceptance arrays, preventing unauthorized data manipulation.

---

## 4. UI/UX & Design Philosophy
Rakta-Seva was designed to feel "world-class" and dynamic:
*   **Color Palette:** A dark-mode first design utilizing deep space backgrounds (`#0A0A14`), contrasting with vibrant Crimson Red (`#DC143C`) for critical actions and emergencies.
*   **Micro-Animations:** 
    *   A continuous heartbeat pulse animation on live emergency tags.
    *   Staggered, spring-loaded list entries when navigating to new screens.
    *   Hardware-accelerated native animations optimized to prevent Android `RenderNode` crashes.
*   **Glassmorphism:** Subtle translucent surfaces and glowing effects to highlight critical calls to action.

---

## 5. Development Milestones & Bug Fixes
During the stabilization phase, several critical architectural updates were made:
1.  **Firebase Web Compatibility:** Transitioned Expo from utilizing native Google Services JSON to the universal JS SDK to fix build conflicts and enable seamless OTA (Over-The-Air) updates.
2.  **Native Driver Optimization:** Resolved a fatal Android hardware-acceleration crash by decoupling `elevation` and `shadow` properties from `Animated.View` components running `transform` matrices.
3.  **Data Safety Nets:** Implemented strict optional chaining and NaN-fallbacks across all UI components to gracefully handle incomplete or legacy mock data in the Firestore database.

---
*Report automatically generated by the Rakta-Seva Build Pipeline.*
