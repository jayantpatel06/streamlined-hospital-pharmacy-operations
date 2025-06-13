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
      const patientsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'patient'))
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
    currentUser,
    userRole,
    userDetails,
    login,
    registerStaff,
    registerPatient,
    logout,
    getUserData,
    getPatients,
    updatePatientPassword,
    createAppointment,
    createPrescription,
    createPharmacyOrder,
    createMedicalRecord,
    createEmergencySlot,
    updateEmergencySlotStatus,
    createPharmacyNotification,
    updateMedicationStatus,
    createDeliveryTask,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};