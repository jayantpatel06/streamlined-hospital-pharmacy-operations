import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

const PatientAdmission = ({ onBack, selectedPatient }) => {
  const [patients, setPatients] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [selectedPatientData, setSelectedPatientData] = useState(selectedPatient || null);
  const [patientSearch, setPatientSearch] = useState(selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  const [admissionData, setAdmissionData] = useState({
    admissionType: 'emergency',
    department: '',
    wardType: '',
    bedNumber: '',
    roomNumber: '',
    admissionReason: '',
    severity: 'medium',
    admittingDoctor: '',
    notes: '',
    estimatedStay: '',
    specialRequirements: ''
  });

  const { userRole, userDetails, getPatientsForHospital } = useAuth();

  const admissionTypes = [
    { value: 'emergency', label: '🚨 Emergency Admission', color: 'red' },
    { value: 'planned', label: '📅 Planned Admission', color: 'blue' },
    { value: 'transfer', label: '🔄 Transfer Admission', color: 'purple' }
  ];

  const departments = [
    'Emergency Medicine',
    'General Medicine',
    'Surgery',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'ICU',
    'Obstetrics & Gynecology',
    'Psychiatry'
  ];

  const wardTypes = [
    { value: 'emergency', label: 'Emergency Ward', capacity: 20 },
    { value: 'icu', label: 'ICU', capacity: 12 },
    { value: 'general', label: 'General Ward', capacity: 50 },
    { value: 'private', label: 'Private Room', capacity: 25 },
    { value: 'pediatric', label: 'Pediatric Ward', capacity: 30 },
    { value: 'maternity', label: 'Maternity Ward', capacity: 20 },
    { value: 'surgical', label: 'Surgical Ward', capacity: 35 }
  ];

  const severityLevels = [
    { value: 'critical', label: 'Critical', color: 'red', priority: 1 },
    { value: 'high', label: 'High', color: 'orange', priority: 2 },
    { value: 'medium', label: 'Medium', color: 'yellow', priority: 3 },
    { value: 'low', label: 'Low', color: 'green', priority: 4 }
  ];

  useEffect(() => {
    loadPatients();
    loadAdmissions();
  }, []);

  const loadPatients = async () => {
    try {
      const patientsData = await getPatientsForHospital();
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmissions = async () => {
    try {
      const admissionsQuery = query(
        collection(db, 'admissions'),
        where('hospitalId', '==', userDetails?.hospitalId)
      );
      const admissionsSnapshot = await getDocs(admissionsQuery);
      const admissionsData = admissionsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setAdmissions(admissionsData);
    } catch (error) {
      console.error('Error loading admissions:', error);
    }
  };

  const handlePatientSearch = (searchValue) => {
    setPatientSearch(searchValue);
    setShowPatientDropdown(true);
    
    if (searchValue.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatientData(patient);
    setPatientSearch(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  const generateAdmissionId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ADM${timestamp}${random}`;
  };

  const generateBedNumber = (wardType) => {
    const ward = wardTypes.find(w => w.value === wardType);
    if (!ward) return '';
    
    const wardPrefix = wardType.toUpperCase().slice(0, 3);
    const existingBeds = admissions
      .filter(adm => adm.wardType === wardType && adm.status === 'active')
      .map(adm => adm.bedNumber);
    
    for (let i = 1; i <= ward.capacity; i++) {
      const bedNumber = `${wardPrefix}-${i.toString().padStart(3, '0')}`;
      if (!existingBeds.includes(bedNumber)) {
        return bedNumber;
      }
    }
    
    return `${wardPrefix}-FULL`;
  };

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatientData) {
      setError('Please select a patient');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const admissionId = generateAdmissionId();
      const bedNumber = admissionData.bedNumber || generateBedNumber(admissionData.wardType);
      
      if (bedNumber.includes('FULL')) {
        setError(`${admissionData.wardType} ward is full. Please select a different ward.`);
        return;
      }

      const admission = {
        admissionId,
        patientId: selectedPatientData.patientId,
        patientName: `${selectedPatientData.firstName} ${selectedPatientData.lastName}`,
        hospitalId: userDetails.hospitalId,
        hospitalName: userDetails.hospitalName,
        admissionType: admissionData.admissionType,
        department: admissionData.department,
        wardType: admissionData.wardType,
        bedNumber: bedNumber,
        roomNumber: admissionData.roomNumber,
        admissionReason: admissionData.admissionReason,
        severity: admissionData.severity,
        admittingDoctor: admissionData.admittingDoctor || `${userDetails.firstName} ${userDetails.lastName}`,
        notes: admissionData.notes,
        estimatedStay: admissionData.estimatedStay,
        specialRequirements: admissionData.specialRequirements,
        admissionDate: new Date().toISOString(),
        status: 'active',
        createdBy: userDetails.staffId,
        isEmergencyAdmission: admissionData.admissionType === 'emergency',
        medicineDeliveryType: admissionData.admissionType === 'emergency' ? 'bedside' : 'pharmacy'
      };

      await addDoc(collection(db, 'admissions'), admission);

      const patientRef = doc(db, 'users', selectedPatientData.uid);
      await updateDoc(patientRef, {
        isAdmitted: true,
        currentAdmissionId: admissionId,
        currentBedNumber: bedNumber,
        currentWard: admissionData.wardType,
        admissionDate: new Date().toISOString(),
        medicineDeliveryType: admission.medicineDeliveryType
      });

      setSuccess(`✅ Patient admitted successfully! Admission ID: ${admissionId}, Bed: ${bedNumber}`);
      
      setAdmissionData({
        admissionType: 'emergency',
        department: '',
        wardType: '',
        bedNumber: '',
        roomNumber: '',
        admissionReason: '',
        severity: 'medium',
        admittingDoctor: '',
        notes: '',
        estimatedStay: '',
        specialRequirements: ''
      });
      setSelectedPatientData(null);
      setPatientSearch('');
      
      loadAdmissions();
      
    } catch (error) {
      console.error('Error admitting patient:', error);
      setError('Failed to admit patient: ' + error.message);
    }
  };

  const getOccupancyRate = (wardType) => {
    const ward = wardTypes.find(w => w.value === wardType);
    if (!ward) return 0;
    
    const occupied = admissions.filter(adm => 
      adm.wardType === wardType && adm.status === 'active'
    ).length;
    
    return Math.round((occupied / ward.capacity) * 100);
  };

  const getSeverityColor = (severity) => {
    const level = severityLevels.find(s => s.value === severity);
    return level ? level.color : 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient admission system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🏥 Patient Admission</h2>
          <p className="text-gray-600 mt-1">Admit patients and allocate beds</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admission Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient Admission Form</h3>
            
            <form onSubmit={handleAdmissionSubmit}>
              {/* Patient Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
                <div className="relative patient-dropdown-container">
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => handlePatientSearch(e.target.value)}
                    placeholder="Search patient by name, ID, or email..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredPatients.map(patient => (
                        <div
                          key={patient.uid}
                          onClick={() => handlePatientSelect(patient)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-800">{patient.firstName} {patient.lastName}</p>
                              <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                              <p className="text-sm text-gray-500">{patient.email}</p>
                            </div>
                            {patient.isAdmitted && (
                              <div className="text-orange-600 font-bold text-sm">
                                🏥 Currently Admitted
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedPatientData && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-300">
                    <p className="text-green-800">
                      ✅ Selected Patient: <strong>{selectedPatientData.firstName} {selectedPatientData.lastName}</strong> 
                      (ID: {selectedPatientData.patientId})
                    </p>
                  </div>
                )}
              </div>

              {/* Admission Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {admissionTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setAdmissionData(prev => ({ ...prev, admissionType: type.value }))}
                      className={`p-3 rounded-lg border-2 text-center font-medium ${
                        admissionData.admissionType === type.value
                          ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-800`
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={admissionData.department}
                    onChange={(e) => setAdmissionData(prev => ({ ...prev, department: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Ward Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ward Type</label>
                  <select
                    value={admissionData.wardType}
                    onChange={(e) => setAdmissionData(prev => ({ ...prev, wardType: e.target.value }))}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Ward Type</option>
                    {wardTypes.map(ward => (
                      <option key={ward.value} value={ward.value}>
                        {ward.label} ({getOccupancyRate(ward.value)}% occupied)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
                  <select
                    value={admissionData.severity}
                    onChange={(e) => setAdmissionData(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label} Priority
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estimated Stay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Stay (days)</label>
                  <input
                    type="number"
                    value={admissionData.estimatedStay}
                    onChange={(e) => setAdmissionData(prev => ({ ...prev, estimatedStay: e.target.value }))}
                    min="1"
                    placeholder="e.g., 3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Admission Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Reason</label>
                <textarea
                  value={admissionData.admissionReason}
                  onChange={(e) => setAdmissionData(prev => ({ ...prev, admissionReason: e.target.value }))}
                  required
                  rows="3"
                  placeholder="Describe the reason for admission..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={admissionData.notes}
                  onChange={(e) => setAdmissionData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="2"
                  placeholder="Any additional notes or instructions..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedPatientData}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
              >
                🏥 Admit Patient
              </button>
            </form>
          </div>
        </div>

        {/* Ward Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ward Occupancy</h3>
            <div className="space-y-3">
              {wardTypes.map(ward => {
                const occupancyRate = getOccupancyRate(ward.value);
                const occupied = admissions.filter(adm => 
                  adm.wardType === ward.value && adm.status === 'active'
                ).length;
                
                return (
                  <div key={ward.value} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{ward.label}</h4>
                      <span className="text-sm text-gray-600">{occupied}/{ward.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          occupancyRate >= 90 ? 'bg-red-500' :
                          occupancyRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${occupancyRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{occupancyRate}% occupied</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Medicine Delivery Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-600 text-xl">🚨</span>
                <div>
                  <h4 className="font-medium text-red-800">Emergency Admissions</h4>
                  <p className="text-sm text-red-700">Medicines delivered directly to bedside</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 text-xl">🏥</span>
                <div>
                  <h4 className="font-medium text-blue-800">Regular Admissions</h4>
                  <p className="text-sm text-blue-700">Patients collect medicines from pharmacy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAdmission;
