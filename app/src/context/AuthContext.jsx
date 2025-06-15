import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db, secondaryAuth } from '../config/firebase';
import { medicineDatabase } from '../utils/medicineDatabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const generatePatientId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAT${timestamp}${random}`;
  };  const registerPatient = async (patientData) => {
    try {
      const patientId = generatePatientId();
      const tempPassword = `temp${patientId.slice(-6)}`;
      
      const { user } = await createUserWithEmailAndPassword(secondaryAuth, patientData.email, tempPassword);
      
      await updateProfile(user, {
        displayName: `${patientData.firstName} ${patientData.lastName}`
      });

      const patientRecord = {
        uid: user.uid,
        patientId: patientId,
        email: patientData.email,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        role: 'patient',
        phoneNumber: patientData.phoneNumber || '',
        dateOfBirth: patientData.dateOfBirth || '',
        address: patientData.address || '',
        emergencyContact: patientData.emergencyContact || '',
        bloodGroup: patientData.bloodGroup || '',
        allergies: patientData.allergies || '',
        medicalHistory: patientData.medicalHistory || '',
        registeredBy: currentUser.uid,
        registrationDate: new Date().toISOString(),
        isActive: true,
        isFirstLogin: true,
        tempPassword: tempPassword
      };

      await setDoc(doc(db, 'users', user.uid), patientRecord);
      
      await signOut(secondaryAuth);
      
      return { patientId, tempPassword, patientRecord };
    } catch (error) {
      throw error;
    }
  };
  const registerStaff = async (email, password, staffData) => {
    try {
      console.log('Attempting to register staff with email:', email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', user.uid);
      
      await updateProfile(user, {
        displayName: `${staffData.firstName} ${staffData.lastName}`
      });

      let staffId;
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      
      switch(staffData.role) {
        case 'doctor':
          staffId = `DOC${timestamp}${random}`;
          break;
        case 'receptionist':
          staffId = `REC${timestamp}${random}`;
          break;
        case 'pharmacy':
          staffId = `PHR${timestamp}${random}`;
          break;
        default:
          staffId = `STF${timestamp}${random}`;
      }


      const staffRecord = {
        uid: user.uid,
        staffId: staffId,
        email: user.email,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        role: staffData.role,
        phoneNumber: staffData.phoneNumber || '',
        department: staffData.department || '',
        specialization: staffData.specialization || '', // for doctors
        licenseNumber: staffData.licenseNumber || '', // for doctors        
        joinDate: staffData.joinDate || new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), staffRecord);
      console.log('Staff record created in Firestore');
      
      setUserRole(staffData.role);
      setUserDetails(staffRecord);
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. ';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage += 'This email is already registered. Please use a different email or try logging in.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage += 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage += 'Email/password authentication is not enabled. Please contact the administrator.';
          break;
        case 'auth/admin-restricted-operation':
          errorMessage += 'This operation is restricted. Please contact the administrator.';
          break;
        default:
          errorMessage += error.message || 'An unexpected error occurred. Please try again.';
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.code = error.code;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  };

  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        setUserDetails(userData);
        
        if (userData.role === 'patient' && userData.isFirstLogin) {
          return { user, isFirstLogin: true, tempPassword: userData.tempPassword };
        }
      }
      
      return { user, isFirstLogin: false };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setUserDetails(null);
    } catch (error) {
      throw error;
    }
  };
  const updatePatientPassword = async (newPassword) => {
    try {
      if (currentUser && userRole === 'patient') {
        await updatePassword(currentUser, newPassword);
        
        await setDoc(doc(db, 'users', currentUser.uid), {
          isFirstLogin: false,
          tempPassword: null,
          passwordUpdatedAt: new Date().toISOString()
        }, { merge: true });
        
        setUserDetails(prev => ({
          ...prev,
          isFirstLogin: false,
          tempPassword: null
        }));
      }
    } catch (error) {
      throw error;
    }
  };

  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      throw error;
    }
  };
  const getPatients = async () => {
    try {
      // Filter patients by hospital ID to maintain data isolation
      const patientsSnapshot = await getDocs(
        query(
          collection(db, 'users'), 
          where('role', '==', 'patient'),
          where('hospitalId', '==', userDetails?.hospitalId || '')
        )
      );
      return patientsSnapshot.docs.map(doc => doc.data());
    } catch (error) {
      throw error;
    }
  };

  const createAppointment = async (appointmentData) => {
    try {
      const appointmentId = `APT${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const appointment = {
        appointmentId,
        ...appointmentData,
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      };
      
      await setDoc(doc(db, 'appointments', appointmentId), appointment);
      return appointment;
    } catch (error) {
      throw error;
    }
  };

  const createPrescription = async (prescriptionData) => {
    try {
      const prescriptionId = `RX${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const prescription = {
        prescriptionId,
        prescriptionNumber: prescriptionId,
        ...prescriptionData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      await setDoc(doc(db, 'prescriptions', prescriptionId), prescription);
      return prescription;
    } catch (error) {
      throw error;
    }
  };

  const createPharmacyOrder = async (orderData) => {
    try {
      const orderId = `ORD${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const order = {
        orderId,
        orderNumber: orderId,
        ...orderData,
        orderDate: new Date().toISOString(),
        status: 'pending'
      };
      
      await setDoc(doc(db, 'pharmacy_orders', orderId), order);
      return order;
    } catch (error) {
      throw error;
    }
  };

  const createMedicalRecord = async (recordData) => {
    try {
      const recordId = `REC${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const record = {
        recordId,
        ...recordData,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'medical_records', recordId), record);
      return record;
    } catch (error) {
      throw error;
    }
  };

  const createEmergencySlot = async (slotData) => {
    try {
      const slotId = `EMG${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const slot = {
        slotId,
        ...slotData,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'emergency_slots', slotId), slot);
      return slot;
    } catch (error) {
      throw error;
    }
  };
  
  const updateEmergencySlotStatus = async (slotId, status) => {
    try {
      await setDoc(doc(db, 'emergency_slots', slotId), {
        status,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return { slotId, status };
    } catch (error) {
      throw error;
    }
  };

  const createPharmacyNotification = async (prescriptionData) => {
    try {
      const notificationId = `NOTIF${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const notification = {
        notificationId,
        type: 'prescription',
        prescriptionId: prescriptionData.prescriptionId,
        patientId: prescriptionData.patientId,
        patientName: prescriptionData.patientName,
        isEmergency: prescriptionData.isEmergency || false,
        bedNumber: prescriptionData.bedNumber || null,
        location: prescriptionData.location || null,
        medications: prescriptionData.medications,
        status: 'pending',
        createdAt: new Date().toISOString(),
        priority: prescriptionData.isEmergency ? 'high' : 'normal'
      };
      
      await setDoc(doc(db, 'pharmacy_notifications', notificationId), notification);
      return notification;
    } catch (error) {
      throw error;
    }
  };

  const updateMedicationStatus = async (prescriptionId, medicationIndex, status) => {
    try {
      const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
      const prescriptionDoc = await getDoc(prescriptionRef);
      
      if (prescriptionDoc.exists()) {
        const data = prescriptionDoc.data();
        const updatedMedications = [...data.medications];
        updatedMedications[medicationIndex] = {
          ...updatedMedications[medicationIndex],
          status: status,
          statusUpdatedAt: new Date().toISOString()
        };
        
        await updateDoc(prescriptionRef, {
          medications: updatedMedications,
          lastUpdated: new Date().toISOString()
        });
        
        return { prescriptionId, medicationIndex, status };
      }
    } catch (error) {
      throw error;
    }
  };

  const createDeliveryTask = async (taskData) => {
    try {
      const taskId = `DELIV${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const task = {
        taskId,
        prescriptionId: taskData.prescriptionId,
        patientId: taskData.patientId,
        patientName: taskData.patientName,
        bedNumber: taskData.bedNumber,
        location: taskData.location,
        medications: taskData.medications,
        status: 'assigned',
        priority: 'emergency',
        assignedAt: new Date().toISOString(),
        deliveryInstructions: taskData.deliveryInstructions || ''
      };
      
      await setDoc(doc(db, 'delivery_tasks', taskId), task);
      return task;
    } catch (error) {
      throw error;
    }
  };

  // Billing Functions
  const createBill = async (billData) => {
    try {
      const billId = `BILL${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const bill = {
        billId,
        patientId: billData.patientId,
        patientName: billData.patientName,
        services: billData.services || [],
        medications: billData.medications || [],
        totalAmount: billData.totalAmount || 0,
        status: 'pending',
        billDate: new Date().toISOString(),
        dueDate: billData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        paymentMethod: '',
        paymentDate: null,
        discount: billData.discount || 0,
        tax: billData.tax || 0,
        insuranceCovered: billData.insuranceCovered || 0,
        createdBy: billData.createdBy || '',
        notes: billData.notes || ''
      };
      
      await setDoc(doc(db, 'bills', billId), bill);
      return bill;
    } catch (error) {
      throw error;
    }
  };

  const updateBillPayment = async (billId, paymentData) => {
    try {
      const billRef = doc(db, 'bills', billId);
      await updateDoc(billRef, {
        status: 'paid',
        paymentMethod: paymentData.paymentMethod,
        paymentDate: new Date().toISOString(),
        amountPaid: paymentData.amountPaid,
        paymentReference: paymentData.paymentReference || '',
        lastUpdated: new Date().toISOString()
      });
      return { billId, status: 'paid' };
    } catch (error) {
      throw error;
    }
  };

  const getBills = async (filters = {}) => {
    try {
      let billsQuery = collection(db, 'bills');
      
      if (filters.patientId) {
        billsQuery = query(billsQuery, where('patientId', '==', filters.patientId));
      }
      if (filters.status) {
        billsQuery = query(billsQuery, where('status', '==', filters.status));
      }
      
      const billsSnapshot = await getDocs(billsQuery);
      return billsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  };

  const calculateServiceBill = (services, medications = []) => {
    const serviceCharges = services.reduce((total, service) => {
      return total + (service.cost || 0);
    }, 0);
    
    const medicationCharges = medications.reduce((total, med) => {
      return total + ((med.cost || 0) * (med.quantity || 1));
    }, 0);
    
    const subtotal = serviceCharges + medicationCharges;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return {
      serviceCharges,
      medicationCharges,
      subtotal,
      tax,
      total
    };
  };

  // Enhanced createAppointment with billing
  const createAppointmentWithBilling = async (appointmentData) => {
    try {
      // Create appointment first
      const appointment = await createAppointment(appointmentData);
      
      // Create associated bill
      const services = [
        {
          name: `${appointmentData.type} Consultation`,
          cost: getConsultationFee(appointmentData.type, appointmentData.department),
          description: `${appointmentData.type} appointment with ${appointmentData.doctorName}`
        }
      ];
      
      const billing = calculateServiceBill(services);
      
      const billData = {
        patientId: appointmentData.patientId,
        patientName: appointmentData.patientName,
        services: services,
        totalAmount: billing.total,
        tax: billing.tax,
        appointmentId: appointment.appointmentId,
        createdBy: appointmentData.createdBy || ''
      };
      
      const bill = await createBill(billData);
      
      return { appointment, bill };
    } catch (error) {
      throw error;
    }
  };

  const getConsultationFee = (appointmentType, department) => {
    const fees = {
      'Consultation': {
        'Cardiology': 150,
        'Neurology': 180,
        'Orthopedics': 120,
        'Pediatrics': 100,
        'General Medicine': 80,
        'Emergency': 200,
        'default': 100
      },
      'Follow-up': {
        'Cardiology': 75,
        'Neurology': 90,
        'Orthopedics': 60,
        'Pediatrics': 50,
        'General Medicine': 40,
        'Emergency': 100,
        'default': 50
      },
      'Emergency': {
        'default': 300
      },
      'default': 100
    };
    
    return fees[appointmentType]?.[department] || 
           fees[appointmentType]?.['default'] || 
           fees['default'];
  };

  // Enhanced createPrescription with billing
  const createPrescriptionWithBilling = async (prescriptionData) => {
    try {
      // Create prescription first
      const prescription = await createPrescription(prescriptionData);
      
      // Calculate medication costs
      const medications = prescriptionData.medications.map(med => ({
        ...med,
        cost: getMedicationCost(med.name),
        quantity: parseInt(med.quantity) || 1
      }));
      
      const billing = calculateServiceBill([], medications);
      
      const billData = {
        patientId: prescriptionData.patientId,
        patientName: prescriptionData.patientName,
        medications: medications,
        totalAmount: billing.total,
        tax: billing.tax,
        prescriptionId: prescription.prescriptionId,
        createdBy: prescriptionData.doctorId || ''
      };
      
      const bill = await createBill(billData);
      
      return { prescription, bill };
    } catch (error) {
      throw error;
    }
  };
  const getMedicationCost = (medicationName) => {
    // Find the medication in the database
    const medication = medicineDatabase.find(med => med.name === medicationName);
    return medication ? medication.cost : 2.0; // Default cost if not found
  };

  // Hospital Management Functions
  const generateHospitalId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HSP${timestamp}${random}`;
  };

  const registerHospital = async (hospitalData, adminData) => {
    try {
      const hospitalId = generateHospitalId();
      
      // Create admin user first
      const { user } = await createUserWithEmailAndPassword(secondaryAuth, adminData.email, adminData.password);
      
      await updateProfile(user, {
        displayName: `${adminData.firstName} ${adminData.lastName}`
      });

      // Create hospital record
      const hospital = {
        hospitalId,
        name: hospitalData.name,
        address: hospitalData.address,
        city: hospitalData.city,
        state: hospitalData.state,
        zipCode: hospitalData.zipCode,
        phoneNumber: hospitalData.phoneNumber,
        email: hospitalData.email,
        website: hospitalData.website || '',
        type: hospitalData.type || 'General Hospital',
        bedCapacity: hospitalData.bedCapacity || 100,
        departments: hospitalData.departments || ['General Medicine', 'Emergency', 'Surgery'],
        adminId: user.uid,
        registrationDate: new Date().toISOString(),
        status: 'active',
        licenseNumber: hospitalData.licenseNumber,
        accreditation: hospitalData.accreditation || [],
        services: hospitalData.services || []
      };

      await setDoc(doc(db, 'hospitals', hospitalId), hospital);

      // Create admin record
      const adminRecord = {
        uid: user.uid,
        staffId: `ADM${hospitalId.slice(-6)}`,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: 'hospital_admin',
        hospitalId: hospitalId,
        hospitalName: hospitalData.name,
        phoneNumber: adminData.phoneNumber,
        department: 'Administration',
        position: 'Hospital Administrator',
        isActive: true,
        registrationDate: new Date().toISOString(),
        permissions: [
          'manage_staff',
          'view_all_patients',
          'manage_departments',
          'view_financial_reports',
          'manage_hospital_settings'
        ]
      };

      await setDoc(doc(db, 'users', user.uid), adminRecord);

      return { hospital, admin: adminRecord };
    } catch (error) {
      throw error;
    }
  };

  const getHospitals = async () => {
    try {
      const hospitalsQuery = query(collection(db, 'hospitals'));
      const hospitalsSnapshot = await getDocs(hospitalsQuery);
      return hospitalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  };

  const getHospitalById = async (hospitalId) => {
    try {
      const hospitalDoc = await getDoc(doc(db, 'hospitals', hospitalId));
      return hospitalDoc.exists() ? { id: hospitalDoc.id, ...hospitalDoc.data() } : null;
    } catch (error) {
      throw error;
    }
  };

  const updateHospitalSettings = async (hospitalId, settings) => {
    try {
      const hospitalRef = doc(db, 'hospitals', hospitalId);
      await updateDoc(hospitalRef, {
        ...settings,
        lastUpdated: new Date().toISOString()
      });
      return { hospitalId, ...settings };
    } catch (error) {
      throw error;
    }
  };

  // Enhanced registerStaff to include hospital context
  const registerStaffForHospital = async (email, password, staffData, hospitalId) => {
    try {
      const { user } = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      await updateProfile(user, {
        displayName: `${staffData.firstName} ${staffData.lastName}`
      });

      // Get hospital info
      const hospital = await getHospitalById(hospitalId);
      if (!hospital) {
        throw new Error('Hospital not found');
      }

      const staffId = `${staffData.role.toUpperCase().slice(0,3)}${hospitalId.slice(-6)}${Date.now().toString().slice(-3)}`;

      const staffRecord = {
        uid: user.uid,
        staffId: staffId,
        email: email,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        role: staffData.role,
        hospitalId: hospitalId,
        hospitalName: hospital.name,
        phoneNumber: staffData.phoneNumber,
        department: staffData.department,
        specialization: staffData.specialization || '',
        licenseNumber: staffData.licenseNumber || '',
        position: staffData.position || '',
        isActive: true,
        registrationDate: new Date().toISOString(),
        hireDate: staffData.hireDate || new Date().toISOString(),
        permissions: getStaffPermissions(staffData.role)
      };

      await setDoc(doc(db, 'users', user.uid), staffRecord);
      
      return staffRecord;
    } catch (error) {
      throw error;
    }
  };

  const getStaffPermissions = (role) => {
    const permissions = {
      hospital_admin: [
        'manage_staff',
        'view_all_patients',
        'manage_departments',
        'view_financial_reports',
        'manage_hospital_settings',
        'create_appointments',
        'manage_billing'
      ],
      doctor: [
        'view_patients',
        'create_prescriptions',
        'create_medical_records',
        'create_appointments',
        'manage_emergency_slots'
      ],
      nurse: [
        'view_patients',
        'update_medical_records',
        'assist_prescriptions',
        'view_appointments'
      ],
      receptionist: [
        'register_patients',
        'create_appointments',
        'manage_billing',
        'view_patients',
        'schedule_appointments'
      ],
      pharmacy: [
        'view_prescriptions',
        'update_medication_status',
        'manage_inventory',
        'create_delivery_tasks'
      ],
      lab_technician: [
        'view_lab_orders',
        'update_lab_results',
        'manage_lab_equipment'
      ]
    };
    
    return permissions[role] || [];
  };

  // Enhanced getPatients to filter by hospital
  const getPatientsForHospital = async (hospitalId = null) => {
    try {
      let patientsQuery;
      
      if (hospitalId) {
        patientsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'patient'),
          where('hospitalId', '==', hospitalId)
        );
      } else if (userDetails?.hospitalId) {
        patientsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'patient'),
          where('hospitalId', '==', userDetails.hospitalId)
        );
      } else {
        patientsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'patient')
        );
      }
      
      const patientsSnapshot = await getDocs(patientsQuery);
      return patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  };

  const getStaffForHospital = async (hospitalId = null) => {
    try {
      const targetHospitalId = hospitalId || userDetails?.hospitalId;
      if (!targetHospitalId) return [];

      const staffQuery = query(
        collection(db, 'users'),
        where('hospitalId', '==', targetHospitalId),
        where('role', 'in', ['doctor', 'nurse', 'receptionist', 'pharmacy', 'lab_technician', 'hospital_admin'])
      );
      
      const staffSnapshot = await getDocs(staffQuery);
      return staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  };

  // Enhanced patient registration to include hospital context
  const registerPatientForHospital = async (patientData, hospitalId = null) => {
    try {
      const targetHospitalId = hospitalId || userDetails?.hospitalId;
      if (!targetHospitalId) {
        throw new Error('Hospital context required for patient registration');
      }

      const hospital = await getHospitalById(targetHospitalId);
      if (!hospital) {
        throw new Error('Hospital not found');
      }

      const patientId = generatePatientId();
      const tempPassword = `temp${patientId.slice(-6)}`;
      
      const { user } = await createUserWithEmailAndPassword(secondaryAuth, patientData.email, tempPassword);
      
      await updateProfile(user, {
        displayName: `${patientData.firstName} ${patientData.lastName}`
      });

      const patientRecord = {
        uid: user.uid,
        patientId: patientId,
        email: patientData.email,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        role: 'patient',
        hospitalId: targetHospitalId,        hospitalName: hospital.name,
        phoneNumber: patientData.phoneNumber,
        dateOfBirth: patientData.dateOfBirth,
        address: patientData.address,
        emergencyContact: patientData.emergencyContact,
        bloodGroup: patientData.bloodGroup,
        allergies: patientData.allergies,
        medicalHistory: patientData.medicalHistory,
        registrationDate: new Date().toISOString(),
        isActive: true,
        isAdmitted: false,
        medicineDeliveryType: 'pharmacy', // Default to pharmacy pickup
        tempPassword: tempPassword,
        needsPasswordUpdate: true
      };

      await setDoc(doc(db, 'users', user.uid), patientRecord);
      
      return patientRecord;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userData = await getUserData(user.uid);
        setUserRole(userData?.role || null);
        setUserDetails(userData || null);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserDetails(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  const value = {
    currentUser,    userRole,
    userDetails,
    login,
    registerStaff,
    registerStaffForHospital,
    registerPatient,
    registerPatientForHospital,
    registerHospital,
    logout,
    getUserData,
    getPatients,
    getPatientsForHospital,
    getStaffForHospital,
    getHospitals,
    getHospitalById,
    updateHospitalSettings,
    updatePatientPassword,
    createAppointment,
    createAppointmentWithBilling,
    createPrescription,
    createPrescriptionWithBilling,
    createPharmacyOrder,
    createMedicalRecord,
    createEmergencySlot,
    updateEmergencySlotStatus,
    createPharmacyNotification,
    updateMedicationStatus,
    createDeliveryTask,
    createBill,
    updateBillPayment,
    getBills,
    calculateServiceBill,
    getConsultationFee,
    getMedicationCost,
    getStaffPermissions,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};