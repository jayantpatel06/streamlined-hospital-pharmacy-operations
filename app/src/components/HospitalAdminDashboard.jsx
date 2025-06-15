import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const HospitalAdminDashboard = ({ onSwitchView }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [hospitalData, setHospitalData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalPatients: 0,
    activeDoctors: 0,
    totalDepartments: 0
  });
  const [loading, setLoading] = useState(true);

  const { 
    userDetails, 
    getHospitalById, 
    getStaffForHospital, 
    getPatientsForHospital,
    registerStaffForHospital,
    logout 
  } = useAuth();

  useEffect(() => {
    if (userDetails?.hospitalId) {
      loadHospitalData();
      loadStaff();
      loadPatients();
    }
  }, [userDetails]);

  const loadHospitalData = async () => {
    try {
      const hospital = await getHospitalById(userDetails.hospitalId);
      setHospitalData(hospital);
    } catch (error) {
      console.error('Error loading hospital data:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const staffData = await getStaffForHospital(userDetails.hospitalId);
      setStaff(staffData);
      
      setStats(prev => ({
        ...prev,
        totalStaff: staffData.length,
        activeDoctors: staffData.filter(s => s.role === 'doctor' && s.isActive).length
      }));
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const patientsData = await getPatientsForHospital(userDetails.hospitalId);
      setPatients(patientsData);
      
      setStats(prev => ({
        ...prev,
        totalPatients: patientsData.length
      }));
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hospital Info Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{hospitalData?.name || 'Hospital'}</h1>
            <p className="text-blue-100 mt-1">{hospitalData?.type} • {hospitalData?.city}, {hospitalData?.state}</p>
            <p className="text-blue-100">{userDetails?.firstName} {userDetails?.lastName} - Hospital Administrator</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">Hospital ID</p>
            <p className="text-xl font-bold">{hospitalData?.hospitalId}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">👥 Total Staff</h3>
          <p className="text-3xl font-bold">{stats.totalStaff}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">👨‍⚕️ Active Doctors</h3>
          <p className="text-3xl font-bold">{stats.activeDoctors}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">🏥 Total Patients</h3>
          <p className="text-3xl font-bold">{stats.totalPatients}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">🏢 Departments</h3>
          <p className="text-3xl font-bold">{hospitalData?.departments?.length || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">👨‍💼 Staff Management</h3>
          <p className="text-gray-600 mb-4">Register and manage hospital staff</p>
          <button 
            onClick={() => setCurrentView('staff-management')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
          >
            Manage Staff
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">🏥 Hospital Settings</h3>
          <p className="text-gray-600 mb-4">Configure departments and services</p>
          <button 
            onClick={() => setCurrentView('hospital-settings')}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30"
          >
            Configure Settings
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg font-semibold mb-2">📊 Reports & Analytics</h3>
          <p className="text-gray-600 mb-4">View hospital performance reports</p>
          <button 
            onClick={() => setCurrentView('reports')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
          >
            View Reports
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">🎛️ System Access</h3>
          <p className="text-gray-600 mb-4">Access hospital operations dashboard</p>
          <button 
            onClick={() => onSwitchView('hospital-operations')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
          >
            Hospital Operations
          </button>
        </div>
      </div>

      {/* Recent Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Staff Members</h3>
          <div className="space-y-3">
            {staff.slice(0, 5).map(member => (
              <div key={member.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{member.firstName} {member.lastName}</p>
                  <p className="text-sm text-gray-600">{member.role} • {member.department}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setCurrentView('staff-management')}
            className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Staff →
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Hospital Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{hospitalData?.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bed Capacity:</span>
              <span className="font-medium">{hospitalData?.bedCapacity || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">License:</span>
              <span className="font-medium">{hospitalData?.licenseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{hospitalData?.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Services:</span>
              <span className="font-medium">{hospitalData?.services?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <StaffManagement 
      staff={staff}
      hospitalData={hospitalData}
      onBack={() => setCurrentView('dashboard')}
      onStaffAdded={loadStaff}
    />
  );

  const renderHospitalSettings = () => (
    <HospitalSettings 
      hospitalData={hospitalData}
      onBack={() => setCurrentView('dashboard')}
      onUpdated={loadHospitalData}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hospital dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Hospital Admin Dashboard</h1>
              {currentView !== 'dashboard' && (
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Back to Dashboard
                </button>
              )}
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'staff-management' && renderStaffManagement()}
      {currentView === 'hospital-settings' && renderHospitalSettings()}
    </div>
  );
};

const StaffManagement = ({ staff, hospitalData, onBack, onStaffAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'doctor',
    department: '',
    specialization: '',
    licenseNumber: '',
    position: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { registerStaffForHospital } = useAuth();

  const staffRoles = [
    'doctor',
    'nurse',
    'receptionist',
    'pharmacy',
    'lab_technician'
  ];

  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await registerStaffForHospital(newStaff.email, newStaff.password, newStaff, hospitalData.hospitalId);
      
      setNewStaff({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'doctor',
        department: '',
        specialization: '',
        licenseNumber: '',
        position: ''
      });
      setShowAddForm(false);
      onStaffAdded();
      
      alert('✅ Staff member registered successfully!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setNewStaff({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      password: '', // Don't prefill password for security
      phoneNumber: staffMember.phoneNumber || '',
      role: staffMember.role,
      department: staffMember.department || '',
      specialization: staffMember.specialization || '',
      licenseNumber: staffMember.licenseNumber || '',
      position: staffMember.position || ''
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Update staff member in Firebase
      const staffRef = doc(db, 'users', editingStaff.uid);
      await updateDoc(staffRef, {
        firstName: newStaff.firstName,
        lastName: newStaff.lastName,
        phoneNumber: newStaff.phoneNumber,
        role: newStaff.role,
        department: newStaff.department,
        specialization: newStaff.specialization,
        licenseNumber: newStaff.licenseNumber,
        position: newStaff.position,
        updatedAt: new Date().toISOString()
      });
      
      setShowEditForm(false);
      setEditingStaff(null);
      setNewStaff({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'doctor',
        department: '',
        specialization: '',
        licenseNumber: '',
        position: ''
      });
      
      onStaffAdded(); // Reload staff list
      
      alert('✅ Staff member updated successfully!');
    } catch (error) {
      console.error('Error updating staff:', error);
      setError('Failed to update staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingStaff(null);
    setNewStaff({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: 'doctor',
      department: '',
      specialization: '',
      licenseNumber: '',
      position: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Staff Management</h2>
          <p className="text-gray-600">Manage {hospitalData?.name} staff members</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            + Add Staff Member
          </button>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Add Staff Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Staff Member</h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleAddStaff}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newStaff.firstName}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={newStaff.lastName}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={newStaff.phoneNumber}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {staffRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, department: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {hospitalData?.departments?.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newStaff.specialization}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Form Modal */}
      {showEditForm && editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Staff Member</h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleUpdateStaff}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newStaff.firstName}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={newStaff.lastName}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={newStaff.phoneNumber}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {staffRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, department: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {hospitalData?.departments?.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newStaff.specialization}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {loading ? 'Updating...' : 'Update Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Department</th>
                <th className="px-6 py-4 text-left">Staff ID</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member, index) => (
                <tr key={member.uid} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{member.role?.replace('_', ' ')}</td>
                  <td className="px-6 py-4">{member.department}</td>
                  <td className="px-6 py-4 font-mono text-sm">{member.staffId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditStaff(member)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const HospitalSettings = ({ hospitalData, onBack, onUpdated }) => {
  const [settings, setSettings] = useState({
    departments: hospitalData?.departments || [],
    services: hospitalData?.services || [],
    bedCapacity: hospitalData?.bedCapacity || '',
    website: hospitalData?.website || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { updateHospitalSettings } = useAuth();

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateHospitalSettings(hospitalData.hospitalId, settings);
      setSuccess('Settings updated successfully!');
      onUpdated();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Hospital Settings</h2>
          <p className="text-gray-600">Configure {hospitalData?.name} settings</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          ← Back
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bed Capacity</label>
            <input
              type="number"
              value={settings.bedCapacity}
              onChange={(e) => setSettings(prev => ({ ...prev, bedCapacity: parseInt(e.target.value) || '' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {settings.departments.map(dept => (
              <div key={dept} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                {dept}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {settings.services.map(service => (
              <div key={service} className="bg-green-50 border border-green-200 rounded-lg p-2 text-sm">
                {service}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalAdminDashboard;
