import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { medicineDatabase, commonDosageInstructions, commonQuantities, commonDurations, getMedicineCategories, searchMedicines } from '../utils/medicineDatabase';

const PrescriptionManager = ({ onBack, selectedPatient }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newPrescription, setNewPrescription] = useState({
    patientId: selectedPatient?.patientId || '',
    patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
    medications: [{ name: '', dosage: '', quantity: '', duration: '' }],
    instructions: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [allPatients, setAllPatients] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  const { userRole, userDetails, createPrescription, createPharmacyNotification, createDeliveryTask, getPatients } = useAuth();
  useEffect(() => {
    loadPrescriptions();
    if (userRole === 'doctor' || userRole === 'receptionist') {
      loadAllPatients();
    }
  }, [selectedPatient, userRole, userDetails]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.patient-dropdown-container')) {
        setShowPatientDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const loadAllPatients = async () => {
    try {
      const patientsData = await getPatients();
      setAllPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };
  
  const handlePatientSearch = (searchValue) => {
    setPatientSearchTerm(searchValue);
    setShowPatientDropdown(true);
    
    if (searchValue.trim() === '') {
      setFilteredPatients(allPatients);
    } else {
      const filtered = allPatients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };
    const handlePatientSelect = (patient) => {
    setNewPrescription({
      ...newPrescription,
      patientId: patient.patientId,
      patientName: `${patient.firstName} ${patient.lastName}`
    });
    setPatientSearchTerm(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };
  
  const clearPatientSelection = () => {
    setNewPrescription({
      ...newPrescription,
      patientId: '',
      patientName: ''
    });
    setPatientSearchTerm('');
    setShowPatientDropdown(false);
  };
  
  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      let prescriptionsQuery;
      
      if (selectedPatient) {
        prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', selectedPatient.patientId),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'patient') {
        prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', userDetails?.patientId),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'doctor') {
        prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('doctorId', '==', userDetails?.staffId),
          orderBy('createdAt', 'desc')
        );
      } else {
        prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          orderBy('createdAt', 'desc')
        );
      }
      
      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      setPrescriptions(prescriptionsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: new Date(doc.data().createdAt).toLocaleDateString() 
      })));
      
    } catch (err) {
      console.error("Error loading prescriptions:", err);
      setError("Failed to load prescriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const addMedication = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [...newPrescription.medications, { name: '', dosage: '', quantity: '', duration: '' }]
    });
  };

  const removeMedication = (index) => {
    const updatedMedications = newPrescription.medications.filter((_, i) => i !== index);
    setNewPrescription({ ...newPrescription, medications: updatedMedications });
  };

  const updateMedication = (index, field, value) => {
    const updatedMedications = newPrescription.medications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setNewPrescription({ ...newPrescription, medications: updatedMedications });
  };  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    
    if (!newPrescription.patientId || !newPrescription.patientName) {
      alert('Please select a patient before creating prescription.');
      return;
    }
    
    try {
      setLoading(true);
      let currentPatient = selectedPatient;
      if (!currentPatient && newPrescription.patientId) {
        currentPatient = allPatients.find(p => p.patientId === newPrescription.patientId);
      }
      
      const isEmergencyPatient = currentPatient?.isEmergency || false;
      const bedNumber = currentPatient?.bedNumber || '';
      const location = currentPatient?.location || '';
      
      const prescriptionData = {
        ...newPrescription,
        doctorId: userDetails?.staffId || '',
        doctorName: userRole === 'doctor' ? 
          `Dr. ${userDetails.firstName} ${userDetails.lastName}` : 
          'Dr. Smith',
        isEmergency: isEmergencyPatient,
        bedNumber: bedNumber,
        location: location,
        medications: newPrescription.medications.map(med => ({
          ...med,
          status: 'prescribed',
          prescribedAt: new Date().toISOString()
        }))
      };

      const createdPrescription = await createPrescription(prescriptionData);

      await createPharmacyNotification({
        prescriptionId: createdPrescription.prescriptionId,
        patientId: prescriptionData.patientId,
        patientName: prescriptionData.patientName,
        isEmergency: isEmergencyPatient,
        bedNumber: bedNumber,
        location: location,
        medications: prescriptionData.medications
      });
      
      if (isEmergencyPatient && bedNumber && location) {
        await createDeliveryTask({
          prescriptionId: createdPrescription.prescriptionId,
          patientId: prescriptionData.patientId,
          patientName: prescriptionData.patientName,
          bedNumber: bedNumber,
          location: location,
          medications: prescriptionData.medications,
          deliveryInstructions: `Emergency delivery to ${location}, Bed ${bedNumber}`
        });
      }
      
      setPrescriptions([{
        id: createdPrescription.prescriptionId,
        ...createdPrescription,
        date: new Date().toLocaleDateString()
      }, ...prescriptions]);
      
      const workflowMessage = isEmergencyPatient 
        ? '✅ Prescription created! 🚨 Emergency delivery task assigned to pharmacy.'
        : '✅ Prescription created! 📱 Pharmacy has been notified.';
      
      alert(workflowMessage);
        setNewPrescription({
        patientId: selectedPatient?.patientId || '',
        patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
        medications: [{ name: '', dosage: '', quantity: '', duration: '' }],
        instructions: ''
      });
      setPatientSearchTerm(selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '');
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating prescription:", error);
      setError("Failed to create prescription. Please try again.");    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📝 Prescription Manager</h2>
          <p className="text-gray-600 mt-1">Create and manage patient prescriptions</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <h3 className="font-semibold text-green-800">Active Prescriptions</h3>
          <p className="text-2xl font-bold text-green-600">
            {prescriptions.filter(p => p.status === 'Active').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-800">Today's Prescriptions</h3>
          <p className="text-2xl font-bold text-blue-600">
            {prescriptions.filter(p => p.date === new Date().toLocaleDateString()).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <h3 className="font-semibold text-purple-800">Total Patients</h3>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(prescriptions.map(p => p.patientId)).size}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
          <h3 className="font-semibold text-orange-800">Total Prescriptions</h3>
          <p className="text-2xl font-bold text-orange-600">{prescriptions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">All Prescriptions</h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
              >
                + Create Prescription
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>            {showCreateForm && (
              <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Create New Prescription</h3>
                <form onSubmit={handleCreatePrescription}>
                  {!selectedPatient && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-md font-semibold text-blue-800 mb-3">👤 Select Patient</h4>
                      <div className="relative patient-dropdown-container">
                        <input
                          type="text"
                          placeholder="Search by patient name, ID, or email..."
                          value={patientSearchTerm}
                          onChange={(e) => handlePatientSearch(e.target.value)}
                          onFocus={() => setShowPatientDropdown(true)}
                          className="w-full border-2 border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          required={!selectedPatient}
                        />
                        
                        {showPatientDropdown && filteredPatients.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredPatients.map((patient) => (
                              <div
                                key={patient.patientId}
                                onClick={() => handlePatientSelect(patient)}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {patient.firstName} {patient.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                                    <p className="text-sm text-gray-500">{patient.email}</p>
                                  </div>
                                  {patient.isEmergency && (
                                    <div className="text-red-600 font-bold text-sm">
                                      🚨 EMERGENCY
                                      <p className="text-xs">{patient.location} - Bed {patient.bedNumber}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {patientSearchTerm && filteredPatients.length === 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                            <p className="text-gray-500">No patients found matching "{patientSearchTerm}"</p>
                          </div>
                        )}
                      </div>
                        {newPrescription.patientId && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-300">
                          <div className="flex justify-between items-center">
                            <p className="text-green-800">
                              ✅ Selected Patient: <strong>{newPrescription.patientName}</strong> (ID: {newPrescription.patientId})
                            </p>
                            <button
                              type="button"
                              onClick={clearPatientSelection}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                              ✕ Clear
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedPatient && (
                    <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
                      <h4 className="text-md font-semibold text-blue-800 mb-2">👤 Patient Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                          <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                          <p><strong>Email:</strong> {selectedPatient.email}</p>
                        </div>
                        {selectedPatient.isEmergency && (
                          <div className="text-red-700">
                            <p className="font-bold">🚨 EMERGENCY PATIENT</p>
                            <p><strong>Location:</strong> {selectedPatient.location}</p>
                            <p><strong>Bed Number:</strong> {selectedPatient.bedNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {newPrescription.medications.map((medication, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4 p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
                        <select
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          required
                        >
                          <option value="">Select Medicine</option>
                          {getMedicineCategories().map(category => (
                            <optgroup key={category} label={category}>
                              {medicineDatabase.filter(med => med.category === category).map(med => (
                                <option key={med.id} value={med.name}>
                                  {med.name} ({med.form})
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Instructions</label>
                        <select
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          required
                        >
                          <option value="">Select Dosage</option>
                          {commonDosageInstructions.map(dosage => (
                            <option key={dosage} value={dosage}>
                              {dosage}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <select
                          value={medication.quantity}
                          onChange={(e) => updateMedication(index, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          required
                        >
                          <option value="">Select Quantity</option>
                          {commonQuantities.map(quantity => (
                            <option key={quantity} value={quantity}>
                              {quantity}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <select
                            value={medication.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            required
                          >
                            <option value="">Select Duration</option>
                            {commonDurations.map(duration => (
                              <option key={duration} value={duration}>
                                {duration}
                              </option>
                            ))}
                          </select>
                        </div>
                        {newPrescription.medications.length > 1 && (
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeMedication(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                              title="Remove medication"
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-700 font-medium">📋 Medicine Status Workflow:</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
                        1. Prescribed
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded border border-blue-300">
                        2. Pharmacy Notified
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded border border-green-300">
                        3. Ready/Delivered
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addMedication}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm mb-4"
                  >
                    + Add Medication
                  </button>

                  <textarea
                    placeholder="Special instructions"
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                    rows="2"
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                    >
                      Create Prescription
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{prescription.prescriptionNumber}</h4>
                      <p className="text-gray-600">{prescription.patientName} ({prescription.patientId})</p>
                      <p className="text-sm text-gray-500">Prescribed by: {prescription.doctorName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{prescription.date}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="font-medium text-gray-700 mb-2">Medications:</h5>
                    <div className="space-y-1">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>{med.name}</strong> - {med.dosage} × {med.quantity} ({med.duration})
                        </div>
                      ))}
                    </div>
                  </div>

                  {prescription.instructions && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-700">Instructions:</h5>
                      <p className="text-sm text-gray-600">{prescription.instructions}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 bg-blue-50 rounded">
                      View Details
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="text-green-600 hover:text-green-800 text-sm px-3 py-1 bg-green-50 rounded"
                    >
                      Print
                    </button>
                    {prescription.status === 'Active' && (
                      <button 
                        onClick={() => {
                          const updated = prescriptions.map(p => 
                            p.id === prescription.id ? {...p, status: 'Cancelled'} : p
                          );
                          setPrescriptions(updated);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 bg-red-50 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
              >
                📝 New Prescription
              </button>
              <button 
                onClick={() => setSearchTerm('')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                🔍 Search Medications
              </button>
              <button 
                onClick={() => {
                  const activeCount = prescriptions.filter(p => p.status === 'Active').length;
                  const completedCount = prescriptions.filter(p => p.status === 'Completed').length;
                  alert(`Prescription History:\nActive: ${activeCount}\nCompleted: ${completedCount}\nTotal: ${prescriptions.length}`);
                }}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
              >
                📊 Prescription History
              </button>
              <button 
                onClick={() => alert('Drug interaction checker feature coming soon!')}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-200"
              >
                ⚠️ Drug Interactions
              </button>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-xl font-semibold text-green-800 mb-4">📋 Prescription Guidelines</h3>
            <div className="space-y-2 text-sm text-green-700">
              <p>• Always verify patient allergies</p>
              <p>• Check for drug interactions</p>
              <p>• Include clear dosage instructions</p>
              <p>• Specify treatment duration</p>
              <p>• Add special instructions if needed</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">📊 Today's Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Prescriptions Written:</span>
                <span className="font-semibold">
                  {prescriptions.filter(p => p.date === new Date().toLocaleDateString()).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Prescriptions:</span>
                <span className="font-semibold text-green-600">
                  {prescriptions.filter(p => p.status === 'Active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Patients Treated:</span>
                <span className="font-semibold">
                  {new Set(prescriptions.filter(p => p.date === new Date().toLocaleDateString()).map(p => p.patientId)).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionManager;