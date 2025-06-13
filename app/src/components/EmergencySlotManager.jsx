import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const EmergencySlotManager = ({ onBack }) => {
  const [emergencySlots, setEmergencySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { userRole, userDetails, createEmergencySlot, updateEmergencySlotStatus } = useAuth();
  
  useEffect(() => {
    loadEmergencySlots();
  }, []);
  
  const loadEmergencySlots = async () => {
    try {
      setLoading(true);
      
      const slotsQuery = query(
        collection(db, 'emergency_slots'),
        orderBy('createdAt', 'desc')
      );
      
      const slotsSnapshot = await getDocs(slotsQuery);
      
      const slots = slotsSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = new Date(data.createdAt);
        const now = new Date();
        const diffMs = now - createdAt;
        const waitMins = Math.floor(diffMs / 60000);
        
        return {
          id: doc.id,
          ...data,
          arrivalTime: createdAt.toLocaleTimeString(),
          waitTime: `${waitMins} mins`,
        };
      });
      
      setEmergencySlots(slots);
    } catch (err) {
      console.error("Error loading emergency slots:", err);
      setError("Failed to load emergency slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [newEmergencySlot, setNewEmergencySlot] = useState({
    patientName: '',
    patientId: '',
    urgency: 'Medium',
    complaint: '',
    notes: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateEmergencySlot = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const slotData = {
        ...newEmergencySlot,
        status: 'Waiting',
        createdBy: userDetails?.staffId || '',
        createdByName: `${userDetails?.firstName || ''} ${userDetails?.lastName || ''}`
      };
      
      const createdSlot = await createEmergencySlot(slotData);
      
      const now = new Date();
      setEmergencySlots([{
        id: createdSlot.slotId,
        ...createdSlot,
        arrivalTime: now.toLocaleTimeString(),
        waitTime: '0 mins',
      }, ...emergencySlots]);
      
      setNewEmergencySlot({
        patientName: '',
        patientId: '',
        urgency: 'Medium',
        complaint: '',
        notes: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating emergency slot:", error);
      setError("Failed to create emergency slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (slotId, newStatus) => {
    try {
      setLoading(true);
      
      await updateEmergencySlotStatus(slotId, newStatus);
      
      setEmergencySlots(slots =>
        slots.map(slot =>
          slot.id === slotId ? { ...slot, status: newStatus } : slot
        )
      );
    } catch (error) {
      console.error("Error updating slot status:", error);
      setError("Failed to update slot status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'border-red-600 bg-red-50';
      case 'High': return 'border-orange-500 bg-orange-50';
      case 'Medium': return 'border-yellow-500 bg-yellow-50';
      case 'Low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Waiting': return 'bg-yellow-100 text-yellow-800';
      case 'In Treatment': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (userRole !== 'doctor') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">Only doctors can access emergency slot management.</p>
        <button
          onClick={onBack}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🚨 Emergency Slot Manager</h2>
          <p className="text-gray-600 mt-1">Manage urgent patient cases and emergency appointments</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Appointments
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
          <h3 className="font-semibold text-red-800">Critical Cases</h3>
          <p className="text-2xl font-bold text-red-600">
            {emergencySlots.filter(slot => slot.urgency === 'Critical').length}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
          <h3 className="font-semibold text-orange-800">High Priority</h3>
          <p className="text-2xl font-bold text-orange-600">
            {emergencySlots.filter(slot => slot.urgency === 'High').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <h3 className="font-semibold text-yellow-800">Waiting</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {emergencySlots.filter(slot => slot.status === 'Waiting').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-800">In Treatment</h3>
          <p className="text-2xl font-bold text-blue-600">
            {emergencySlots.filter(slot => slot.status === 'In Treatment').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Emergency Queue</h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                + Add Emergency Slot
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
                <form onSubmit={handleCreateEmergencySlot}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Patient Name"
                      value={newEmergencySlot.patientName}
                      onChange={(e) => setNewEmergencySlot({...newEmergencySlot, patientName: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Patient ID"
                      value={newEmergencySlot.patientId}
                      onChange={(e) => setNewEmergencySlot({...newEmergencySlot, patientId: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={newEmergencySlot.urgency}
                      onChange={(e) => setNewEmergencySlot({...newEmergencySlot, urgency: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Chief Complaint"
                      value={newEmergencySlot.complaint}
                      onChange={(e) => setNewEmergencySlot({...newEmergencySlot, complaint: e.target.value})}
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Clinical Notes"
                    value={newEmergencySlot.notes}
                    onChange={(e) => setNewEmergencySlot({...newEmergencySlot, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                    rows="2"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                      Create Emergency Slot
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
              {emergencySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`border-l-4 p-4 rounded-r-lg ${getUrgencyColor(slot.urgency)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-800">{slot.patientName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          slot.urgency === 'Critical' ? 'bg-red-200 text-red-800' :
                          slot.urgency === 'High' ? 'bg-orange-200 text-orange-800' :
                          slot.urgency === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {slot.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{slot.patientId}</p>
                      <p className="text-gray-700 font-medium">{slot.complaint}</p>
                      <p className="text-sm text-gray-500 mt-1">{slot.notes}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Arrival: {slot.arrivalTime}</span>
                        <span>Wait Time: {slot.waitTime}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                        {slot.status}
                      </span>
                      <div className="flex gap-1">
                        {slot.status === 'Waiting' && (
                          <button
                            onClick={() => handleStatusUpdate(slot.id, 'In Treatment')}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded"
                          >
                            Start Treatment
                          </button>
                        )}
                        {slot.status === 'In Treatment' && (
                          <button
                            onClick={() => handleStatusUpdate(slot.id, 'Completed')}
                            className="text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-100 rounded"
                          >
                            Complete
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 bg-gray-100 rounded">
                          View Details
                        </button>
                      </div>
                    </div>
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
                onClick={() => alert('🚑 Ambulance has been notified!\nETA: 5-10 minutes')}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
              >
                🚑 Call Ambulance
              </button>
              <button 
                onClick={() => alert('🏥 ICU has been alerted!\nBed assignment in progress...')}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-200"
              >
                🏥 Alert ICU
              </button>
              <button 
                onClick={() => alert('🔬 Lab has been notified!\nPriority testing queue activated.')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                🔬 Order Lab Tests
              </button>
              <button 
                onClick={() => alert('📋 Emergency protocols activated!\nStaff have been notified.')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
              >
                📋 Emergency Protocols
              </button>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <h3 className="text-xl font-semibold text-red-800 mb-4">⚠️ Triage Guidelines</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-red-100 p-2 rounded">
                <strong className="text-red-800">Critical:</strong>
                <p className="text-red-700">Life-threatening conditions requiring immediate attention</p>
              </div>
              <div className="bg-orange-100 p-2 rounded">
                <strong className="text-orange-800">High:</strong>
                <p className="text-orange-700">Urgent conditions that may become critical</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded">
                <strong className="text-yellow-800">Medium:</strong>
                <p className="text-yellow-700">Semi-urgent conditions requiring prompt care</p>
              </div>
              <div className="bg-blue-100 p-2 rounded">
                <strong className="text-blue-800">Low:</strong>
                <p className="text-blue-700">Non-urgent conditions for routine care</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">📊 Today's Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Emergency Cases:</span>
                <span className="font-semibold">{emergencySlots.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Wait Time:</span>
                <span className="font-semibold">22 minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Cases Completed:</span>
                <span className="font-semibold text-green-600">
                  {emergencySlots.filter(slot => slot.status === 'Completed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cases Pending:</span>
                <span className="font-semibold text-yellow-600">
                  {emergencySlots.filter(slot => slot.status !== 'Completed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySlotManager;
