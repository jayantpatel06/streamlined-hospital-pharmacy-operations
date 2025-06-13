import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const MedicalRecordsManager = ({ onBack, selectedPatient }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { userRole, userDetails, createMedicalRecord } = useAuth();
  
  useEffect(() => {
    loadMedicalRecords();
  }, [selectedPatient, userRole, userDetails]);
  
  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      let recordsQuery;
      
      if (selectedPatient) {
        recordsQuery = query(
          collection(db, 'medical_records'),
          where('patientId', '==', selectedPatient.patientId),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'patient') {
        recordsQuery = query(
          collection(db, 'medical_records'),
          where('patientId', '==', userDetails?.patientId),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'doctor') {
        recordsQuery = query(
          collection(db, 'medical_records'),
          where('doctorId', '==', userDetails?.staffId),
          orderBy('createdAt', 'desc')
        );
      } else {
        recordsQuery = query(
          collection(db, 'medical_records'),
          orderBy('createdAt', 'desc')
        );
      }
      
      const recordsSnapshot = await getDocs(recordsQuery);
      setRecords(recordsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: new Date(doc.data().createdAt).toLocaleDateString() 
      })));
      
    } catch (err) {
      console.error("Error loading medical records:", err);
      setError("Failed to load medical records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [newRecord, setNewRecord] = useState({
    patientId: selectedPatient?.patientId || '',
    patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
    type: 'Consultation',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    followUp: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const recordData = {
        ...newRecord,
        doctorId: userDetails?.staffId || '',
        doctorName: userRole === 'doctor' ? 
          `Dr. ${userDetails.firstName} ${userDetails.lastName}` : 
          'Dr. Smith'
      };

      const createdRecord = await createMedicalRecord(recordData);
      
      setRecords([{
        id: createdRecord.recordId,
        ...createdRecord,
        date: new Date().toLocaleDateString()
      }, ...records]);
      
      setNewRecord({
        patientId: selectedPatient?.patientId || '',
        patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
        type: 'Consultation',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: '',
        vitals: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: ''
        },
        followUp: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating medical record:", error);
      setError("Failed to create medical record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'Consultation': return 'bg-blue-100 text-blue-800';
      case 'Follow-up': return 'bg-green-100 text-green-800';
      case 'Emergency': return 'bg-red-100 text-red-800';
      case 'Surgery': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📋 Medical Records Manager</h2>
          <p className="text-gray-600 mt-1">Manage patient medical records and history</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-800">Total Records</h3>
          <p className="text-2xl font-bold text-blue-600">{records.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <h3 className="font-semibold text-green-800">Today's Records</h3>
          <p className="text-2xl font-bold text-green-600">
            {records.filter(r => r.date === new Date().toLocaleDateString()).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <h3 className="font-semibold text-purple-800">Patients</h3>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(records.map(r => r.patientId)).size}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
          <h3 className="font-semibold text-orange-800">Follow-ups Due</h3>
          <p className="text-2xl font-bold text-orange-600">3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Medical Records</h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                + New Record
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {showCreateForm && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                <form onSubmit={handleCreateRecord}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Patient ID"
                      value={newRecord.patientId}
                      onChange={(e) => setNewRecord({...newRecord, patientId: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Patient Name"
                      value={newRecord.patientName}
                      onChange={(e) => setNewRecord({...newRecord, patientName: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Therapy">Therapy</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Diagnosis"
                      value={newRecord.diagnosis}
                      onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <textarea
                      placeholder="Symptoms"
                      value={newRecord.symptoms}
                      onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows="2"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <textarea
                      placeholder="Treatment"
                      value={newRecord.treatment}
                      onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows="2"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="BP"
                      value={newRecord.vitals.bloodPressure}
                      onChange={(e) => setNewRecord({
                        ...newRecord, 
                        vitals: {...newRecord.vitals, bloodPressure: e.target.value}
                      })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="HR"
                      value={newRecord.vitals.heartRate}
                      onChange={(e) => setNewRecord({
                        ...newRecord, 
                        vitals: {...newRecord.vitals, heartRate: e.target.value}
                      })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Temp"
                      value={newRecord.vitals.temperature}
                      onChange={(e) => setNewRecord({
                        ...newRecord, 
                        vitals: {...newRecord.vitals, temperature: e.target.value}
                      })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Weight"
                      value={newRecord.vitals.weight}
                      onChange={(e) => setNewRecord({
                        ...newRecord, 
                        vitals: {...newRecord.vitals, weight: e.target.value}
                      })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Height"
                      value={newRecord.vitals.height}
                      onChange={(e) => setNewRecord({
                        ...newRecord, 
                        vitals: {...newRecord.vitals, height: e.target.value}
                      })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <textarea
                      placeholder="Additional notes"
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      rows="2"
                    />
                    <input
                      type="text"
                      placeholder="Follow-up required"
                      value={newRecord.followUp}
                      onChange={(e) => setNewRecord({...newRecord, followUp: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      Create Record
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
              {filteredRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{record.patientName}</h4>
                      <p className="text-gray-600">{record.patientId}</p>
                      <p className="text-sm text-gray-500">By: {record.doctorName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{record.date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h5 className="font-medium text-gray-700">Diagnosis:</h5>
                      <p className="text-sm text-gray-600">{record.diagnosis}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700">Symptoms:</h5>
                      <p className="text-sm text-gray-600">{record.symptoms}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="font-medium text-gray-700">Treatment:</h5>
                    <p className="text-sm text-gray-600">{record.treatment}</p>
                  </div>

                  {record.vitals && (
                    <div className="mb-3 bg-gray-50 p-2 rounded">
                      <h5 className="font-medium text-gray-700 mb-1">Vitals:</h5>
                      <div className="text-xs text-gray-600 grid grid-cols-5 gap-2">
                        <span>BP: {record.vitals.bloodPressure}</span>
                        <span>HR: {record.vitals.heartRate}</span>
                        <span>Temp: {record.vitals.temperature}</span>
                        <span>Weight: {record.vitals.weight}</span>
                        <span>Height: {record.vitals.height}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 bg-blue-50 rounded"
                      >
                        View Full
                      </button>
                      <button 
                        onClick={() => alert('Edit functionality coming soon!')}
                        className="text-green-600 hover:text-green-800 text-sm px-3 py-1 bg-green-50 rounded"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => window.print()}
                        className="text-purple-600 hover:text-purple-800 text-sm px-3 py-1 bg-purple-50 rounded"
                      >
                        Print
                      </button>
                    </div>
                    {record.followUp && (
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        Follow-up: {record.followUp}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>            <div className="space-y-3">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                📋 New Record
              </button>
              <button 
                onClick={() => setSearchTerm('')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
              >
                🔍 Search Records
              </button>
              <button 
                onClick={() => {
                  const todayRecords = records.filter(r => r.date === new Date().toLocaleDateString()).length;
                  const totalPatients = new Set(records.map(r => r.patientId)).size;
                  alert(`Medical Records Report:\nToday's Records: ${todayRecords}\nTotal Records: ${records.length}\nPatients: ${totalPatients}`);
                }}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
              >
                📊 Generate Report
              </button>
              <button 
                onClick={() => alert('Follow-up scheduler feature coming soon!')}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-200"
              >
                📅 Follow-up Scheduler
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">📊 Today's Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Records Created:</span>
                <span className="font-semibold">
                  {records.filter(r => r.date === new Date().toLocaleDateString()).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Patients Seen:</span>
                <span className="font-semibold">
                  {new Set(records.filter(r => r.date === new Date().toLocaleDateString()).map(r => r.patientId)).size}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Follow-ups Scheduled:</span>
                <span className="font-semibold text-orange-600">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Medical Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Patient:</strong> {selectedRecord.patientName}
                  </div>
                  <div>
                    <strong>ID:</strong> {selectedRecord.patientId}
                  </div>
                  <div>
                    <strong>Doctor:</strong> {selectedRecord.doctorName}
                  </div>
                  <div>
                    <strong>Date:</strong> {selectedRecord.date}
                  </div>
                </div>
                
                <div>
                  <strong>Diagnosis:</strong>
                  <p>{selectedRecord.diagnosis}</p>
                </div>
                
                <div>
                  <strong>Symptoms:</strong>
                  <p>{selectedRecord.symptoms}</p>
                </div>
                
                <div>
                  <strong>Treatment:</strong>
                  <p>{selectedRecord.treatment}</p>
                </div>
                
                {selectedRecord.notes && (
                  <div>
                    <strong>Notes:</strong>
                    <p>{selectedRecord.notes}</p>
                  </div>
                )}
                
                {selectedRecord.followUp && (
                  <div>
                    <strong>Follow-up:</strong>
                    <p>{selectedRecord.followUp}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsManager;
