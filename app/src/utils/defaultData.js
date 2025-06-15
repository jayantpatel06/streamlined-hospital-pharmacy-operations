// Hospital Management System - Production Configuration
// Real-time data management without mock data

// System Roles and Permissions Configuration
export const systemRoles = {
  super_admin: {
    name: "Super Administrator",
    description: "Global system administrator with access to all hospitals",
    permissions: ["system_overview", "hospital_management", "global_analytics", "user_management"],
    access: ["all_hospitals", "system_settings", "global_reports"]
  },
  hospital_admin: {
    name: "Hospital Administrator", 
    description: "Hospital-specific administrator managing staff and operations",
    permissions: ["hospital_management", "staff_registration", "hospital_settings", "hospital_analytics"],
    access: ["own_hospital", "staff_management", "hospital_reports", "operational_dashboard"]
  },
  doctor: {
    name: "Doctor",
    description: "Medical professional with patient care responsibilities",
    permissions: ["patient_care", "prescriptions", "medical_records", "patient_diagnosis"],
    access: ["hospital_patients", "prescription_manager", "medical_records", "appointment_management"]
  },
  nurse: {
    name: "Nurse",
    description: "Healthcare professional supporting patient care",
    permissions: ["patient_care", "medical_records_view", "patient_support", "medication_assistance"],
    access: ["hospital_patients", "medical_records", "patient_details", "care_coordination"]
  },
  receptionist: {
    name: "Receptionist",
    description: "Administrative staff handling patient registration and scheduling",
    permissions: ["patient_registration", "appointments", "billing", "patient_admission"],
    access: ["patient_register", "patient_admission", "appointment_scheduler", "billing_manager"]
  },
  pharmacy: {
    name: "Pharmacy Staff",
    description: "Pharmaceutical professionals managing medication dispensing",
    permissions: ["medication_management", "prescription_processing", "delivery_coordination", "inventory_management"],
    access: ["pharmacy_manager", "prescription_notifications", "delivery_tasks", "medication_status"]
  },
  patient: {
    name: "Patient",
    description: "Registered patient with access to personal medical information",
    permissions: ["own_records", "prescription_status", "appointment_booking", "medical_history"],
    access: ["patient_portal", "medical_records", "prescription_history", "appointment_status"]
  }
};

// Hospital Department Categories
export const hospitalDepartments = [
  "General Medicine",
  "Emergency Medicine", 
  "Surgery",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "ICU",
  "Obstetrics & Gynecology",
  "Psychiatry",
  "Radiology",
  "Pathology",
  "Anesthesiology",
  "Dermatology",
  "Ophthalmology",
  "ENT (Ear, Nose, Throat)",
  "Urology",
  "Gastroenterology",
  "Pulmonology",
  "Nephrology",
  "Endocrinology",
  "Oncology",
  "Pharmacy",
  "Administration"
];

// Medical Specializations
export const medicalSpecializations = [
  "Internal Medicine",
  "Emergency Medicine",
  "General Surgery",
  "Cardiac Surgery",
  "Neurosurgery",
  "Orthopedic Surgery",
  "Plastic Surgery",
  "Pediatric Surgery",
  "Cardiologist",
  "Neurologist",
  "Orthopedist",
  "Pediatrician",
  "Psychiatrist",
  "Radiologist", 
  "Pathologist",
  "Anesthesiologist",
  "Dermatologist",
  "Ophthalmologist",
  "ENT Specialist",
  "Urologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Nephrologist",
  "Endocrinologist",
  "Oncologist",
  "Pharmacist",
  "Clinical Pharmacist",
  "Nurse Practitioner",
  "Registered Nurse"
];

// Hospital Types
export const hospitalTypes = [
  "General Hospital",
  "Children's Hospital",
  "Women's Hospital",
  "Specialty Hospital",
  "Teaching Hospital",
  "Research Hospital",
  "Rehabilitation Hospital",
  "Psychiatric Hospital",
  "Cancer Center",
  "Heart Institute",
  "Trauma Center",
  "Community Hospital",
  "Private Hospital",
  "Public Hospital"
];

// Ward Types and Capacities
export const wardTypes = [
  { value: 'emergency', label: 'Emergency Ward', defaultCapacity: 20 },
  { value: 'icu', label: 'ICU', defaultCapacity: 12 },
  { value: 'general', label: 'General Ward', defaultCapacity: 50 },
  { value: 'private', label: 'Private Room', defaultCapacity: 25 },
  { value: 'pediatric', label: 'Pediatric Ward', defaultCapacity: 30 },
  { value: 'maternity', label: 'Maternity Ward', defaultCapacity: 20 },
  { value: 'surgical', label: 'Surgical Ward', defaultCapacity: 35 },
  { value: 'cardiac', label: 'Cardiac Unit', defaultCapacity: 15 },
  { value: 'neuro', label: 'Neurology Ward', defaultCapacity: 18 },
  { value: 'ortho', label: 'Orthopedic Ward', defaultCapacity: 22 }
];

// Admission Types
export const admissionTypes = [
  { value: 'emergency', label: '🚨 Emergency Admission', priority: 1, deliveryType: 'bedside' },
  { value: 'planned', label: '📅 Planned Admission', priority: 2, deliveryType: 'bedside' },
  { value: 'transfer', label: '🔄 Transfer Admission', priority: 2, deliveryType: 'bedside' },
  { value: 'outpatient', label: '🏃 Outpatient Visit', priority: 3, deliveryType: 'pharmacy' }
];

// Severity Levels
export const severityLevels = [
  { value: 'critical', label: 'Critical', priority: 1, color: 'red' },
  { value: 'high', label: 'High', priority: 2, color: 'orange' },
  { value: 'medium', label: 'Medium', priority: 3, color: 'yellow' },
  { value: 'low', label: 'Low', priority: 4, color: 'green' }
];

// Blood Groups
export const bloodGroups = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

// Prescription Status Options
export const prescriptionStatuses = [
  { value: 'prescribed', label: 'Prescribed', color: 'yellow' },
  { value: 'pharmacy_notified', label: 'Pharmacy Notified', color: 'blue' },
  { value: 'preparing', label: 'Preparing', color: 'orange' },
  { value: 'ready', label: 'Ready', color: 'green' },
  { value: 'dispensed', label: 'Dispensed', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'teal' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

// Delivery Types
export const deliveryTypes = [
  { value: 'bedside', label: 'Bedside Delivery', description: 'For admitted emergency patients' },
  { value: 'pharmacy', label: 'Pharmacy Pickup', description: 'For regular outpatients' }
];

// Payment Methods
export const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Insurance',
  'Bank Transfer',
  'Digital Wallet',
  'Check'
];

// System Configuration
export const systemConfig = {
  features: {
    multiHospitalSupport: true,
    realTimeNotifications: true,
    automaticBilling: true,
    inventoryManagement: true,
    emergencyPriority: true,
    deliveryTracking: true,
    performanceAnalytics: true,
    secureAccess: true
  },
  
  limits: {
    maxHospitalsPerNetwork: null, // Unlimited
    maxUsersPerHospital: 10000,
    maxPatientsPerHospital: 50000,
    maxConcurrentUsers: 1000,
    prescriptionRetentionDays: 2555, // 7 years
    appointmentAdvanceBookingDays: 365
  },
  
  defaults: {
    patientIdPrefix: 'PAT',
    admissionIdPrefix: 'ADM',
    prescriptionIdPrefix: 'RX',
    appointmentIdPrefix: 'APT',
    billIdPrefix: 'BILL',
    tempPasswordPrefix: 'temp',
    defaultHospitalCapacity: 200,
    emergencyWardCapacity: 20,
    icuCapacity: 12
  }
};

// Production Login Instructions (No Mock Credentials)
export const loginInstructions = {
  hospital_admin: {
    title: 'Hospital Administrator Access',
    description: 'Hospital administrators are created during hospital registration process',
    process: [
      'Register your hospital through the Hospital Registration wizard',
      'Complete the 3-step process: Hospital Info → Departments → Admin Account',
      'System creates your hospital admin account automatically',
      'Use the credentials provided during registration to login',
      'Access hospital management, staff registration, and analytics'
    ],
    features: [
      'Register and manage all hospital staff',
      'Configure hospital settings and departments',
      'Monitor hospital operations and analytics',
      'Access operational dashboard for patient care'
    ]
  },
  
  staff: {
    title: 'Hospital Staff Access',
    description: 'All staff accounts are created by hospital administrators',
    process: [
      'Hospital admin registers staff through Staff Management',
      'Staff receives login credentials from hospital admin',
      'Login with provided email and password',
      'Access role-specific features and patient care tools'
    ],
    roles: {
      doctor: [
        'Create and manage patient prescriptions',
        'Access patient medical records and history',
        'Schedule and manage appointments',
        'Update patient diagnoses and treatment plans'
      ],
      nurse: [
        'View patient medical records and care plans',
        'Assist with patient care coordination',
        'Monitor patient status and updates',
        'Support medication administration'
      ],
      receptionist: [
        'Register new patients in the system',
        'Admit patients and allocate beds',
        'Schedule patient appointments',
        'Manage billing and payment processing'
      ],
      pharmacy: [
        'Receive and process prescription notifications',
        'Manage medication preparation and dispensing',
        'Coordinate delivery tasks for emergency patients',
        'Track medication status and inventory'
      ]
    }
  },
  
  patient: {
    title: 'Patient Access',
    description: 'Patient accounts are created during hospital registration',
    process: [
      'Receptionist registers patient with personal information',
      'System generates unique Patient ID and temporary password',
      'Patient receives printed credentials card',
      'Login with Patient ID and temporary password',
      'Must change password on first login for security'
    ],
    features: [
      'View personal medical records and history',
      'Track prescription status and medication pickup',
      'Access appointment schedules and details',
      'Receive real-time notifications for medication ready'
    ]
  },
  
  super_admin: {
    title: 'Super Administrator Access',
    description: 'System-wide administrator with global oversight',
    access: 'Contact system administrators for super admin credentials',
    features: [
      'Monitor all hospitals in the network',
      'Access system-wide analytics and performance metrics',
      'Manage hospital registrations and approvals',
      'Oversee global system operations and security'
    ]
  }
};

// Data Validation Rules
export const validationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  patientId: /^PAT\d{6}$/,
  admissionId: /^ADM\d{9}$/,
  prescriptionId: /^RX\d{8}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  licenseNumber: /^[A-Z]{2}-\d{5}-[A-Z]{3}$/
};

// System Status Messages
export const systemMessages = {
  success: {
    patientRegistered: 'Patient registered successfully! Credentials have been generated.',
    staffAdded: 'Staff member added successfully! Login credentials have been provided.',
    prescriptionCreated: 'Prescription created and pharmacy has been notified automatically.',
    patientAdmitted: 'Patient admitted successfully! Bed allocated and emergency protocols activated.',
    medicationDispensed: 'Medication dispensed successfully! Patient/delivery notification sent.',
    appointmentScheduled: 'Appointment scheduled successfully! Confirmation sent to patient.'
  },
  
  errors: {
    unauthorizedAccess: 'Access denied. Please contact your administrator for proper credentials.',
    duplicateEmail: 'Email address already exists in the system.',
    invalidCredentials: 'Invalid email or password. Please check and try again.',
    hospitalFull: 'Selected ward is at full capacity. Please choose a different ward.',
    prescriptionNotFound: 'Prescription not found or access denied.',
    patientNotFound: 'Patient not found in hospital database.'
  },
  
  warnings: {
    firstLogin: 'First-time login detected. Please update your password for security.',
    wardCapacity: 'Ward is approaching full capacity. Consider alternative arrangements.',
    emergencyAlert: 'Emergency patient detected. Priority processing initiated.',
    prescriptionExpiry: 'Prescription is nearing expiry date. Please process urgently.'
  }
};

export default {
  systemRoles,
  hospitalDepartments,
  medicalSpecializations,
  hospitalTypes,
  wardTypes,
  admissionTypes,
  severityLevels,
  bloodGroups,
  prescriptionStatuses,
  deliveryTypes,
  paymentMethods,
  systemConfig,
  loginInstructions,
  validationRules,
  systemMessages
};