import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';

const PatientPortal = ({ onBack }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [availableHospitals, setAvailableHospitals] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingBills: 0,
    activePrescriptions: 0
  });

  const { userDetails, currentUser, getHospitals, createAppointmentWithBilling, createPharmacyOrder } = useAuth();

  useEffect(() => {
    if (userDetails?.role === 'patient') {
      loadPatientData();
      loadAvailableHospitals();
    }
  }, [userDetails]);

  const loadPatientData = async () => {
    try {
      setPatientData(userDetails);
      await Promise.all([
        loadAppointments(),
        loadPrescriptions(),
        loadBills()
      ]);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableHospitals = async () => {
    try {
      const hospitals = await getHospitals();
      setAvailableHospitals(hospitals);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', userDetails?.patientId),
        orderBy('date', 'desc')
      );
      
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(appointmentsData);
      
      setStats(prev => ({
        ...prev,
        totalAppointments: appointmentsData.length
      }));
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', userDetails?.patientId),
        orderBy('createdAt', 'desc')
      );
      
      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      const prescriptionsData = prescriptionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(prescriptionsData);
      
      setStats(prev => ({
        ...prev,
        activePrescriptions: prescriptionsData.filter(p => p.status === 'active').length
      }));
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const loadBills = async () => {
    try {
      const billsQuery = query(
        collection(db, 'bills'),
        where('patientId', '==', userDetails?.patientId),
        orderBy('createdAt', 'desc')
      );
      
      const billsSnapshot = await getDocs(billsQuery);
      const billsData = billsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBills(billsData);
      
      setStats(prev => ({
        ...prev,
        pendingBills: billsData.filter(b => b.status === 'pending').length
      }));
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {patientData?.firstName}!</h2>
        <p className="text-blue-100">Patient ID: {patientData?.patientId}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-blue-600 text-xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Bills</p>
              <p className="text-2xl font-bold text-red-600">{stats.pendingBills}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-red-600 text-xl">💳</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Prescriptions</p>
              <p className="text-2xl font-bold text-green-600">{stats.activePrescriptions}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-green-600 text-xl">💊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setCurrentView('book-appointment')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <h4 className="font-semibold">Book Appointment</h4>
                <p className="text-blue-100 text-sm">Schedule a consultation</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('order-medicine')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💊</span>
              <div>
                <h4 className="font-semibold">Order Medicine</h4>
                <p className="text-green-100 text-sm">Reorder prescriptions</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Recent Appointments</h3>
          {appointments.slice(0, 3).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No appointments yet</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map(appointment => (
                <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-medium">{appointment.doctorName}</p>
                  <p className="text-sm text-gray-600">{appointment.department}</p>
                  <p className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Bills */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Pending Bills</h3>
          {bills.filter(b => b.status === 'pending').slice(0, 3).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending bills</p>
          ) : (
            <div className="space-y-3">
              {bills.filter(b => b.status === 'pending').slice(0, 3).map(bill => (
                <div key={bill.id} className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-medium">{bill.description}</p>
                  <p className="text-sm text-red-600 font-semibold">₹{bill.amount}</p>
                  <p className="text-sm text-gray-500">{new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'book-appointment':
        return <AppointmentBooking onBack={() => setCurrentView('dashboard')} />;
      case 'order-medicine':
        return <MedicineOrdering onBack={() => setCurrentView('dashboard')} />;
      case 'my-appointments':
        return <AppointmentHistory appointments={appointments} onBack={() => setCurrentView('dashboard')} />;
      case 'my-prescriptions':
        return <PrescriptionHistory prescriptions={prescriptions} onBack={() => setCurrentView('dashboard')} />;
      case 'billing':
        return <BillingHistory bills={bills} onBack={() => setCurrentView('dashboard')} />;
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">🏥 Patient Portal</h1>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('my-appointments')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'my-appointments' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Appointments
                </button>
                <button
                  onClick={() => setCurrentView('my-prescriptions')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'my-prescriptions' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Prescriptions
                </button>
                <button
                  onClick={() => setCurrentView('billing')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'billing' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Billing
                </button>
              </nav>
            </div>
            
            <button
              onClick={onBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

// Appointment Booking Component
const AppointmentBooking = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [availableHospitals, setAvailableHospitals] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    doctorId: '',
    doctorName: '',
    department: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  });
  const [consultationFee, setConsultationFee] = useState(500);
  const [paymentData, setPaymentData] = useState({
    method: 'online',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: ''
  });
  const [loading, setLoading] = useState(false);

  const { userDetails, getHospitals, createAppointmentWithBilling, getConsultationFee, getStaffForHospital } = useAuth();

  useEffect(() => {
    loadHospitals();
  }, []);
  const loadHospitals = async () => {
    try {
      const hospitals = await getHospitals();
      setAvailableHospitals(hospitals);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const loadDoctors = async (hospitalId) => {
    try {
      const staff = await getStaffForHospital(hospitalId);
      const doctors = staff.filter(member => member.role === 'doctor');
      setAvailableDoctors(doctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setAvailableDoctors([]);
    }
  };

  const handleHospitalSelect = async (hospital) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    setAppointmentData(prev => ({ ...prev, doctorId: '', doctorName: '', department: '' }));
    await loadDoctors(hospital.hospitalId);
    setStep(2);
  };
  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentData(prev => ({
      ...prev,
      doctorId: doctor.staffId,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      department: doctor.department || doctor.specialization
    }));
    
    try {
      const fee = getConsultationFee('Consultation', doctor.department || doctor.specialization);
      setConsultationFee(fee);
    } catch (error) {
      console.error('Error getting consultation fee:', error);
      setConsultationFee(500); // Default fee
    }
    setStep(3);
  };
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHospital || !selectedDoctor) return;

    try {
      setLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const appointmentPayload = {
        ...appointmentData,
        patientId: userDetails.patientId,
        patientName: `${userDetails.firstName} ${userDetails.lastName}`,
        hospitalId: selectedHospital.hospitalId,
        hospitalName: selectedHospital.name,
        doctorId: selectedDoctor.staffId,
        doctorName: appointmentData.doctorName,
        department: appointmentData.department,
        status: 'confirmed',
        paymentStatus: 'paid',
        amount: consultationFee,
        paymentMethod: paymentData.method
      };

      await createAppointmentWithBilling(appointmentPayload);
        alert('🎉 Appointment booked successfully! Payment confirmed.');
      onBack();
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 
    'Dermatology', 'Pediatrics', 'Gynecology', 'ENT', 'Ophthalmology'
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700 mr-4">
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Select Hospital</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableHospitals.map(hospital => (
            <div key={hospital.hospitalId} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow cursor-pointer"
                 onClick={() => handleHospitalSelect(hospital)}>
              <h3 className="font-semibold text-lg mb-2">{hospital.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{hospital.address}</p>
              <p className="text-gray-600 text-sm mb-4">{hospital.city}, {hospital.state}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">
                  {hospital.bedCapacity} beds
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-700 mr-4">
            ← Back to Hospitals
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Select Doctor at {selectedHospital?.name}</h2>
        </div>

        {availableDoctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
            <p className="text-gray-600 text-lg mb-4">Loading doctors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableDoctors.map(doctor => (
              <div key={doctor.staffId} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow cursor-pointer"
                   onClick={() => handleDoctorSelect(doctor)}>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-2xl">👨‍⚕️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Dr. {doctor.firstName} {doctor.lastName}</h3>
                    <p className="text-blue-600 text-sm font-medium mb-2">{doctor.department || doctor.specialization}</p>
                    {doctor.specialization && doctor.department !== doctor.specialization && (
                      <p className="text-gray-600 text-sm mb-2">Specialization: {doctor.specialization}</p>
                    )}
                    <p className="text-gray-500 text-sm">Staff ID: {doctor.staffId}</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          Available
                        </span>
                        {doctor.licenseNumber && (
                          <span className="text-xs text-gray-500">
                            License: {doctor.licenseNumber}
                          </span>
                        )}
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Select Doctor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => setStep(2)} className="text-blue-600 hover:text-blue-700 mr-4">
          ← Back to Doctors
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Book Appointment with {selectedDoctor?.firstName} {selectedDoctor?.lastName}</h2>
      </div>

      <form onSubmit={step === 3 ? handleAppointmentSubmit : (e) => { e.preventDefault(); }} className="space-y-8">
        {/* Selected Doctor Info */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Selected Doctor</h3>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl">👨‍⚕️</span>
            </div>
            <div>
              <h4 className="font-semibold text-lg">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</h4>
              <p className="text-blue-600 font-medium">{selectedDoctor?.department || selectedDoctor?.specialization}</p>
              <p className="text-gray-600">at {selectedHospital?.name}</p>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Appointment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
              <input
                type="text"
                value={appointmentData.doctorName}
                disabled
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input
                type="text"
                value={appointmentData.department}
                disabled
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
              />            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={appointmentData.date}
                onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                min={tomorrow.toISOString().split('T')[0]}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <select
                value={appointmentData.time}
                onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={appointmentData.notes}
              onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific concerns or symptoms"
            />
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">Consultation Fee:</span>
              <span className="text-xl font-bold text-blue-600">₹{consultationFee}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentData.method === 'online'}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="mr-3"
                />
                <span>💳 Credit/Debit Card</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentData.method === 'upi'}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="mr-3"
                />
                <span>📱 UPI</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={paymentData.method === 'wallet'}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="mr-3"
                />
                <span>💰 Digital Wallet</span>
              </label>
            </div>
          </div>

          {paymentData.method === 'online' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                <input
                  type="text"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                  placeholder="123"
                  maxLength="3"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {paymentData.method === 'upi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID *</label>
              <input
                type="text"
                value={paymentData.upiId}
                onChange={(e) => setPaymentData({...paymentData, upiId: e.target.value})}
                placeholder="yourname@upi"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Doctors
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              `Pay ₹${consultationFee} & Book Appointment`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Medicine Ordering Component  
const MedicineOrdering = ({ onBack }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentData, setPaymentData] = useState({
    method: 'online',
    cardNumber: '',
    cvv: '',
    upiId: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { userDetails, createPharmacyOrder } = useAuth();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', userDetails?.patientId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      const prescriptionsData = prescriptionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const handlePrescriptionSelect = (prescription) => {
    setSelectedPrescription(prescription);
    setOrderItems(prescription.medications.map(med => ({
      ...med,
      selected: true,
      price: Math.floor(Math.random() * 500) + 50 // Random price for demo
    })));
    setStep(2);
  };

  const calculateTotal = () => {
    return orderItems.filter(item => item.selected).reduce((total, item) => total + item.price, 0);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderPayload = {
        patientId: userDetails.patientId,
        patientName: `${userDetails.firstName} ${userDetails.lastName}`,
        prescriptionId: selectedPrescription.id,
        medications: orderItems.filter(item => item.selected),
        totalAmount: calculateTotal(),
        paymentMethod: paymentData.method,
        paymentStatus: 'paid',
        status: 'confirmed',
        deliveryAddress: userDetails.address
      };

      await createPharmacyOrder(orderPayload);
      
      alert('🎉 Medicine order placed successfully! Payment confirmed.');
      onBack();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700 mr-4">
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Select Prescription</h2>
        </div>

        {prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💊</div>
            <p className="text-gray-600 text-lg mb-4">No active prescriptions found</p>
            <p className="text-gray-500">Visit a doctor to get prescriptions that you can order online</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map(prescription => (
              <div key={prescription.id} className="bg-white p-6 rounded-xl shadow-lg border hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Prescription #{prescription.id.slice(-6)}</h3>
                    <p className="text-gray-600">By: Dr. {prescription.doctorName}</p>
                    <p className="text-sm text-gray-500">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <button
                    onClick={() => handlePrescriptionSelect(prescription)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Order Medicines
                  </button>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Medications:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {prescription.medications.map((med, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {med.name} - {med.dosage} ({med.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-700 mr-4">
          ← Back to Prescriptions
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Order Medicines</h2>
      </div>

      <form onSubmit={handleOrderSubmit} className="space-y-8">
        {/* Order Items */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Select Medicines</h3>
          
          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <label className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => {
                      const newItems = [...orderItems];
                      newItems[index].selected = e.target.checked;
                      setOrderItems(newItems);
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.dosage} - {item.quantity}</p>
                  </div>
                </label>
                <span className="font-semibold text-green-600">₹{item.price}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-xl font-bold text-green-600">₹{calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentData.method === 'online'}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="mr-3"
                />
                <span>💳 Credit/Debit Card</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentData.method === 'upi'}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="mr-3"
                />
                <span>📱 UPI</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentData.method === 'cod'}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className="mr-3"
                />
                <span>💰 Cash on Delivery</span>
              </label>
            </div>
          </div>

          {paymentData.method === 'online' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                <input
                  type="text"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                  placeholder="123"
                  maxLength="3"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {paymentData.method === 'upi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID *</label>
              <input
                type="text"
                value={paymentData.upiId}
                onChange={(e) => setPaymentData({...paymentData, upiId: e.target.value})}
                placeholder="yourname@upi"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Prescriptions
          </button>
          
          <button
            type="submit"
            disabled={loading || calculateTotal() === 0}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              paymentData.method === 'cod' ? `Place Order (₹${calculateTotal()})` : `Pay ₹${calculateTotal()} & Order`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Additional helper components for appointment history, prescription history, and billing history would go here...

const AppointmentHistory = ({ appointments, onBack }) => (
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center mb-6">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-700 mr-4">
        ← Back
      </button>
      <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
    </div>
    
    {appointments.length === 0 ? (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <p className="text-gray-600">No appointments found</p>
      </div>
    ) : (
      <div className="space-y-4">
        {appointments.map(appointment => (
          <div key={appointment.id} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
                <p className="text-gray-600">{appointment.department}</p>
                <p className="text-sm text-gray-500">
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const PrescriptionHistory = ({ prescriptions, onBack }) => (
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center mb-6">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-700 mr-4">
        ← Back
      </button>
      <h2 className="text-2xl font-bold text-gray-800">My Prescriptions</h2>
    </div>
    
    {prescriptions.length === 0 ? (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">💊</div>
        <p className="text-gray-600">No prescriptions found</p>
      </div>
    ) : (
      <div className="space-y-4">
        {prescriptions.map(prescription => (
          <div key={prescription.id} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">Prescription #{prescription.id.slice(-6)}</h3>
                <p className="text-gray-600">By: Dr. {prescription.doctorName}</p>
                <p className="text-sm text-gray-500">{new Date(prescription.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                prescription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {prescription.status}
              </span>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Medications:</h4>
              <ul className="list-disc list-inside space-y-1">
                {prescription.medications.map((med, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {med.name} - {med.dosage} ({med.quantity})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const BillingHistory = ({ bills, onBack }) => (
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center mb-6">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-700 mr-4">
        ← Back
      </button>
      <h2 className="text-2xl font-bold text-gray-800">Billing History</h2>
    </div>
    
    {bills.length === 0 ? (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">💳</div>
        <p className="text-gray-600">No bills found</p>
      </div>
    ) : (
      <div className="space-y-4">
        {bills.map(bill => (
          <div key={bill.id} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{bill.description}</h3>
                <p className="text-sm text-gray-500">{new Date(bill.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">₹{bill.amount}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  bill.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {bill.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default PatientPortal;
