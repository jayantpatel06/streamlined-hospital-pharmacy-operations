export const defaultStaffData = [
  {
    email: 'dr.smith@hospital.com',
    password: 'doctor123',
    firstName: 'Dr. John',
    lastName: 'Smith',
    role: 'doctor',
    phoneNumber: '+1-555-0101',
    department: 'Cardiology',
    specialization: 'Cardiologist',
    licenseNumber: 'MD-12345-CAR'
  },
  {
    email: 'dr.johnson@hospital.com',
    password: 'doctor123',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    role: 'doctor',
    phoneNumber: '+1-555-0102',
    department: 'Neurology',
    specialization: 'Neurologist',
    licenseNumber: 'MD-12346-NEU'
  },
  {
    email: 'dr.wilson@hospital.com',
    password: 'doctor123',
    firstName: 'Dr. Michael',
    lastName: 'Wilson',
    role: 'doctor',
    phoneNumber: '+1-555-0103',
    department: 'Pediatrics',
    specialization: 'Pediatrician',
    licenseNumber: 'MD-12347-PED'
  },
  {
    email: 'dr.brown@hospital.com',
    password: 'doctor123',
    firstName: 'Dr. Emily',
    lastName: 'Brown',
    role: 'doctor',
    phoneNumber: '+1-555-0104',
    department: 'Orthopedics',
    specialization: 'Orthopedic Surgeon',
    licenseNumber: 'MD-12348-ORT'
  },
  {
    email: 'dr.davis@hospital.com',
    password: 'doctor123',
    firstName: 'Dr. Robert',
    lastName: 'Davis',
    role: 'doctor',
    phoneNumber: '+1-555-0105',
    department: 'Emergency Medicine',
    specialization: 'Emergency Physician',
    licenseNumber: 'MD-12349-EMR'
  },

  {
    email: 'reception1@hospital.com',
    password: 'reception123',
    firstName: 'Alice',
    lastName: 'Cooper',
    role: 'receptionist',
    phoneNumber: '+1-555-0201',
    department: 'Front Desk'
  },
  {
    email: 'reception2@hospital.com',
    password: 'reception123',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'receptionist',
    phoneNumber: '+1-555-0202',
    department: 'Patient Services'
  },
  {
    email: 'reception3@hospital.com',
    password: 'reception123',
    firstName: 'Lisa',
    lastName: 'Wong',
    role: 'receptionist',
    phoneNumber: '+1-555-0203',
    department: 'Admissions'
  },

  {
    email: 'pharmacy1@hospital.com',
    password: 'pharmacy123',
    firstName: 'David',
    lastName: 'Martinez',
    role: 'pharmacy',
    phoneNumber: '+1-555-0301',
    department: 'Pharmacy'
  },
  {
    email: 'pharmacy2@hospital.com',
    password: 'pharmacy123',
    firstName: 'Jennifer',
    lastName: 'Lee',
    role: 'pharmacy',
    phoneNumber: '+1-555-0302',
    department: 'Clinical Pharmacy'
  },
  {
    email: 'pharmacy3@hospital.com',
    password: 'pharmacy123',
    firstName: 'Kevin',
    lastName: 'Thompson',
    role: 'pharmacy',
    phoneNumber: '+1-555-0303',
    department: 'Pharmaceutical Services'
  }
];

export const defaultPatientData = [
  {
    email: 'patient1@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1-555-1001',
    dateOfBirth: '1985-03-15',
    address: '123 Main St, City, State 12345',
    emergencyContact: '+1-555-1002',
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    medicalHistory: 'No significant medical history'
  },
  {
    email: 'patient2@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+1-555-1003',
    dateOfBirth: '1990-07-22',
    address: '456 Oak Ave, City, State 12345',
    emergencyContact: '+1-555-1004',
    bloodGroup: 'A+',
    allergies: 'None known',
    medicalHistory: 'Hypertension, managed with medication'
  }
];

export const loginInstructions = {
  doctor: {
    title: 'Doctor Login Instructions',
    credentials: 'Use any doctor email (dr.smith@hospital.com, dr.johnson@hospital.com, etc.) with password: doctor123',
    features: [
      'View and manage patient appointments',
      'Access patient medical records',
      'Create and manage prescriptions',
      'Update medical records'
    ]
  },
  receptionist: {
    title: 'Receptionist Login Instructions',
    credentials: 'Use any reception email (reception1@hospital.com, reception2@hospital.com, etc.) with password: reception123',
    features: [
      'Register new patients',
      'View patient information',
      'Schedule appointments',
      'Generate reports'
    ]
  },
  pharmacy: {
    title: 'Pharmacy Staff Login Instructions',
    credentials: 'Use any pharmacy email (pharmacy1@hospital.com, pharmacy2@hospital.com, etc.) with password: pharmacy123',
    features: [
      'Process medicine orders',
      'Review prescriptions',
      'Manage inventory',
      'Track order status'
    ]
  },
  patient: {
    title: 'Patient Login Instructions',
    credentials: 'Patients receive credentials when registered by reception staff',
    process: [
      'Receptionist registers patient with basic information',
      'System generates unique Patient ID (PAT######)',
      'System creates temporary password (temp######)',
      'Patient receives printed credentials',
      'Patient logs in and must change password on first login'
    ],
    features: [
      'View appointments',
      'Access medical records',
      'View prescriptions',
      'Track medicine orders'
    ]
  }
};

export default {
  defaultStaffData,
  defaultPatientData,
  loginInstructions
};