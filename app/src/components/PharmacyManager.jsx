import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, onSnapshot, setDoc } from 'firebase/firestore';

const PharmacyManager = ({ onBack }) => {
  const [notifications, setNotifications] = useState([]);
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [isPeakHour, setIsPeakHour] = useState(false);
  const [nurseRequests, setNurseRequests] = useState([]);
  const [pharmacyWorkload, setPharmacyWorkload] = useState(0);

  const { userRole, userDetails, updateMedicationStatus, assignDeliveryTask, createNurseRequest } = useAuth();
  useEffect(() => {
    if (userRole === 'pharmacy') {
      loadPharmacyData();
      loadNurseRequests();
      checkPeakHours();
      // Check peak hours every 30 minutes
      const interval = setInterval(checkPeakHours, 30 * 60 * 1000);
      return () => clearInterval(interval);
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
      const notification = notifications.find(n => n.id === notificationId);
      
      // Check if we should request nurse assistance during peak hours
      if (isPeakHour && pharmacyWorkload > 5) {
        const needsAssistance = window.confirm(
          `🏥 Peak Hour Alert!\n\nCurrent workload: ${pharmacyWorkload} tasks\n\nWould you like to request assistance from nurses in your hospital?`
        );
        
        if (needsAssistance) {
          const assistanceRequested = await sendNotificationToNurses({
            patientId: notification.patientId,
            patientName: notification.patientName,
            medications: notification.medications,
            location: notification.location,
            bedNumber: notification.bedNumber,
            isEmergency: notification.isEmergency
          });
          
          if (assistanceRequested) {
            // Mark notification as pending assistance
            await updateDoc(doc(db, 'pharmacy_notifications', notificationId), {
              status: 'assistance_requested',
              assistanceRequestedAt: new Date().toISOString(),
              processedBy: userDetails?.staffId
            });
            
            setNotifications(prev => prev.map(notif => 
              notif.id === notificationId 
                ? { ...notif, status: 'assistance_requested' }
                : notif
            ));
            return;
          }
        }
      }
      
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

  const checkPeakHours = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Define peak hours: 8-12 AM and 2-6 PM on weekdays, 10 AM-4 PM on weekends
    const isWeekday = day >= 1 && day <= 5;
    const isPeak = isWeekday 
      ? (hour >= 8 && hour < 12) || (hour >= 14 && hour < 18)
      : (hour >= 10 && hour < 16);
    
    // Also check current workload
    const currentWorkload = notifications.filter(n => n.status === 'pending').length + 
                           deliveryTasks.filter(t => t.status === 'assigned').length;
    
    setPharmacyWorkload(currentWorkload);
    setIsPeakHour(isPeak || currentWorkload > 10); // High workload also triggers peak mode
  };

  const loadNurseRequests = async () => {
    try {
      const requestsQuery = query(
        collection(db, 'nurse_requests'),
        where('hospitalId', '==', userDetails?.hospitalId),
        where('status', 'in', ['pending', 'accepted']),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNurseRequests(requests);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading nurse requests:', error);
    }
  };

  const sendNotificationToNurses = async (notificationData) => {
    try {
      // Get all nurses from the same hospital
      const nursesQuery = query(
        collection(db, 'users'),
        where('role', '==', 'nurse'),
        where('hospitalId', '==', userDetails?.hospitalId),
        where('isActive', '==', true)
      );
      
      const nursesSnapshot = await getDocs(nursesQuery);
      const nurses = nursesSnapshot.docs.map(doc => doc.data());
      
      if (nurses.length === 0) {
        console.log('No nurses available in this hospital');
        return false;
      }

      // Create a nurse request that all nurses can see
      const requestId = `NR${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const nurseRequest = {
        requestId,
        hospitalId: userDetails?.hospitalId,
        pharmacyStaffId: userDetails?.staffId,
        pharmacyStaffName: `${userDetails?.firstName} ${userDetails?.lastName}`,
        type: notificationData.isEmergency ? 'emergency_assistance' : 'medication_assistance',
        priority: notificationData.isEmergency ? 'high' : 'medium',
        title: notificationData.isEmergency ? '🚨 Emergency Pharmacy Assistance Needed' : '💊 Pharmacy Assistance Needed',
        description: `Help needed with ${notificationData.patientName}'s medication. Location: ${notificationData.location || 'Pharmacy'}`,
        patientId: notificationData.patientId,
        patientName: notificationData.patientName,
        medications: notificationData.medications || [],
        location: notificationData.location || 'Pharmacy',
        bedNumber: notificationData.bedNumber,
        isEmergency: notificationData.isEmergency || false,
        status: 'pending',
        acceptedBy: null,
        acceptedAt: null,
        createdAt: new Date().toISOString(),
        estimatedTime: notificationData.isEmergency ? '5-10 minutes' : '10-15 minutes',
        instructions: 'Please report to pharmacy for medication assistance and support',
        nurseCount: nurses.length
      };

      await setDoc(doc(db, 'nurse_requests', requestId), nurseRequest);

      // Send individual notifications to all nurses
      const notificationPromises = nurses.map(async (nurse) => {
        const notificationId = `NURSE_NOTIF${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
        
        await setDoc(doc(db, 'nurse_notifications', notificationId), {
          nurseId: nurse.staffId,
          nurseName: `${nurse.firstName} ${nurse.lastName}`,
          requestId: requestId,
          type: 'pharmacy_assistance',
          title: nurseRequest.title,
          message: `${nurseRequest.description} - Tap to accept and help`,
          isEmergency: notificationData.isEmergency,
          priority: nurseRequest.priority,
          patientId: notificationData.patientId,
          patientName: notificationData.patientName,
          location: notificationData.location || 'Pharmacy',
          status: 'sent',
          read: false,
          createdAt: new Date().toISOString(),
          hospitalId: userDetails?.hospitalId
        });
      });

      await Promise.all(notificationPromises);
      
      alert(`📢 Assistance request sent to ${nurses.length} nurses in your hospital!`);
      return true;
    } catch (error) {
      console.error('Error sending notification to nurses:', error);
      alert('Failed to send assistance request to nurses');
      return false;
    }
  };

  const acceptNurseRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'nurse_requests', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedBy: userDetails?.staffId,
        acceptedAt: new Date().toISOString()
      });
      
      setNurseRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'accepted', acceptedBy: userDetails?.staffId }
          : req
      ));
      
      alert('✅ Nurse assistance request accepted! Please coordinate with the pharmacy staff.');
    } catch (error) {
      console.error('Error accepting nurse request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const completeNurseRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'nurse_requests', requestId);
      await updateDoc(requestRef, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      setNurseRequests(prev => prev.filter(req => req.id !== requestId));
      
      alert('🎉 Assistance task completed! Thank you for your help.');
    } catch (error) {
      console.error('Error completing nurse request:', error);
      alert('Failed to mark task as complete. Please try again.');
    }
  };

  const requestImmediateAssistance = async () => {
    try {
      const assistanceData = {
        patientId: 'GENERAL',
        patientName: 'General Pharmacy Assistance',
        medications: [],
        location: 'Pharmacy Department',
        isEmergency: true
      };
      
      const requested = await sendNotificationToNurses(assistanceData);
      if (requested) {
        alert('🚨 Emergency assistance request sent to all nurses!');
      }
    } catch (error) {
      console.error('Error requesting immediate assistance:', error);
      alert('Failed to request assistance. Please try again.');
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
          
          {/* Peak Hour Status Indicator */}
          <div className="flex items-center gap-4 mt-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPeakHour ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'
            }`}>
              {isPeakHour ? '🔥 Peak Hours Active' : '✅ Normal Hours'}
            </div>
            
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300">
              📊 Workload: {pharmacyWorkload} tasks
            </div>
            
            {isPeakHour && (
              <button
                onClick={requestImmediateAssistance}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded-full hover:bg-orange-700 transition-colors"
              >
                🚨 Request Nurse Help
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="mb-6">        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'notifications', label: '🔔 Notifications', count: notifications.length },
              { id: 'prescriptions', label: '💊 Prescriptions', count: prescriptions.length },
              { id: 'deliveries', label: '🚚 Emergency Deliveries', count: deliveryTasks.filter(t => t.status !== 'completed').length },
              { id: 'nurse_requests', label: '👩‍⚕️ Nurse Assistance', count: nurseRequests.length }
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
              ) : (                notifications.map(notification => (
                  <div key={notification.id} className={`p-4 rounded-lg border-2 ${getPriorityColor(notification.priority)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {notification.isEmergency && <span className="text-red-600 font-bold">🚨 EMERGENCY</span>}
                          <h4 className="font-semibold text-lg">{notification.patientName}</h4>
                          <span className="text-sm text-gray-500">({notification.patientId})</span>
                        </div>
                        
                        {/* Delivery Instructions */}
                        <div className="mb-3 p-2 rounded-lg bg-gray-50 border border-gray-200">
                          {notification.isEmergency ? (
                            <div className="text-red-700">
                              <p className="font-medium">🚚 BEDSIDE DELIVERY REQUIRED</p>
                              <p><strong>Location:</strong> {notification.location}</p>
                              <p><strong>Bed:</strong> {notification.bedNumber}</p>
                              <p className="text-sm">Deliver medications directly to patient's bedside</p>
                            </div>
                          ) : (
                            <div className="text-blue-700">
                              <p className="font-medium">🏥 PHARMACY PICKUP</p>
                              <p className="text-sm">Patient will collect from pharmacy counter</p>
                            </div>
                          )}
                        </div>
                        
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
                      <div className="ml-4 flex flex-col gap-2">
                        {notification.isEmergency ? (
                          <button
                            onClick={() => handleNotificationProcessed(notification.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                          >
                            🚚 Prepare for Delivery
                          </button>
                        ) : (
                          <button
                            onClick={() => handleNotificationProcessed(notification.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                          >
                            ✅ Prepare for Pickup
                          </button>
                        )}
                      </div>
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
              )}            </div>
          )}

          {activeTab === 'nurse_requests' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">👩‍⚕️ Nurse Assistance Requests</h3>
                <div className="flex gap-3">
                  <button
                    onClick={requestImmediateAssistance}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🚨 Request Emergency Help
                  </button>
                  <button
                    onClick={() => sendNotificationToNurses({
                      patientId: 'GENERAL',
                      patientName: 'General Pharmacy Support',
                      medications: [],
                      location: 'Pharmacy Department',
                      isEmergency: false
                    })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📢 Request General Help
                  </button>
                </div>
              </div>

              {isPeakHour && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-600 text-xl">🔥</span>
                    <h4 className="font-semibold text-orange-800">Peak Hours Active</h4>
                  </div>
                  <p className="text-orange-700 text-sm">
                    During peak hours, assistance requests are automatically sent to nurses when processing notifications with high workload.
                  </p>
                </div>
              )}

              {nurseRequests.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-6xl mb-4">👩‍⚕️</div>
                  <p className="text-gray-600">No active nurse assistance requests</p>
                  <p className="text-gray-500 text-sm">Requests will appear here when nurses respond to assistance calls</p>
                </div>
              ) : (
                nurseRequests.map(request => (
                  <div key={request.id} className={`p-4 rounded-lg border-2 ${
                    request.status === 'accepted' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {request.isEmergency && <span className="text-red-600 font-bold">🚨 EMERGENCY</span>}
                          <h4 className="font-semibold text-lg">{request.title}</h4>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{request.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm"><strong>Patient:</strong> {request.patientName}</p>
                            <p className="text-sm"><strong>Location:</strong> {request.location}</p>
                            {request.bedNumber && (
                              <p className="text-sm"><strong>Bed:</strong> {request.bedNumber}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm"><strong>Estimated Time:</strong> {request.estimatedTime}</p>
                            <p className="text-sm"><strong>Nurses Notified:</strong> {request.nurseCount}</p>
                            {request.acceptedBy && (
                              <p className="text-sm text-green-600"><strong>Accepted by Staff:</strong> {request.acceptedBy}</p>
                            )}
                          </div>
                        </div>

                        {request.medications && request.medications.length > 0 && (
                          <div className="mb-2">
                            <strong className="text-sm">Medications:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {request.medications.map((med, index) => (
                                <li key={index} className="text-sm">{med.name} - {med.quantity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-2">
                          <p>Requested: {new Date(request.createdAt).toLocaleString()}</p>
                          {request.acceptedAt && (
                            <p>Accepted: {new Date(request.acceptedAt).toLocaleString()}</p>
                          )}
                        </div>

                        {request.instructions && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <strong>Instructions:</strong> {request.instructions}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        {request.status === 'pending' && (
                          <div className="text-center">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-blue-600">Waiting for nurse response...</p>
                          </div>
                        )}
                        
                        {request.status === 'accepted' && userRole === 'pharmacy' && (
                          <button
                            onClick={() => completeNurseRequest(request.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            ✅ Mark Complete
                          </button>
                        )}
                      </div>
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
