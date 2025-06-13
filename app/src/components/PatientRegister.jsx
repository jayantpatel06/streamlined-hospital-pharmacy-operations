import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientCredentials from './PatientCredentials';
import AppointmentScheduler from './AppointmentScheduler';

const PatientRegister = ({ onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: ''
  });  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);

  const { registerPatient, userRole } = useAuth();  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userRole !== 'receptionist') {
      setError('Only receptionist staff can register patients');
      return;
    }

    try {
      setError('');
      setSuccess(null);
      setLoading(true);
      
      const result = await registerPatient(formData);
      setSuccess({
        patientId: result.patientId,
        tempPassword: result.tempPassword,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      setShowCredentials(true);
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
        bloodGroup: '',
        allergies: '',
        medicalHistory: ''
      });
      
    } catch (error) {
      setError('Failed to register patient: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleScheduleAppointment = () => {
    setShowCredentials(false);
    setShowAppointmentScheduler(true);
  };

  const handleBackFromScheduler = () => {
    setShowAppointmentScheduler(false);
    setSuccess(null);
  };
  if (userRole !== 'receptionist') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-2xl text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Only receptionist staff can register patients.</p>
          <button onClick={onBack} className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">Go Back</button>
        </div>
      </div>
    );  }
  
  return (
    <>      {showCredentials && success && (
        <PatientCredentials
          patientData={success}
          onClose={() => setShowCredentials(false)}
          onScheduleAppointment={handleScheduleAppointment}
          onPrint={() => {
          }}
        />
      )}

      {showAppointmentScheduler && success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <AppointmentScheduler
              onBack={handleBackFromScheduler}
              selectedPatient={success}
            />
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl backdrop-blur-sm">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">Patient Registration</h2>
          <p className="text-center text-gray-600 italic mb-6">Register a new patient in the hospital system</p>
          
          {error && <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg mb-4 text-center font-medium">{error}</div>}
            {success && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-3">Patient Registered Successfully!</h3>
              <div className="bg-white/20 p-4 rounded-lg">
                <p className="mb-2"><strong>Patient ID:</strong> {success.patientId}</p>
                <p className="mb-2"><strong>Email:</strong> {success.email}</p>
                <p className="mb-2"><strong>Temporary Password:</strong> {success.tempPassword}</p>
                <p className="text-sm italic mt-3">Please provide these credentials to the patient. They will be required to change their password on first login.</p>
                <p className="text-sm italic mt-2">💡 You can also schedule an appointment for this patient immediately using the credentials modal.</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block mb-2 text-gray-700 font-medium">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block mb-2 text-gray-700 font-medium">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="phoneNumber" className="block mb-2 text-gray-700 font-medium">Phone Number:</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block mb-2 text-gray-700 font-medium">Date of Birth:</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block mb-2 text-gray-700 font-medium">Address:</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              required
              className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="emergencyContact" className="block mb-2 text-gray-700 font-medium">Emergency Contact:</label>
              <input
                type="tel"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Emergency contact number"
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
              />
            </div>

            <div>
              <label htmlFor="bloodGroup" className="block mb-2 text-gray-700 font-medium">Blood Group:</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="allergies" className="block mb-2 text-gray-700 font-medium">Known Allergies:</label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows="2"
              placeholder="List any known allergies (medications, food, etc.)"
              className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="medicalHistory" className="block mb-2 text-gray-700 font-medium">Medical History:</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows="3"
              placeholder="Brief medical history, previous surgeries, chronic conditions, etc."
              className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button type="button" onClick={onBack} className="flex-1 p-3 bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-gray-700 hover:shadow-lg">
              Back to Dashboard
            </button>
            <button type="submit" disabled={loading} className="flex-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
              {loading ? 'Registering Patient...' : 'Register Patient'}
            </button>
          </div>        </form>
      </div>
    </div>
    </>
  );
};

export default PatientRegister;