import React from 'react';

const SystemInstructions = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">🏥 Hospital Management System - Production Guide</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-semibold text-green-800 mb-4">✅ Production-Ready System</h3>
              <p className="text-green-700 mb-4">
                This Hospital Management System is fully production-ready with secure authentication and real-time operations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">🔒 Security Features:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• No default/mock credentials</li>
                    <li>• Secure role-based access control</li>
                    <li>• Hospital data isolation</li>
                    <li>• Real-time session management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">🚀 Core Features:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Multi-hospital network support</li>
                    <li>• Real-time pharmacy operations</li>
                    <li>• Emergency patient prioritization</li>
                    <li>• Automatic delivery routing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-blue-800 border-b-2 border-blue-200 pb-2">
                🏥 Getting Started
              </h3>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">1️⃣ Hospital Registration</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p><strong>Step 1:</strong> Click "🏥 Register Hospital" button</p>
                  <p><strong>Step 2:</strong> Complete 3-step wizard:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Hospital Information (name, address, type, capacity)</li>
                    <li>Department Selection and Services</li>
                    <li>Administrator Account Creation</li>
                  </ul>
                  <p><strong>Step 3:</strong> Hospital admin account is created automatically</p>
                  <p><strong>Step 4:</strong> Login with provided admin credentials</p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-3">2️⃣ Staff Management</h4>
                <div className="text-sm text-purple-700 space-y-2">
                  <p><strong>Hospital Admin responsibilities:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Register all hospital staff (doctors, nurses, receptionists, pharmacy)</li>
                    <li>Assign roles and departments</li>
                    <li>Manage hospital settings and configurations</li>
                    <li>Monitor hospital operations and analytics</li>
                  </ul>
                  <div className="bg-white p-2 rounded border mt-2">
                    <p className="text-xs text-purple-600">
                      <strong>Access:</strong> Hospital Admin Dashboard → Staff Management → Add New Staff
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-3">3️⃣ Patient Operations</h4>
                <div className="text-sm text-orange-700 space-y-2">
                  <p><strong>Reception Staff workflow:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Register new patients with basic information</li>
                    <li>Admit patients for emergency or planned care</li>
                    <li>Allocate beds and assign wards</li>
                    <li>Generate secure patient credentials</li>
                  </ul>
                  <div className="bg-white p-2 rounded border mt-2">
                    <p className="text-xs text-orange-600">
                      <strong>Workflow:</strong> Patient Register → Patient Admission → Bed Allocation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-red-800 border-b-2 border-red-200 pb-2">
                🚀 Pharmacy Operations
              </h3>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="text-lg font-semibold text-red-800 mb-3">💊 Digital Prescription Workflow</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-gray-700">Doctor Creates Prescription</p>
                      <p className="text-sm text-gray-600">Digital prescription with automatic pharmacy notification</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-gray-700">Pharmacy Receives Alert</p>
                      <p className="text-sm text-gray-600">Real-time notification with priority queuing</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-gray-700">Delivery Routing</p>
                      <p className="text-sm text-gray-600">
                        <strong>Emergency Patients:</strong> Bedside delivery<br />
                        <strong>Regular Patients:</strong> Pharmacy pickup
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <h4 className="text-lg font-semibold text-teal-800 mb-3">🎯 Key Advantages</h4>
                <ul className="text-sm text-teal-700 space-y-1">
                  <li>• <strong>Zero Manual Communication:</strong> 100% automated workflow</li>
                  <li>• <strong>Emergency Priority:</strong> Automatic detection and prioritization</li>
                  <li>• <strong>Real-Time Tracking:</strong> Live status updates for all stakeholders</li>
                  <li>• <strong>Scalable Network:</strong> Unlimited hospitals with data isolation</li>
                  <li>• <strong>Secure Access:</strong> Role-based permissions and authentication</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-800 mb-3">⚡ System Performance</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-yellow-800">Prescription Processing:</p>
                    <p className="text-yellow-700">Under 2 minutes</p>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">Emergency Delivery:</p>
                    <p className="text-yellow-700">15-30 minutes</p>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">Notification Speed:</p>
                    <p className="text-yellow-700">Real-time (&lt; 10s)</p>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">System Uptime:</p>
                    <p className="text-yellow-700">99.9% availability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">📞 Support & Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">🏥 Hospital Admins:</p>
                  <p className="text-gray-600">Access hospital management dashboard for staff registration and operations</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">👨‍⚕️ Hospital Staff:</p>
                  <p className="text-gray-600">Contact your hospital administrator for account creation and access</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">👥 Patients:</p>
                  <p className="text-gray-600">Visit reception desk for registration and credential generation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInstructions;
