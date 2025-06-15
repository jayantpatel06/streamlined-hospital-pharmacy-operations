import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';

const NurseNotificationHandler = ({ userDetails }) => {
  const [notifications, setNotifications] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (userDetails?.role === 'nurse') {
      loadNurseNotifications();
      loadAvailableRequests();
    }
  }, [userDetails]);

  const loadNurseNotifications = async () => {
    try {
      const notificationsQuery = query(
        collection(db, 'nurse_notifications'),
        where('nurseId', '==', userDetails?.staffId),
        where('status', '==', 'sent'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(notifs);
        
        // Auto-show notifications if there are new ones
        if (notifs.length > 0) {
          setShowNotifications(true);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading nurse notifications:', error);
    }
  };

  const loadAvailableRequests = async () => {
    try {
      const requestsQuery = query(
        collection(db, 'nurse_requests'),
        where('hospitalId', '==', userDetails?.hospitalId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailableRequests(requests);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading available requests:', error);
    }
  };

  const acceptAssistanceRequest = async (requestId, notificationId) => {
    try {
      // Update the main request
      const requestRef = doc(db, 'nurse_requests', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedBy: userDetails?.staffId,
        acceptedByName: `${userDetails?.firstName} ${userDetails?.lastName}`,
        acceptedAt: new Date().toISOString()
      });

      // Mark notification as read/accepted
      if (notificationId) {
        const notificationRef = doc(db, 'nurse_notifications', notificationId);
        await updateDoc(notificationRef, {
          status: 'accepted',
          read: true,
          acceptedAt: new Date().toISOString()
        });
      }

      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setAvailableRequests(prev => prev.filter(r => r.id !== requestId));
      
      alert('✅ Assistance request accepted! Please proceed to the pharmacy for coordination.');
    } catch (error) {
      console.error('Error accepting assistance request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const dismissNotification = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'nurse_notifications', notificationId);
      await updateDoc(notificationRef, {
        status: 'dismissed',
        read: true,
        dismissedAt: new Date().toISOString()
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (userDetails?.role !== 'nurse') {
    return null;
  }

  return (
    <>
      {/* Notification Bell Icon */}
      {unreadCount > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors animate-pulse"
          >
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          </button>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">🏥 Pharmacy Assistance Requests</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {notifications.length === 0 && availableRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">💊</div>
                  <p className="text-gray-600">No assistance requests at the moment</p>
                </div>
              ) : (
                <>
                  {/* Personal Notifications */}
                  {notifications.map(notification => (
                    <div key={notification.id} className={`p-4 rounded-lg border-2 ${
                      notification.isEmergency ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {notification.isEmergency && <span className="text-red-600 font-bold">🚨 EMERGENCY</span>}
                            <h4 className="font-semibold text-lg">{notification.title}</h4>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{notification.message}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <p><strong>Patient:</strong> {notification.patientName}</p>
                              <p><strong>Location:</strong> {notification.location}</p>
                            </div>
                            <div>
                              <p><strong>Priority:</strong> {notification.priority}</p>
                              <p><strong>Time:</strong> {new Date(notification.createdAt).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => acceptAssistanceRequest(notification.requestId, notification.id)}
                            className={`px-4 py-2 text-white rounded-lg transition-colors ${
                              notification.isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            ✅ Accept & Help
                          </button>
                          
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                          >
                            ❌ Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Available Requests */}
                  {availableRequests.map(request => (
                    <div key={request.id} className="p-4 rounded-lg border-2 border-purple-500 bg-purple-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {request.isEmergency && <span className="text-red-600 font-bold">🚨 EMERGENCY</span>}
                            <h4 className="font-semibold text-lg">{request.title}</h4>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">Open Request</span>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{request.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <p><strong>Patient:</strong> {request.patientName}</p>
                              <p><strong>Location:</strong> {request.location}</p>
                              <p><strong>Estimated Time:</strong> {request.estimatedTime}</p>
                            </div>
                            <div>
                              <p><strong>Requested by:</strong> {request.pharmacyStaffName}</p>
                              <p><strong>Priority:</strong> {request.priority}</p>
                              <p><strong>Posted:</strong> {new Date(request.createdAt).toLocaleTimeString()}</p>
                            </div>
                          </div>

                          {request.instructions && (
                            <div className="bg-gray-100 p-2 rounded text-sm mb-2">
                              <strong>Instructions:</strong> {request.instructions}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={() => acceptAssistanceRequest(request.id, null)}
                            className={`px-4 py-2 text-white rounded-lg transition-colors ${
                              request.isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            ✅ Accept Task
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NurseNotificationHandler;
