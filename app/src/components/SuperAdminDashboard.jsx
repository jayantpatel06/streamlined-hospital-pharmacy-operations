import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SuperAdminDashboard = ({ onLogout }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const { getHospitals, getHospitalById, getStaffForHospital, getPatientsForHospital } = useAuth();

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const hospitalsData = await getHospitals();
      setHospitals(hospitalsData);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.hospitalId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHospitalStats = () => {
    const total = hospitals.length;
    const active = hospitals.filter(h => h.status === 'active').length;
    const totalBeds = hospitals.reduce((sum, h) => sum + (h.bedCapacity || 0), 0);
    const avgBeds = totalBeds / total || 0;

    return { total, active, totalBeds, avgBeds: Math.round(avgBeds) };
  };

  const stats = getHospitalStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hospitals...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🌐 Super Admin Dashboard</h1>
              <p className="text-gray-600">Manage all hospitals and system-wide operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg ${viewMode === 'analytics' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Analytics
              </button>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Total Hospitals</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Active Hospitals</h3>
            <p className="text-3xl font-bold">{stats.active}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Total Bed Capacity</h3>
            <p className="text-3xl font-bold">{stats.totalBeds.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Average Beds</h3>
            <p className="text-3xl font-bold">{stats.avgBeds}</p>
          </div>
        </div>

        {viewMode === 'overview' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search hospitals by name, city, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={loadHospitals}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Hospitals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map(hospital => (
                <div key={hospital.hospitalId} className="bg-white rounded-xl shadow-lg border hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{hospital.name}</h3>
                        <p className="text-gray-600">{hospital.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(hospital.status)}`}>
                        {hospital.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">ID:</span> {hospital.hospitalId}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {hospital.city}, {hospital.state}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Beds:</span> {hospital.bedCapacity || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Departments:</span> {hospital.departments?.length || 0}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500 mb-3">
                        Registered: {new Date(hospital.registrationDate).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedHospital(hospital);
                            setViewMode('hospital-details');
                          }}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600"
                        >
                          View Details
                        </button>
                        <button className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-gray-600">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredHospitals.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏥</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Hospitals Found</h3>
                <p className="text-gray-500">No hospitals match your search criteria.</p>
              </div>
            )}
          </>
        )}

        {viewMode === 'hospital-details' && selectedHospital && (
          <HospitalDetails
            hospital={selectedHospital}
            onBack={() => {
              setViewMode('overview');
              setSelectedHospital(null);
            }}
          />
        )}

        {viewMode === 'analytics' && (
          <SystemAnalytics hospitals={hospitals} />
        )}
      </div>
    </div>
  );
};

const HospitalDetails = ({ hospital, onBack }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [staff, setStaff] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getStaffForHospital, getPatientsForHospital } = useAuth();

  useEffect(() => {
    if (activeTab === 'staff') {
      loadStaff();
    } else if (activeTab === 'patients') {
      loadPatients();
    }
  }, [activeTab, hospital.hospitalId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const staffData = await getStaffForHospital(hospital.hospitalId);
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await getPatientsForHospital(hospital.hospitalId);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{hospital.name}</h2>
            <p className="text-gray-600">{hospital.type} • {hospital.city}, {hospital.state}</p>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Back to Overview
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-4">
          {['info', 'staff', 'patients', 'departments', 'services'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab === 'info' ? 'Information' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {hospital.email}</p>
                <p><span className="font-medium">Phone:</span> {hospital.phoneNumber}</p>
                <p><span className="font-medium">Address:</span> {hospital.address}</p>
                <p><span className="font-medium">Website:</span> {hospital.website || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Hospital Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">License:</span> {hospital.licenseNumber}</p>
                <p><span className="font-medium">Bed Capacity:</span> {hospital.bedCapacity}</p>
                <p><span className="font-medium">Registered:</span> {new Date(hospital.registrationDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Status:</span> <span className="capitalize">{hospital.status}</span></p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Staff Members ({staff.length})</h3>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading staff...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Staff ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(member => (
                      <tr key={member.uid}>
                        <td className="border border-gray-300 px-4 py-2">
                          {member.firstName} {member.lastName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 capitalize">{member.role}</td>
                        <td className="border border-gray-300 px-4 py-2">{member.department}</td>
                        <td className="border border-gray-300 px-4 py-2">{member.staffId}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'departments' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Departments ({hospital.departments?.length || 0})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {hospital.departments?.map(dept => (
                <div key={dept} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-800 font-medium">{dept}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Services ({hospital.services?.length || 0})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hospital.services?.map(service => (
                <div key={service} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-800">{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SystemAnalytics = ({ hospitals }) => {
  const hospitalsByType = hospitals.reduce((acc, hospital) => {
    acc[hospital.type] = (acc[hospital.type] || 0) + 1;
    return acc;
  }, {});

  const hospitalsByState = hospitals.reduce((acc, hospital) => {
    acc[hospital.state] = (acc[hospital.state] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">System Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Hospitals by Type</h3>
          <div className="space-y-3">
            {Object.entries(hospitalsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-gray-600">{type}</span>
                <span className="font-semibold text-blue-600">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Hospitals by State</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(hospitalsByState).map(([state, count]) => (
              <div key={state} className="flex justify-between items-center">
                <span className="text-gray-600">{state}</span>
                <span className="font-semibold text-green-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Registrations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Hospital Name</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Location</th>
                <th className="text-left py-2">Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {hospitals
                .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
                .slice(0, 10)
                .map(hospital => (
                  <tr key={hospital.hospitalId} className="border-b">
                    <td className="py-2">{hospital.name}</td>
                    <td className="py-2">{hospital.type}</td>
                    <td className="py-2">{hospital.city}, {hospital.state}</td>
                    <td className="py-2">{new Date(hospital.registrationDate).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
