import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const DeliveryPartnerDashboard = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [partnerData, setPartnerData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentHospital, setCurrentHospital] = useState(null);
  const [availableHospitals, setAvailableHospitals] = useState([]);
  const [deliveryTasks, setDeliveryTasks] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    averageRating: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  const { userRole, userDetails, currentUser, getHospitals } = useAuth();

  useEffect(() => {
    if (userRole === 'delivery_partner' && userDetails) {
      loadPartnerData();
      loadAvailableHospitals();
      loadDeliveryTasks();
      loadEarnings();
    }
  }, [userRole, userDetails]);

  const loadPartnerData = async () => {
    try {
      setPartnerData(userDetails);
      setIsOnline(userDetails?.isOnline || false);
      setCurrentHospital(userDetails?.currentHospital || null);
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableHospitals = async () => {
    try {
      const hospitals = await getHospitals();
      setAvailableHospitals(hospitals);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const loadDeliveryTasks = async () => {
    try {
      const tasksQuery = query(
        collection(db, 'delivery_tasks'),
        where('assignedTo', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeliveryTasks(tasks);
        
        setStats(prev => ({
          ...prev,
          pendingTasks: tasks.filter(task => task.status === 'assigned').length,
          totalDeliveries: tasks.filter(task => task.status === 'completed').length
        }));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading delivery tasks:', error);
    }
  };

  const loadEarnings = async () => {
    try {
      const earningsQuery = query(
        collection(db, 'delivery_earnings'),
        where('deliveryPartnerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const earningsSnapshot = await getDocs(earningsQuery);
      const earningsData = earningsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEarnings(earningsData);
      
      const totalEarnings = earningsData.reduce((sum, earning) => sum + earning.amount, 0);
      const totalRatings = earningsData.filter(e => e.rating).map(e => e.rating);
      const averageRating = totalRatings.length > 0 ? 
        totalRatings.reduce((sum, rating) => sum + rating, 0) / totalRatings.length : 0;
      
      setStats(prev => ({
        ...prev,
        totalEarnings,
        averageRating: Math.round(averageRating * 10) / 10
      }));
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  const handleSetOnline = async (hospitalId) => {
    try {
      setLoading(true);
      
      const partnerRef = doc(db, 'users', currentUser.uid);
      await updateDoc(partnerRef, {
        isOnline: true,
        currentHospital: hospitalId,
        lastOnline: new Date().toISOString()
      });
      
      setIsOnline(true);
      setCurrentHospital(hospitalId);
      
      alert('✅ You are now online and available for deliveries!');
    } catch (error) {
      console.error('Error setting online status:', error);
      alert('Failed to go online. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetOffline = async () => {
    try {
      setLoading(true);
      
      const partnerRef = doc(db, 'users', currentUser.uid);
      await updateDoc(partnerRef, {
        isOnline: false,
        currentHospital: null,
        lastOffline: new Date().toISOString()
      });
      
      setIsOnline(false);
      setCurrentHospital(null);
      
      alert('📴 You are now offline');
    } catch (error) {
      console.error('Error setting offline status:', error);
      alert('Failed to go offline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const acceptDeliveryTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'delivery_tasks', taskId);
      await updateDoc(taskRef, {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        acceptedBy: currentUser.uid
      });
      
      alert('✅ Delivery task accepted! Please proceed to pickup location.');
    } catch (error) {
      console.error('Error accepting task:', error);
      alert('Failed to accept task. Please try again.');
    }
  };

  const markDeliveryComplete = async (taskId) => {
    try {
      const taskRef = doc(db, 'delivery_tasks', taskId);
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      // Create earning record
      const task = deliveryTasks.find(t => t.id === taskId);
      const earning = {
        deliveryPartnerId: currentUser.uid,
        taskId: taskId,
        amount: task.isEmergency ? 100 : 60,
        hospitalId: currentHospital,
        patientId: task.patientId,
        createdAt: new Date().toISOString(),
        status: 'pending_payment'
      };
      
      await setDoc(doc(db, 'delivery_earnings', `EARN${Date.now()}`), earning);
      
      alert('🎉 Delivery completed! Earnings will be added to your account.');
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert('Failed to mark delivery as complete. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCurrentHospitalName = () => {
    if (!currentHospital) return 'None';
    const hospital = availableHospitals.find(h => h.hospitalId === currentHospital);
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading delivery partner dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold">🚚 Delivery Partner Dashboard</h1>
                <p className="text-green-100">
                  {partnerData?.firstName} {partnerData?.lastName} • {partnerData?.vehicleType}
                </p>
              </div>
              
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-green-100 text-sm">Working at</p>
                <p className="font-semibold">{getCurrentHospitalName()}</p>
              </div>
              
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Online/Offline Control */}
        {!isOnline && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🏥 Select Hospital to Go Online</h3>
            <p className="text-gray-600 mb-4">Choose a hospital to start receiving delivery requests</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableHospitals.map(hospital => (
                <div key={hospital.hospitalId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-800">{hospital.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{hospital.city}, {hospital.state}</p>
                  <p className="text-xs text-gray-500 mb-3">Beds: {hospital.bedCapacity}</p>
                  
                  <button
                    onClick={() => handleSetOnline(hospital.hospitalId)}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    🟢 Go Online Here
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOnline && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">🟢 Currently Online</h3>
                <p className="text-gray-600">Working at: {getCurrentHospitalName()}</p>
              </div>
              
              <button
                onClick={handleSetOffline}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                📴 Go Offline
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">📦 Total Deliveries</h3>
            <p className="text-3xl font-bold">{stats.totalDeliveries}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">💰 Total Earnings</h3>
            <p className="text-3xl font-bold">₹{stats.totalEarnings}</p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">⭐ Average Rating</h3>
            <p className="text-3xl font-bold">{stats.averageRating}</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">📋 Pending Tasks</h3>
            <p className="text-3xl font-bold">{stats.pendingTasks}</p>
          </div>
        </div>

        {/* Active Delivery Tasks */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🚚 Active Delivery Tasks</h3>
          
          {deliveryTasks.filter(task => task.status !== 'completed').length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <p className="text-gray-600">No active delivery tasks</p>
              <p className="text-gray-500 text-sm">
                {isOnline ? 'Tasks will appear here when available' : 'Go online to receive tasks'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveryTasks.filter(task => task.status !== 'completed').map(task => (
                <div key={task.id} className={`border rounded-lg p-4 ${
                  task.isEmergency ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {task.isEmergency && <span className="text-red-600 font-bold">🚨 EMERGENCY</span>}
                        <h4 className="font-semibold text-gray-800">Delivery to {task.patientName}</h4>
                      </div>
                      <p className="text-sm text-gray-600">Patient ID: {task.patientId}</p>
                      {task.bedNumber && (
                        <p className="text-sm text-gray-600">📍 {task.location} - Bed {task.bedNumber}</p>
                      )}
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Medications:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {task.medications.map((med, index) => (
                        <li key={index}>{med.name} - {med.quantity}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {task.deliveryInstructions && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Instructions:</p>
                      <p className="text-sm text-gray-600">{task.deliveryInstructions}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>Assigned: {new Date(task.assignedAt).toLocaleString()}</p>
                      <p className="font-medium text-green-600">
                        Earnings: ₹{task.isEmergency ? 100 : 60}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {task.status === 'assigned' && (
                        <button
                          onClick={() => acceptDeliveryTask(task.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          ✅ Accept Task
                        </button>
                      )}
                      
                      {task.status === 'accepted' && (
                        <button
                          onClick={() => markDeliveryComplete(task.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          ✅ Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Earnings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">💰 Recent Earnings</h3>
          
          {earnings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">💰</div>
              <p className="text-gray-600">No earnings yet</p>
              <p className="text-gray-500 text-sm">Complete deliveries to start earning</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {earnings.slice(0, 10).map(earning => (
                    <tr key={earning.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(earning.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{earning.patientId}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          earning.isEmergency ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {earning.isEmergency ? 'Emergency' : 'Regular'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">₹{earning.amount}</td>
                      <td className="px-4 py-3 text-sm">
                        {earning.rating ? (
                          <div className="flex items-center">
                            <span className="text-yellow-500">⭐</span>
                            <span className="ml-1">{earning.rating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not rated</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          earning.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {earning.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerDashboard;