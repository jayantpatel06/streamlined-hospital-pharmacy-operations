import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const HospitalRegister = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [hospitalData, setHospitalData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    email: '',
    website: '',
    type: 'General Hospital',
    bedCapacity: '',
    licenseNumber: '',
    departments: ['General Medicine', 'Emergency', 'Surgery'],
    services: []
  });

  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const { registerHospital } = useAuth();

  const hospitalTypes = [
    'General Hospital',
    'Specialty Hospital',
    'Teaching Hospital',
    'Research Hospital',
    'Children\'s Hospital',
    'Rehabilitation Center',
    'Emergency Care Center',
    'Outpatient Clinic'
  ];

  const commonDepartments = [
    'General Medicine',
    'Emergency',
    'Surgery',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Radiology',
    'Laboratory',
    'Pharmacy',
    'ICU',
    'Oncology',
    'Psychiatry',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Anesthesiology'
  ];

  const commonServices = [
    '24/7 Emergency Care',
    'Ambulance Service',
    'Diagnostic Imaging',
    'Laboratory Services',
    'Surgical Services',
    'ICU Care',
    'Maternity Services',
    'Blood Bank',
    'Pharmacy',
    'Rehabilitation Services',
    'Home Healthcare',
    'Telemedicine',
    'Health Checkups',
    'Vaccination Services'
  ];

  const handleHospitalChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'departments' || name === 'services') {
      if (checked) {
        setHospitalData(prev => ({
          ...prev,
          [name]: [...prev[name], value]
        }));
      } else {
        setHospitalData(prev => ({
          ...prev,
          [name]: prev[name].filter(item => item !== value)
        }));
      }
    } else {
      setHospitalData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || '' : value
      }));
    }
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (adminData.password !== adminData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (adminData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await registerHospital(hospitalData, adminData);
      
      setSuccess(result);
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error registering hospital:', error);
      setError(error.message || 'Failed to register hospital. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hospital Registered Successfully!</h2>
            <p className="text-gray-600">Your hospital has been registered and admin account created.</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">Registration Details:</h3>
            <p className="text-green-700"><strong>Hospital ID:</strong> {success.hospital.hospitalId}</p>
            <p className="text-green-700"><strong>Hospital Name:</strong> {success.hospital.name}</p>
            <p className="text-green-700"><strong>Admin Email:</strong> {success.admin.email}</p>
            <p className="text-green-700"><strong>Staff ID:</strong> {success.admin.staffId}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Admin can now log in and manage the hospital</li>
              <li>• Set up departments and services</li>
              <li>• Register staff members</li>
              <li>• Configure hospital settings</li>
            </ul>
          </div>
          
          <p className="text-gray-500 text-sm">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">🏥 Hospital Registration</h2>
              <p className="text-blue-100 mt-1">Register your hospital and create admin account</p>
            </div>
            <button
              onClick={onBack}
              className="text-blue-200 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-4 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'}`}>
              1
            </div>
            <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-white' : 'bg-blue-400'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'}`}>
              2
            </div>
            <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-white' : 'bg-blue-400'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'}`}>
              3
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Hospital Basic Information */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Hospital Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={hospitalData.name}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hospital name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Type *</label>
                  <select
                    name="type"
                    value={hospitalData.type}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hospitalTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={hospitalData.address}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hospital address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={hospitalData.city}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={hospitalData.state}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={hospitalData.zipCode}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter ZIP code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={hospitalData.phoneNumber}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={hospitalData.email}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hospital email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={hospitalData.website}
                    onChange={handleHospitalChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    name="bedCapacity"
                    value={hospitalData.bedCapacity}
                    onChange={handleHospitalChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter bed capacity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={hospitalData.licenseNumber}
                    onChange={handleHospitalChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hospital license number"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Next: Departments & Services →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Departments and Services */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Departments & Services</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Select Departments</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {commonDepartments.map(dept => (
                      <label key={dept} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          name="departments"
                          value={dept}
                          checked={hospitalData.departments.includes(dept)}
                          onChange={handleHospitalChange}
                          className="rounded"
                        />
                        <span className="text-sm">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Select Services</h4>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {commonServices.map(service => (
                      <label key={service} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          name="services"
                          value={service}
                          checked={hospitalData.services.includes(service)}
                          onChange={handleHospitalChange}
                          className="rounded"
                        />
                        <span className="text-sm">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Next: Admin Account →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Admin Account */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Hospital Administrator Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={adminData.firstName}
                    onChange={handleAdminChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={adminData.lastName}
                    onChange={handleAdminChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={adminData.email}
                    onChange={handleAdminChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter admin email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={adminData.phoneNumber}
                    onChange={handleAdminChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={adminData.password}
                    onChange={handleAdminChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={adminData.confirmPassword}
                    onChange={handleAdminChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-blue-800 mb-2">Administrator Permissions</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Manage all hospital staff</li>
                  <li>• View and manage all patients</li>
                  <li>• Configure hospital departments and services</li>
                  <li>• Access financial reports and billing</li>
                  <li>• Manage hospital settings and configurations</li>
                </ul>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Registering Hospital...' : '🏥 Register Hospital'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default HospitalRegister;
