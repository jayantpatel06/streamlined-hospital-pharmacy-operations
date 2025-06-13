# Firebase Setup Guide for Hospital Management System

This guide will help you set up Firebase for the Hospital Management System application.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project" and follow the prompts
3. Give your project a name (e.g., "Hospital Management System")
4. Enable Google Analytics if desired
5. Click "Create Project"

## 2. Register Your App with Firebase

1. From the Firebase project dashboard, click the web icon (`</>`)
2. Register your app with a nickname (e.g., "Hospital Management Web App")
3. Check the option to set up Firebase Hosting if desired
4. Click "Register App"
5. Copy the Firebase configuration code provided

## 3. Update Configuration in Your Application

1. Open the file `src/config/firebase.js` in your project
2. Replace the existing Firebase configuration with your own:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## 4. Enable Authentication Methods

1. In the Firebase console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" authentication
3. Save your changes

## 5. Set Up Firestore Database

1. In the Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Start in production mode or test mode as needed
4. Choose a location for your database
5. Click "Enable"

## 6. Create Firestore Collections

Create the following collections in your Firestore database:

1. **users** - For storing user accounts (staff and patients)
2. **appointments** - For storing appointment data
3. **prescriptions** - For storing prescription information
4. **medical_records** - For storing patient medical records
5. **pharmacy_orders** - For storing pharmacy orders
6. **emergency_slots** - For managing emergency appointments

## 7. Set Up Security Rules

1. In the Firebase console, go to "Firestore Database" > "Rules"
2. Update the security rules to secure your application:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /appointments/{appointmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /prescriptions/{prescriptionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'pharmacy' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /medical_records/{recordId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    match /pharmacy_orders/{orderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /emergency_slots/{slotId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 8. Install Firebase CLI (Optional - for Deployment)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize your project: `firebase init`
4. Follow the prompts to set up hosting
5. Deploy your application: `firebase deploy`

## 9. Testing

After completing the setup:

1. Start your application with `npm start`
2. Test user registration and authentication
3. Verify that data is being stored in Firestore collections
4. Test all CRUD operations for appointments, prescriptions, and medical records

## 10. Troubleshooting

- If you encounter authentication issues, check that Email/Password sign-in is enabled
- If database operations fail, verify your security rules
- Check browser console for detailed error messages
- Ensure your Firebase plan supports the features you're using
