import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientRegister from './PatientRegister';
import PatientDetails from './PatientDetails';
import AppointmentScheduler from './AppointmentScheduler';

const Dashboard = () => {
  const { currentUser, userRole, userDetails, logout, getPatients } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [patients, setPatients] = useState([]);  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 8,
    pendingOrders: 12,
    activeStaff: 11
  });  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  useEffect(() => {
    if (userRole === 'receptionist' || userRole === 'doctor') {
      loadPatients();
    }
    loadDashboardData();
  }, [userRole]);

  const loadPatients = async () => {
    try {
      const patientsData = await getPatients();
      setPatients(patientsData);
      setStats(prev => ({
        ...prev,
        totalPatients: patientsData.length
      }));
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const loadDashboardData = () => {
    if (userRole === 'patient') {
      setAppointments([
        {
          id: 'apt001',
          doctorName: 'Dr. Smith',
          department: 'Cardiology',
          date: new Date().toLocaleDateString(),
          time: '9:00 AM - 9:30 AM',
          type: 'Regular Checkup',
          status: 'Confirmed'
        },
        {
          id: 'apt002',
          doctorName: 'Dr. Johnson',
          department: 'Neurology',
          date: new Date(Date.now() + 86400000).toLocaleDateString(),
          time: '2:00 PM - 2:30 PM',
          type: 'Follow-up',
          status: 'Pending'
        }
      ]);
      
      setPrescriptions([
        {
          id: 'rx001',
          prescriptionNumber: 'RX001',
          doctorName: 'Dr. Smith',
          medications: ['Paracetamol 500mg - 3 times daily', 'Amoxicillin 250mg - 2 times daily'],
          date: new Date().toLocaleDateString(),
          status: 'Active'
        }
      ]);
        setOrders([
        {
          id: 'ord001',
          orderNumber: 'ORD001',
          medications: ['Paracetamol 500mg × 20 tablets', 'Amoxicillin 250mg × 14 capsules'],
          date: new Date().toLocaleDateString(),
          status: 'Processing'
        }
      ]);
    } else {
      setOrders([
        {
          id: 'ord001',
          orderNumber: 'ORD001',
          patientName: patients[0]?.firstName && patients[0]?.lastName ? 
            `${patients[0].firstName} ${patients[0].lastName}` : 'John Doe',
          patientId: patients[0]?.patientId || 'PAT123456',
          medications: ['Paracetamol 500mg × 20 tablets', 'Amoxicillin 250mg × 14 capsules'],
          date: new Date().toLocaleDateString(),
          status: 'Processing'
        },
        {
          id: 'ord002',
          orderNumber: 'ORD002',
          patientName: patients[1]?.firstName && patients[1]?.lastName ? 
            `${patients[1].firstName} ${patients[1].lastName}` : 'Jane Smith',
          patientId: patients[1]?.patientId || 'PAT123457',
          medications: ['Ibuprofen 400mg × 30 tablets'],
          date: new Date(Date.now() - 86400000).toLocaleDateString(),
          status: 'Ready'
        }
      ]);
      
      setPrescriptions([
        {
          id: 'rx001',
          prescriptionNumber: 'RX001',
          patientName: patients[0]?.firstName && patients[0]?.lastName ? 
            `${patients[0].firstName} ${patients[0].lastName}` : 'John Doe',
          patientId: patients[0]?.patientId || 'PAT123456',
          medications: ['Paracetamol 500mg - 3 times daily', 'Amoxicillin 250mg - 2 times daily'],
          date: new Date().toLocaleDateString(),
          status: 'Active'
        }
      ]);
      setAppointments([
        {
          id: 'apt001',
          patientName: patients[0]?.firstName && patients[0]?.lastName ? 
            `${patients[0].firstName} ${patients[0].lastName}` : 'John Doe',
          patientId: patients[0]?.patientId || 'PAT123456',
          date: new Date().toLocaleDateString(),
          time: '9:00 AM - 9:30 AM',
          type: 'Regular Checkup',
          status: 'Confirmed'
        },
        {
          id: 'apt002',
          patientName: patients[1]?.firstName && patients[1]?.lastName ? 
            `${patients[1].firstName} ${patients[1].lastName}` : 'Jane Smith',
          patientId: patients[1]?.patientId || 'PAT123457',
          date: new Date().toLocaleDateString(),
          time: '10:00 AM - 10:30 AM',
          type: 'Follow-up',
          status: 'Pending'
        }
      ]);
    }
  };
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
  };
  const renderCurrentView = () => {
    switch (currentView) {
      case 'register-patient':
        return <PatientRegister onBack={() => setCurrentView('dashboard')} />;
      case 'view-patients':
        return renderPatientsView();
      case 'appointments':
        return renderAppointmentsView();      case 'schedule-appointment':
        return <AppointmentScheduler 
          onBack={() => setCurrentView('appointments')} 
          selectedPatient={selectedPatient}
        />;
      case 'prescriptions':
        return renderPrescriptionsView();
      case 'orders':
        return renderOrdersView();
      case 'medical-records':
        return renderMedicalRecordsView();
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
  );

  const renderAppointmentsView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Appointments</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">            <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className={`border-l-4 ${
                  appointment.status === 'Confirmed' ? 'border-blue-500' : 
                  appointment.status === 'Pending' ? 'border-yellow-500' : 'border-gray-500'
                } pl-4 py-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {userRole === 'patient' ? appointment.doctorName : appointment.patientName}
                      </h4>
                      <p className="text-gray-600">
                        {userRole === 'patient' ? appointment.department : `${appointment.patientId} • ${appointment.type}`}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No appointments scheduled for today.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>            <div className="space-y-3">
              <button 
                onClick={() => setCurrentView('schedule-appointment')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Schedule New Appointment
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200">
                View All Appointments
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200">
                Emergency Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
                    <div className="mt-3 flex space-x-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition duration-200">
                        Mark Ready
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition duration-200">
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
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Records</h3>
                <p className="text-gray-600 mb-4">Access your medical history and test results</p>
                <button 
                  onClick={() => setCurrentView('medical-records')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                >
                  View Records
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Prescriptions</h3>
                <p className="text-gray-600 mb-4">View current and past prescriptions</p>
                <button 
                  onClick={() => setCurrentView('prescriptions')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  View Prescriptions
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medicine Orders</h3>
                <p className="text-gray-600 mb-4">Track your medicine delivery status</p>
                <button 
                  onClick={() => setCurrentView('orders')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
                >
                  Track Orders
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
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Prescriptions</h3>
                <p className="text-gray-600 mb-4">Create and manage prescriptions</p>
                <button 
                  onClick={() => setCurrentView('prescriptions')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Manage Prescriptions
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Records</h3>
                <p className="text-gray-600 mb-4">Update patient medical records</p>
                <button 
                  onClick={() => setCurrentView('medical-records')}
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
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                  <h4 className="text-lg font-semibold mb-2">Today's Appointments</h4>
                  <p className="text-3xl font-bold">{appointments.length}</p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
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
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Reports</h3>
                <p className="text-gray-600 mb-4">Generate daily and monthly reports</p>
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30">
                  View Reports
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
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Prescriptions</h3>
                <p className="text-gray-600 mb-4">Review and process prescriptions</p>
                <button 
                  onClick={() => setCurrentView('prescriptions')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
                >
                  View Prescriptions
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Inventory</h3>
                <p className="text-gray-600 mb-4">Manage medicine inventory</p>
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30">
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
    <div className="min-h-screen bg-gray-50">      {/* Patient Details Modal */}
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