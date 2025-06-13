import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const PharmacyManager = ({ onBack }) => {
  const [notifications, setNotifications] = useState([]);
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');

  const { userRole, userDetails, updateMedicationStatus } = useAuth();

  useEffect(() => {
    if (userRole === 'pharmacy') {
      loadPharmacyData();
    }
  }, [userRole]);

  const loadPharmacyData = async () => {
    try {
      setLoading(true);
      
      const notificationsQuery = query(
        collection(db, 'pharmacy_notifications'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      setNotifications(notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const deliveryQuery = query(
        collection(db, 'delivery_tasks'),
        orderBy('assignedAt', 'desc')
      );
      const deliverySnapshot = await getDocs(deliveryQuery);
      setDeliveryTasks(deliverySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        orderBy('createdAt', 'desc')
      );
      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      setPrescriptions(prescriptionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error('Error loading pharmacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationStatusUpdate = async (prescriptionId, medicationIndex, newStatus) => {
    try {
      setLoading(true);
      
      await updateMedicationStatus(prescriptionId, medicationIndex, newStatus);
      
      setPrescriptions(prev => prev.map(prescription => {
        if (prescription.id === prescriptionId) {
          const updatedMedications = [...prescription.medications];
          updatedMedications[medicationIndex] = {
            ...updatedMedications[medicationIndex],
            status: newStatus,
            statusUpdatedAt: new Date().toISOString()
          };
          return { ...prescription, medications: updatedMedications };
        }
        return prescription;
      }));

      const statusMessages = {
        'ready': '✅ Medicine marked as ready! Patient can collect it.',
        'sold': '💰 Medicine marked as sold! Transaction completed.'
      };
      
      alert(statusMessages[newStatus] || 'Status updated successfully!');

    } catch (error) {
      console.error('Error updating medication status:', error);
      alert('Failed to update medication status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationProcessed = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'pharmacy_notifications', notificationId), {
        status: 'processed',
        processedAt: new Date().toISOString(),
        processedBy: userDetails?.staffId
      });
      
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      alert('📋 Notification processed successfully!');
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  };

  const handleDeliveryComplete = async (taskId) => {
    try {
      await updateDoc(doc(db, 'delivery_tasks', taskId), {
        status: 'completed',
        completedAt: new Date().toISOString(),
        completedBy: userDetails?.staffId
      });
      
      setDeliveryTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
          : task
      ));
      
      alert('🚚 Emergency delivery completed successfully!');
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  const getMedicationStatusColor = (status) => {
    switch (status) {
      case 'prescribed': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ready': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'sold': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'high' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50';
  };

  if (userRole !== 'pharmacy') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">Only pharmacy staff can access this section.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">🏥 Pharmacy Manager</h2>
          <p className="text-gray-600 mt-1">Manage prescriptions, notifications, and deliveries</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'notifications', label: '🔔 Notifications', count: notifications.length },
              { id: 'prescriptions', label: '💊 Prescriptions', count: prescriptions.length },
              { id: 'deliveries', label: '🚚 Emergency Deliveries', count: deliveryTasks.filter(t => t.status !== 'completed').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} {tab.count > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">{tab.count}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading pharmacy data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📱 New Prescription Notifications</h3>
              {notifications.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No pending notifications</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div key={notification.id} className={`p-4 rounded-lg border-2 ${getPriorityColor(notification.priority)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {notification.isEmergency && <span className="text-red-600 font-bold">🚨 EMERGENCY</span>}
                          <h4 className="font-semibold text-lg">{notification.patientName}</h4>
                          <span className="text-sm text-gray-500">({notification.patientId})</span>
                        </div>
                        {notification.isEmergency && (
                          <div className="mb-2 text-red-700">
                            <p><strong>Location:</strong> {notification.location}</p>
                            <p><strong>Bed:</strong> {notification.bedNumber}</p>
                          </div>
                        )}
                        <div className="mb-2">
                          <strong>Medications:</strong>
                          <ul className="list-disc list-inside ml-4">
                            {notification.medications.map((med, index) => (
                              <li key={index} className="text-sm">{med.name} - {med.dosage} - {med.quantity}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-sm text-gray-600">
                          Received: {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationProcessed(notification.id)}
                        className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Mark Processed
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">💊 Prescription Management</h3>
              {prescriptions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No prescriptions found</p>
                </div>
              ) : (
                prescriptions.map(prescription => (
                  <div key={prescription.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{prescription.patientName}</h4>
                        <p className="text-sm text-gray-600">ID: {prescription.patientId}</p>
                        <p className="text-sm text-gray-600">Doctor: {prescription.doctorName}</p>
                        <p className="text-sm text-gray-600">Date: {new Date(prescription.createdAt).toLocaleDateString()}</p>
                      </div>
                      {prescription.isEmergency && (
                        <div className="text-red-600 font-bold">
                          🚨 EMERGENCY
                          <p className="text-sm font-normal">{prescription.location} - Bed {prescription.bedNumber}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium">Medications:</h5>
                      {prescription.medications.map((medication, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{medication.name}</p>
                            <p className="text-sm text-gray-600">
                              {medication.dosage} • {medication.quantity} • {medication.duration}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded border text-sm font-medium ${getMedicationStatusColor(medication.status || 'prescribed')}`}>
                              {medication.status || 'prescribed'}
                            </span>
                            {medication.status === 'prescribed' && (
                              <button
                                onClick={() => handleMedicationStatusUpdate(prescription.id, index, 'ready')}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                disabled={loading}
                              >
                                Mark Ready
                              </button>
                            )}
                            {medication.status === 'ready' && !prescription.isEmergency && (
                              <button
                                onClick={() => handleMedicationStatusUpdate(prescription.id, index, 'sold')}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                disabled={loading}
                              >
                                Mark Sold
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'deliveries' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🚚 Emergency Delivery Tasks</h3>
              {deliveryTasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No delivery tasks</p>
                </div>
              ) : (
                deliveryTasks.map(task => (
                  <div key={task.id} className={`p-4 rounded-lg border-2 ${
                    task.status === 'completed' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-600 font-bold">🚨 EMERGENCY DELIVERY</span>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg">{task.patientName}</h4>
                        <div className="text-red-700 mb-2">
                          <p><strong>Location:</strong> {task.location}</p>
                          <p><strong>Bed:</strong> {task.bedNumber}</p>
                        </div>
                        <div className="mb-2">
                          <strong>Medications to deliver:</strong>
                          <ul className="list-disc list-inside ml-4">
                            {task.medications.map((med, index) => (
                              <li key={index} className="text-sm">{med.name} - {med.quantity}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-sm text-gray-600">
                          Assigned: {new Date(task.assignedAt).toLocaleString()}
                        </p>
                        {task.deliveryInstructions && (
                          <p className="text-sm text-blue-600 mt-1">
                            <strong>Instructions:</strong> {task.deliveryInstructions}
                          </p>
                        )}
                      </div>
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleDeliveryComplete(task.id)}
                          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Complete Delivery
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PharmacyManager;
