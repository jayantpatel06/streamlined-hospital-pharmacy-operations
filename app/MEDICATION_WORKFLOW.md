# Hospital Medication Workflow System

This document describes the complete medication workflow from patient registration to medicine delivery/pickup.

## Workflow Overview

```
START (Patient Registration)
    ↓
[Patient Data Updated] (GREEN)
    ↓
[Patient Can Log In] (GREEN)
    ↓
[Doctor Selects Medicine from List] (GRAY)
    ↓
[Medicine Marked as 'Prescribed'] (GRAY)
    ↓
[Added to Patient's Medicine List] (GRAY)
    ↓
[Notification Sent to Pharmacy] (BLUE)
    ↓
DECISION: Emergency vs Normal Appointment? (DIAMOND)
    ↓                           ↓
Emergency Path               Normal Path
    ↓                           ↓
[Bed Number & Location      [Pharmacy Marks Medicine
 Taken During Registration]  as 'Ready' Online] (BLUE)
    ↓                           ↓
[Delivery Person Searches   [Patient Comes to Pharmacy
 for Medicine] (BLUE)        and Takes Medicine] (GREEN)
    ↓                           ↓
[Medicine Delivered to      [Medicine Marked as 'Sold']
 Patient's Location] (GREEN)  (GREEN)
    ↓                           ↓
    END                         END
```

## Color Coding
- 🟢 GREEN: Data Updated, Patient Login, Medicine Delivery/Pickup
- 🔵 BLUE: Notifications, Pharmacy Actions
- ⚫ GRAY: Medicine Prescribed, Doctor Actions
- 🔶 DIAMOND: Decision Points

## Implementation Status

✅ **Patient Registration Enhanced**
- Added emergency registration fields (bed number, location)
- Emergency checkbox to trigger special workflow

✅ **Doctor Prescription Creation**
- Medicine selection from predefined list
- Automatic marking as 'prescribed'
- Addition to patient's medicine list
- Emergency detection based on patient registration

✅ **Pharmacy Notification System**
- Automatic notification sent to pharmacy when prescription created
- Emergency vs normal appointment detection
- Priority handling for emergency cases

✅ **Emergency Delivery Workflow**
- Automatic delivery task creation for emergency patients
- Bed number and location tracking
- Delivery person assignment and tracking

✅ **Normal Appointment Workflow**
- Pharmacy can mark medicines as 'ready'
- Patient pickup tracking
- Medicine marked as 'sold' upon pickup

✅ **Pharmacy Manager Interface**
- Three-tab interface: Notifications, Prescriptions, Emergency Deliveries
- Status tracking for all medications
- Role-based access control

## Database Collections

1. **users** - Patient and staff information including emergency flags
2. **prescriptions** - Prescription data with emergency status
3. **pharmacy_notifications** - Real-time notifications to pharmacy
4. **delivery_tasks** - Emergency delivery assignments
5. **pharmacy_orders** - General medication orders

## Key Features

### Emergency Detection
- Automatic detection based on patient registration
- Emergency patients have bed number and location
- Priority handling throughout the workflow

### Status Tracking
- prescribed → ready → sold (normal path)
- prescribed → ready → delivered (emergency path)
- Real-time status updates across all interfaces

### Notification System
- Instant pharmacy notifications
- Emergency priority alerts
- Delivery task assignments

### Role-Based Access
- Doctors: Create prescriptions, view their prescriptions
- Pharmacy: Manage all prescriptions, handle deliveries
- Patients: View their own prescriptions and status
- Receptionists: Register patients with emergency flags

## Workflow Decision Points

### 1. Emergency vs Normal Registration
**Decision**: Is this an emergency patient?
- **Emergency**: Collect bed number and location
- **Normal**: Standard registration only

### 2. Prescription Creation
**Decision**: Is patient registered as emergency?
- **Emergency**: Create delivery task automatically
- **Normal**: Standard pharmacy notification only

### 3. Medicine Status Updates
**Decision**: Emergency delivery or normal pickup?
- **Emergency**: Mark as delivered when delivery completed
- **Normal**: Mark as sold when patient picks up

## Technical Implementation

The workflow is implemented using:
- **Firebase Firestore** for real-time data synchronization
- **React Components** for user interfaces
- **Event-driven Architecture** for workflow automation
- **Role-based Security Rules** for data access control

All decision points are automated based on patient registration data and prescription context.
