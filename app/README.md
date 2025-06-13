# Hospital Management System

A comprehensive hospital management system built with React and Firebase that handles the complete patient medication workflow from registration to delivery.

## 🏥 Complete Medication Workflow

### 1. Patient Registration
- **Normal Registration**: Standard patient information
- **Emergency Registration**: Includes bed number and hospital location
- Data is automatically updated in Firebase and becomes visible to all authorized staff

### 2. Patient Login
- Patients can log in using credentials provided during registration
- First-time login requires password update for security

### 3. Doctor Prescription Process
- Doctor selects patient from registered patient list
- Chooses medicines from predefined database with categories:
  - Pain Relief, Antibiotics, Cardiovascular, Diabetes
  - Respiratory, Gastrointestinal, Mental Health
  - Emergency Medications, Vitamins/Supplements
- Each medicine is automatically marked as 'prescribed'
- Medicine added to patient's medicine list with status tracking

### 4. Pharmacy Notification System
- **Automatic notification** sent to pharmacy when prescription is created
- **Emergency vs Normal Decision Point**:
  - **Emergency**: High priority notification with bed number and location
  - **Normal**: Standard notification for regular processing

### 5. Emergency Workflow
- **Emergency patients** (registered with bed number and location):
  - Delivery task automatically created
  - Delivery person searches for medicine in pharmacy
  - Medicine delivered directly to patient's location (bed number)
  - Status updated to 'delivered' when complete

### 6. Normal Appointment Workflow
- **Regular patients**:
  - Pharmacy manually marks medicine as 'ready' online
  - Patient comes to pharmacy to collect medicine
  - Pharmacy marks medicine as 'sold' upon pickup

## 🎯 Key Features

### Role-Based Access Control
- **Doctors**: Create prescriptions, view their prescriptions
- **Pharmacy Staff**: Manage all prescriptions, handle notifications, process deliveries
- **Patients**: View own prescriptions and status updates
- **Receptionists**: Register patients with emergency flags

### Real-Time Status Tracking
- **Prescribed** → **Pharmacy Notified** → **Ready/Delivered** → **Sold/Completed**
- Live updates across all user interfaces
- Emergency priority handling

### Medicine Database
- 35+ predefined medicines across 9 categories
- Standardized dosage instructions, quantities, and durations
- Easy dropdown selection for doctors

### Firebase Integration
- **Collections**: users, prescriptions, pharmacy_notifications, delivery_tasks, medical_records
- **Security Rules**: Role-based access control
- **Real-time Updates**: Instant data synchronization

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-dada/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (see FIREBASE_SETUP.md for detailed instructions)
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Update configuration in `src/config/firebase.js`

4. **Run the application**
   ```bash
   npm start
   ```

## 📋 Testing the Complete Workflow

### Test Emergency Workflow:
1. Register patient as **emergency** with bed number and location
2. Doctor creates prescription for emergency patient
3. Check pharmacy notifications - should show high priority
4. Check delivery tasks - should have emergency delivery
5. Complete delivery and verify status updates

### Test Normal Workflow:
1. Register patient as **normal** (no emergency checkbox)
2. Doctor creates prescription for normal patient
3. Check pharmacy notifications - should show standard priority
4. Mark medicine as 'ready' in pharmacy
5. Mark as 'sold' when patient picks up

## 🔧 Components

- **Dashboard**: Main interface with role-based views
- **PatientRegister**: Registration with emergency handling
- **PrescriptionManager**: Medicine selection and prescription creation
- **PharmacyManager**: Three-tab interface (Notifications, Prescriptions, Deliveries)
- **MedicalRecordsManager**: Patient medical history
- **AppointmentScheduler**: Appointment booking system
- **EmergencySlotManager**: Emergency appointment handling

## 📱 User Interfaces

### Doctor Interface
- Patient selection and prescription creation
- Medicine database with dropdown selections
- Emergency patient identification
- Prescription history and status tracking

### Pharmacy Interface
- **Notifications Tab**: New prescription alerts with priority
- **Prescriptions Tab**: All prescriptions with status management
- **Deliveries Tab**: Emergency delivery task management

### Patient Interface
- Personal prescription history
- Medicine status tracking
- Appointment scheduling

## 🔒 Security

- Firebase Authentication with role-based access
- Secure Firestore rules preventing unauthorized access
- Password requirements and first-login security

## 📊 Data Models

Comprehensive data models for users, prescriptions, notifications, delivery tasks, and medical records with full workflow support.

## 📚 Documentation

- **FIREBASE_SETUP.md**: Detailed Firebase configuration guide
- **FIREBASE_SETUP_QUICK.md**: Quick start guide
- **MEDICATION_WORKFLOW.md**: Complete workflow documentation with decision points

## 🎨 Technology Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Real-time**: Firebase real-time updates
- **Deployment**: Firebase Hosting (optional)

This system provides a complete end-to-end medication management workflow with automatic decision points, real-time notifications, and comprehensive status tracking suitable for hospital environments.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
