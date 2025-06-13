# Firebase Quick Setup Guide

This is a quick guide to set up Firebase for the Hospital Management System.

## 1. Create Firebase Project & Get Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Register a new web app in your project
4. Copy the Firebase configuration (apiKey, authDomain, etc.)

## 2. Update Config in the App

Replace the Firebase configuration in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 3. Enable Services

1. **Authentication**: Enable Email/Password sign-in
2. **Firestore Database**: Create database in your preferred region

## 4. Database Structure

Ensure your Firestore has these collections:
- `users` - Staff and patient accounts
- `appointments` - Patient appointments 
- `prescriptions` - Patient prescriptions
- `medical_records` - Patient medical records
- `pharmacy_orders` - Medication orders
- `emergency_slots` - Emergency appointments

## 5. Run the App

```
npm install
npm start
```

## 6. Need More Details?

See the full setup guide: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
