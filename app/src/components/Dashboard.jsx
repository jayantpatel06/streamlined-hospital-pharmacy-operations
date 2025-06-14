import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import PatientRegister from './PatientRegister';
import PatientDetails from './PatientDetails';
import PatientAdmission from './PatientAdmission';
import AppointmentScheduler from './AppointmentScheduler';
import EmergencySlotManager from './EmergencySlotManager';
import PrescriptionManager from './PrescriptionManager';
import MedicalRecordsManager from './MedicalRecordsManager';
import PharmacyManager from './PharmacyManager';
import BillingManager from './BillingManager';

const Dashboard = () => {
  const { currentUser, userRole, userDetails, logout, getPatientsForHospital } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    pendingOrders: 0,
    activeStaff: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (userRole === 'receptionist' || userRole === 'doctor') {
      loadPatients();
    }
    loadDashboardData();
    
    const handleNavigateToPrescriptionManager = (event) => {
      setSelectedPatient(event.detail);
      setCurrentView('prescription-manager');
    };
      const handleNavigateToMedicalRecords = (event) => {
      setSelectedPatient(event.detail);
      setCurrentView('medical-records-manager');
    };
    
    const handleNavigateToBillingManager = (event) => {
      setSelectedPatient(event.detail);
      setCurrentView('billing-manager');
    };
    
    window.addEventListener('navigate-to-prescription-manager', handleNavigateToPrescriptionManager);
    window.addEventListener('navigate-to-medical-records', handleNavigateToMedicalRecords);
    window.addEventListener('navigate-to-billing-manager', handleNavigateToBillingManager);
    
    return () => {
      window.removeEventListener('navigate-to-prescription-manager', handleNavigateToPrescriptionManager);
      window.removeEventListener('navigate-to-medical-records', handleNavigateToMedicalRecords);
      window.removeEventListener('navigate-to-billing-manager', handleNavigateToBillingManager);
    };
  }, [userRole]);
  const loadPatients = async () => {
    try {
      const patientsData = await getPatientsForHospital();
      setPatients(patientsData);
      setStats(prev => ({
        ...prev,
        totalPatients: patientsData.length
      }));
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const appointmentsData = await loadAppointments();
      setAppointments(appointmentsData);
      
      const prescriptionsData = await loadPrescriptions();
      setPrescriptions(prescriptionsData);
      let ordersData = [];
      if (userRole === 'pharmacy') {
        ordersData = await loadOrders();
        setOrders(ordersData);
      }
      
      const allUsersData = await loadAllUsers();
      setStats(prev => ({
        ...prev,
        totalAppointments: appointmentsData.length,
        pendingOrders: userRole === 'pharmacy' ? ordersData.filter(order => order.status === 'pending').length : 0,
        activeStaff: allUsersData.filter(user => user.role !== 'patient' && user.isActive).length
      }));
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      let appointmentsQuery;
      
      if (userRole === 'patient') {
        appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', userDetails?.patientId || ''),
          orderBy('date', 'desc'),
          limit(10)
        );
      } else if (userRole === 'doctor') {
        appointmentsQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', userDetails?.staffId || ''),
          orderBy('date', 'desc'),
          limit(10)
        );
      } else {
        appointmentsQuery = query(
          collection(db, 'appointments'),
          orderBy('date', 'desc'),
          limit(10)
        );
      }
      
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      return appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading appointments:', error);
      return [];
    }
  };

  const loadPrescriptions = async () => {
    try {
      let prescriptionsQuery;
      
      if (userRole === 'patient') {
        prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', userDetails?.patientId || ''),
          orderBy('date', 'desc'),
          limit(10)
        );
      } else if (userRole === 'doctor') {
        prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('doctorId', '==', userDetails?.staffId || ''),
          orderBy('date', 'desc'),
          limit(10)
        );
      } else {
        prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          orderBy('date', 'desc'),
          limit(10)
        );
      }
      
      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      return prescriptionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      return [];
    }
  };

  const loadOrders = async () => {
    try {
      const ordersQuery = query(
        collection(db, 'pharmacy_orders'),
        orderBy('orderDate', 'desc'),
        limit(10)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  };

  const loadAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      return usersSnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleViewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleClosePatientDetails = () => {
    setSelectedPatient(null);
    setShowPatientDetails(false);
  };  const renderCurrentView = () => {
    switch (currentView) {
      case 'register-patient':
        return <PatientRegister onBack={() => setCurrentView('dashboard')} />;
      case 'admit-patient':
        return <PatientAdmission onBack={() => setCurrentView('dashboard')} selectedPatient={selectedPatient} />;
      case 'view-patients':
        return renderPatientsView();
      case 'appointments':
        return renderAppointmentsView();
      case 'schedule-appointment':
        return <AppointmentScheduler 
          onBack={() => setCurrentView('appointments')} 
          selectedPatient={selectedPatient}
        />;
      case 'emergency-slots':
        return <EmergencySlotManager 
          onBack={() => setCurrentView('appointments')} 
        />;
      case 'prescriptions':
        return <PrescriptionManager 
          onBack={() => setCurrentView('dashboard')} 
        />;
      case 'prescription-manager':
        return <PrescriptionManager 
          onBack={() => setCurrentView('dashboard')} 
          selectedPatient={selectedPatient}
        />;
      case 'pharmacy-manager':
        return <PharmacyManager 
          onBack={() => setCurrentView('dashboard')} 
        />;
      case 'orders':
        return renderOrdersView();
      case 'medical-records':
        return <MedicalRecordsManager 
          onBack={() => setCurrentView('dashboard')} 
        />;      case 'medical-records-manager':
        return <MedicalRecordsManager 
          onBack={() => setCurrentView('dashboard')} 
          selectedPatient={selectedPatient}
        />;
      case 'billing-manager':
        return <BillingManager 
          onBack={() => setCurrentView('dashboard')} 
          selectedPatient={selectedPatient}
        />;
      default:
        return getDashboardContent();
    }
  };

  const renderPatientsView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Patients Management</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Patient ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Phone</th>
                <th className="px-6 py-4 text-left">Blood Group</th>
                <th className="px-6 py-4 text-left">Registration Date</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient, index) => (
                <tr key={patient.uid} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 font-medium text-gray-900">{patient.patientId}</td>
                  <td className="px-6 py-4 text-gray-900">{patient.firstName} {patient.lastName}</td>
                  <td className="px-6 py-4 text-gray-600">{patient.email}</td>
                  <td className="px-6 py-4 text-gray-600">{patient.phoneNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{patient.bloodGroup}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(patient.registrationDate).toLocaleDateString()}
                  </td>                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleViewPatientDetails(patient)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {patients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No patients registered yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );  const renderAppointmentsView = () => {
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
                     String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(today.getDate()).padStart(2, '0');
    
    const todayAppointments = appointments.filter(apt => {
      console.log('Appointment date:', apt.date, 'Today string:', todayStr);
      return apt.date === todayStr;
    });
    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate > today;
    });
    const emergencySlots = appointments.filter(apt => apt.isEmergency);

    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {userRole === 'doctor' ? 'My Appointments & Schedule' : 'Appointments'}
            </h2>
            <p className="text-gray-600 mt-1">
              {userRole === 'doctor' 
                ? 'Manage your patient appointments and emergency slots' 
                : 'View and manage appointments'
              }
            </p>
          </div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>

        {userRole === 'doctor' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-800">Today's Appointments</h3>
              <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="font-semibold text-green-800">Confirmed</h3>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(apt => apt.status === 'Confirmed').length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <h3 className="font-semibold text-red-800">Emergency Slots</h3>
              <p className="text-2xl font-bold text-red-600">{emergencySlots.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-semibold text-yellow-800">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {appointments.filter(apt => apt.status === 'Pending').length}
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Today's Schedule</h3>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className={`border-l-4 ${
                    appointment.isEmergency ? 'border-red-500 bg-red-50' :
                    appointment.status === 'Confirmed' ? 'border-blue-500' : 
                    appointment.status === 'Pending' ? 'border-yellow-500' : 
                    appointment.status === 'In Progress' ? 'border-green-500' : 'border-gray-500'
                  } pl-4 py-3 rounded-r-lg`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">
                            {userRole === 'patient' ? appointment.doctorName : appointment.patientName}
                          </h4>
                          {appointment.isEmergency && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              🚨 EMERGENCY
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {userRole === 'patient' ? appointment.department : 
                           `${appointment.patientId} • ${appointment.type}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.time} {appointment.duration && `(${appointment.duration})`}
                        </p>
                        {appointment.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>                        {userRole === 'doctor' && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => alert(`Viewing appointment details for ${appointment.patientName}\nTime: ${appointment.time}\nType: ${appointment.type}\nNotes: ${appointment.notes}`)}
                              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-50 rounded"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => {
                                const updated = appointments.map(apt => 
                                  apt.id === appointment.id ? {...apt, status: 'In Progress'} : apt
                                );
                                setAppointments(updated);
                                alert(`Started appointment with ${appointment.patientName}`);
                              }}
                              className="text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-50 rounded"
                            >
                              Start
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {todayAppointments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No appointments scheduled for today.
                  </div>
                )}
              </div>
            </div>

            {upcomingAppointments.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className={`border-l-4 ${
                      appointment.status === 'Confirmed' ? 'border-blue-500' : 
                      appointment.status === 'Pending' ? 'border-yellow-500' : 'border-gray-500'
                    } pl-4 py-2`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {userRole === 'patient' ? appointment.doctorName : appointment.patientName}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {userRole === 'patient' ? appointment.department : 
                             `${appointment.patientId} • ${appointment.type}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {(userRole === 'receptionist' || userRole === 'doctor') && (
                  <button 
                    onClick={() => setCurrentView('schedule-appointment')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    📅 Schedule New Appointment
                  </button>
                )}                {userRole === 'doctor' && (
                  <>
                    <button 
                      onClick={() => setCurrentView('emergency-slots')}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      🚨 Manage Emergency Slots
                    </button>
                    <button 
                      onClick={() => setCurrentView('prescription-manager')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
                    >
                      📝 Manage Prescriptions
                    </button>
                    <button 
                      onClick={() => setCurrentView('medical-records-manager')}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
                    >
                      📋 Medical Records
                    </button>
                  </>
                )}
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200">
                  📊 View All Appointments
                </button>
              </div>
            </div>

            {userRole === 'doctor' && emergencySlots.length > 0 && (
              <div className="bg-red-50 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h3 className="text-xl font-semibold text-red-800 mb-4">🚨 Emergency Slots</h3>
                <div className="space-y-3">
                  {emergencySlots.map((appointment) => (
                    <div key={appointment.id} className="bg-white p-3 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{appointment.patientName}</h4>
                          <p className="text-sm text-gray-600">{appointment.patientId}</p>
                          <p className="text-sm text-red-600 font-medium">{appointment.notes}</p>
                        </div>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userRole === 'doctor' && (
              <div className="bg-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">📊 Schedule Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Working Hours:</span>
                    <span className="font-semibold">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break Time:</span>
                    <span className="font-semibold">12:00 PM - 1:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Patients Today:</span>
                    <span className="font-semibold">{todayAppointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Slots:</span>
                    <span className="font-semibold text-green-600">3 remaining</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPrescriptionsView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Prescriptions</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Prescriptions</h3>
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">Prescription #{prescription.prescriptionNumber}</h4>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    prescription.status === 'Active' ? 'bg-green-100 text-green-800' :
                    prescription.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {prescription.status}
                  </span>
                </div>
                {userRole === 'patient' ? (
                  <p className="text-gray-600 mb-1">Prescribed by: {prescription.doctorName}</p>
                ) : (
                  <p className="text-gray-600 mb-1">Patient: {prescription.patientName || 'John Doe'} ({prescription.patientId || 'PAT123456'})</p>
                )}
                <p className="text-gray-600 mb-2">Prescribed: {prescription.date}</p>
                <div className="text-sm text-gray-500">
                  {prescription.medications.map((medication, index) => (
                    <p key={index}>• {medication}</p>
                  ))}
                </div>
              </div>
            ))}
            {prescriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No prescriptions found.
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Prescription</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter medication details..."
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200">
              Create Prescription
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderOrdersView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Medicine Orders</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">            <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Orders</h3>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">Order #{order.orderNumber}</h4>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Ready' ? 'bg-green-100 text-green-800' :
                      order.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  {userRole !== 'patient' && (
                    <p className="text-gray-600 mb-1">Patient: {order.patientName || 'John Doe'} ({order.patientId || 'PAT123456'})</p>
                  )}
                  <p className="text-gray-600 mb-2">Order Date: {order.date}</p>
                  <div className="text-sm text-gray-500">
                    {order.medications.map((medication, index) => (
                      <p key={index}>• {medication}</p>
                    ))}
                  </div>
                  {userRole === 'pharmacy' && (
                    <div className="mt-3 flex space-x-2">                      <button 
                        onClick={() => {
                          const updated = orders.map(ord => 
                            ord.id === order.id ? {...ord, status: 'Ready'} : ord
                          );
                          setOrders(updated);
                          alert('Order marked as ready for pickup!');
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition duration-200"
                      >
                        Mark Ready
                      </button>
                      <button 
                        onClick={() => alert(`Order Details:\n${order.medications.join('\n')}\nPatient: ${order.patientName}\nDate: ${order.date}`)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition duration-200"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No current orders.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Statistics</h3>            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-semibold text-2xl">{orders.filter(order => order.status === 'Processing').length}</p>
                <p className="text-blue-600">Pending Orders</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-semibold text-2xl">{orders.filter(order => order.status === 'Completed').length + 34}</p>
                <p className="text-green-600">Completed Today</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-800 font-semibold text-2xl">{orders.filter(order => order.status === 'Ready').length + 5}</p>
                <p className="text-orange-600">Ready for Pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalRecordsView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Medical Records</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Records</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">General Checkup</h4>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600 mb-1">
                {userRole === 'patient' ? 'Dr. Smith - Cardiology' : `Patient: ${userDetails?.firstName} ${userDetails?.lastName}`}
              </p>
              <p className="text-sm text-gray-500">Blood pressure: 120/80, Heart rate: 72 bpm</p>
            </div>
            {userRole !== 'patient' && (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">Lab Results</h4>
                  <span className="text-sm text-gray-500">{new Date(Date.now() - 86400000).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 mb-1">Dr. Johnson - Pathology</p>
                <p className="text-sm text-gray-500">Complete Blood Count - All values within normal range</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Health Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Blood Group:</span>
              <span className="font-medium">{userDetails?.bloodGroup}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Allergies:</span>
              <span className="font-medium">{userDetails?.allergies || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency Contact:</span>
              <span className="font-medium">{userDetails?.emergencyContact}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const getDashboardContent = () => {
    const getTodaysAppointments = () => {
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
      console.log('Today string for dashboard:', todayStr);
      const todaysApts = appointments.filter(apt => {
        console.log('Dashboard appointment date:', apt.date, 'matches today:', apt.date === todayStr);
        return apt.date === todayStr;
      });
      return todaysApts;
    };

    switch (userRole) {
      case 'patient':
        return (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Patient Portal</h2>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <p><strong className="text-gray-800">Patient ID:</strong> {userDetails?.patientId}</p>
                  <p><strong className="text-gray-800">Name:</strong> {userDetails?.firstName} {userDetails?.lastName}</p>
                  <p><strong className="text-gray-800">Email:</strong> {userDetails?.email}</p>
                  <p><strong className="text-gray-800">Phone:</strong> {userDetails?.phoneNumber}</p>
                  <p><strong className="text-gray-800">Blood Group:</strong> {userDetails?.bloodGroup}</p>
                  <p><strong className="text-gray-800">Date of Birth:</strong> {userDetails?.dateOfBirth}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">My Appointments</h3>
                <p className="text-gray-600 mb-4">View and manage your upcoming appointments</p>
                <button 
                  onClick={() => setCurrentView('appointments')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  View Appointments
                </button>
              </div>              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Records</h3>
                <p className="text-gray-600 mb-4">Access your medical history and test results</p>
                <button 
                  onClick={() => setCurrentView('medical-records-manager')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                >
                  View Records
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Prescriptions</h3>
                <p className="text-gray-600 mb-4">View current and past prescriptions</p>
                <button 
                  onClick={() => setCurrentView('prescription-manager')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  View Prescriptions
                </button>
              </div>              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">💰 My Bills</h3>
                <p className="text-gray-600 mb-4">View your bills and payment history</p>
                <button 
                  onClick={() => setCurrentView('billing-manager')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
                >
                  View Bills
                </button>
              </div>
            </div>
          </div>
        );

      case 'doctor':
        return (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Doctor Dashboard</h2>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Dr. {userDetails?.firstName} {userDetails?.lastName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-600">
                  <p><strong className="text-gray-800">Staff ID:</strong> {userDetails?.staffId}</p>
                  <p><strong className="text-gray-800">Specialization:</strong> {userDetails?.specialization}</p>
                  <p><strong className="text-gray-800">Department:</strong> {userDetails?.department}</p>
                  <p><strong className="text-gray-800">License No:</strong> {userDetails?.licenseNumber}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Appointments</h3>
                <p className="text-gray-600 mb-4">View your schedule for today</p>
                <button 
                  onClick={() => setCurrentView('appointments')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  View Schedule
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Records</h3>
                <p className="text-gray-600 mb-4">Access patient medical histories</p>
                <button 
                  onClick={() => setCurrentView('view-patients')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                >
                  View Patients
                </button>
              </div>              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Prescriptions</h3>
                <p className="text-gray-600 mb-4">Create and manage prescriptions</p>
                <button 
                  onClick={() => setCurrentView('prescription-manager')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Manage Prescriptions
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Records</h3>
                <p className="text-gray-600 mb-4">Update patient medical records</p>
                <button 
                  onClick={() => setCurrentView('medical-records-manager')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
                >
                  Medical Records
                </button>
              </div>
            </div>
          </div>
        );

      case 'receptionist':
        return (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Receptionist Dashboard</h2>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{userDetails?.firstName} {userDetails?.lastName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
                  <p><strong className="text-gray-800">Staff ID:</strong> {userDetails?.staffId}</p>
                  <p><strong className="text-gray-800">Department:</strong> {userDetails?.department}</p>
                  <p><strong className="text-gray-800">Phone:</strong> {userDetails?.phoneNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                  <h4 className="text-lg font-semibold mb-2">Total Patients</h4>
                  <p className="text-3xl font-bold">{stats.totalPatients}</p>
                </div>                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                  <h4 className="text-lg font-semibold mb-2">Today's Appointments</h4>
                  <p className="text-3xl font-bold">{getTodaysAppointments().length}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                  <h4 className="text-lg font-semibold mb-2">Pending Orders</h4>
                  <p className="text-3xl font-bold">{orders.filter(order => order.status === 'Processing').length}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                  <h4 className="text-lg font-semibold mb-2">Active Staff</h4>
                  <p className="text-3xl font-bold">{stats.activeStaff}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Register Patient</h3>
                <p className="text-gray-600 mb-4">Add new patients to the system</p>
                <button 
                  onClick={() => setCurrentView('register-patient')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Register Patient
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Admission</h3>
                <p className="text-gray-600 mb-4">Admit patients and allocate beds</p>
                <button 
                  onClick={() => setCurrentView('admit-patient')}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                >
                  🏥 Admit Patient
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Management</h3>
                <p className="text-gray-600 mb-4">View and manage all patients</p>
                <button 
                  onClick={() => setCurrentView('view-patients')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                >
                  View Patients
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Appointments</h3>
                <p className="text-gray-600 mb-4">Schedule and manage appointments</p>
                <button 
                  onClick={() => setCurrentView('appointments')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Manage Appointments
                </button>
              </div>              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">💰 Billing Manager</h3>
                <p className="text-gray-600 mb-4">Manage bills, payments, and financial records</p>
                <button 
                  onClick={() => setCurrentView('billing-manager')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
                >
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        );

      case 'pharmacy':
        return (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Pharmacy Dashboard</h2>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{userDetails?.firstName} {userDetails?.lastName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
                  <p><strong className="text-gray-800">Staff ID:</strong> {userDetails?.staffId}</p>
                  <p><strong className="text-gray-800">Department:</strong> {userDetails?.department}</p>
                  <p><strong className="text-gray-800">Phone:</strong> {userDetails?.phoneNumber}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medicine Orders</h3>
                <p className="text-gray-600 mb-4">Process and fulfill medicine orders</p>
                <button 
                  onClick={() => setCurrentView('orders')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                >
                  View Orders
                </button>
              </div>              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🏥 Pharmacy Manager</h3>
                <p className="text-gray-600 mb-4">Manage prescriptions, notifications & deliveries</p>
                <button 
                  onClick={() => setCurrentView('pharmacy-manager')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                >
                  Open Pharmacy Manager
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Inventory</h3>
                <p className="text-gray-600 mb-4">Manage medicine inventory</p>                <button 
                  onClick={() => alert('Inventory management feature coming soon!\nCurrent stock levels will be displayed here.')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Manage Inventory
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Reports</h3>
                <p className="text-gray-600 mb-4">Generate pharmacy reports</p>
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Hospital Management System</h2>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {showPatientDetails && selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          onClose={handleClosePatientDetails}
          onEdit={() => {
            console.log('Edit patient:', selectedPatient);
          }}
          onScheduleAppointment={(patient) => {
            setCurrentView('schedule-appointment');
          }}
        />
      )}
      
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hospital Management System</h1>
              <p className="text-blue-100 mt-1 opacity-90">Welcome, {currentUser?.displayName || currentUser?.email}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="bg-white/20 px-3 py-2 rounded-full text-sm font-semibold uppercase tracking-wider backdrop-blur-sm">
                {userRole?.replace('_', ' ')}
              </span>
              {userDetails?.staffId && (
                <span className="bg-white/15 px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ID: {userDetails.staffId}
                </span>
              )}
              {userDetails?.patientId && (
                <span className="bg-white/15 px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ID: {userDetails.patientId}
                </span>
              )}
              <button 
                onClick={handleLogout} 
                className="bg-white/20 border-2 border-white/30 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {renderCurrentView()}
    </div>
  );
};

export default Dashboard;