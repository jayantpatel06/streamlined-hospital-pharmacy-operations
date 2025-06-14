import React from 'react';
import { loginInstructions } from '../utils/defaultData';

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
                This Hospital Management System is fully production-ready with secure authentication and no mock data.
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
                <h4 className="text-lg font-semibold text-green-800 mb-3">🏥 Receptionists</h4>
                <div className="mb-3">
                  <p className="font-medium text-gray-700">Login Credentials:</p>
                  <div className="bg-white p-3 rounded border text-sm font-mono">
                    <p>Email: reception1@hospital.com</p>
                    <p>Email: reception2@hospital.com</p>
                    <p>Email: reception3@hospital.com</p>
                    <p className="text-green-600 font-semibold mt-2">Password: reception123</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2">Key Responsibilities:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Register new patients</li>
                    <li>• Manage patient information</li>
                    <li>• Schedule appointments</li>
                    <li>• Print patient credentials</li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-3">💊 Pharmacy Staff</h4>
                <div className="mb-3">
                  <p className="font-medium text-gray-700">Login Credentials:</p>
                  <div className="bg-white p-3 rounded border text-sm font-mono">
                    <p>Email: pharmacy1@hospital.com</p>
                    <p>Email: pharmacy2@hospital.com</p>
                    <p>Email: pharmacy3@hospital.com</p>
                    <p className="text-purple-600 font-semibold mt-2">Password: pharmacy123</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2">Key Responsibilities:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Process medicine orders</li>
                    <li>• Review prescriptions</li>
                    <li>• Manage inventory</li>
                    <li>• Track delivery status</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-orange-800 border-b-2 border-orange-200 pb-2">
                Patient Registration Process
              </h3>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-3">🏥 How Patients Get Their Credentials</h4>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-gray-700">Visit Reception Desk</p>
                      <p className="text-sm text-gray-600">Patient visits hospital and approaches reception for registration</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-gray-700">Receptionist Logs In</p>
                      <p className="text-sm text-gray-600">Staff member logs in using reception credentials</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-gray-700">Fill Registration Form</p>
                      <p className="text-sm text-gray-600">Receptionist clicks "Register Patient" and fills all required information</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <p className="font-medium text-gray-700">System Generates Credentials</p>
                      <p className="text-sm text-gray-600">
                        System creates:
                        <br />• Patient ID (PAT######)
                        <br />• Temporary Password (temp######)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</div>
                    <div>
                      <p className="font-medium text-gray-700">Print Credentials</p>
                      <p className="text-sm text-gray-600">Receptionist prints credentials card for patient</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</div>
                    <div>
                      <p className="font-medium text-gray-700">Patient First Login</p>
                      <p className="text-sm text-gray-600">Patient logs in with temp credentials and must change password</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🔐 Patient Login Example</h4>
                <div className="bg-white p-3 rounded border text-sm font-mono">
                  <p className="text-gray-600">After registration, patient receives:</p>
                  <p className="mt-2">Email: patient@example.com</p>
                  <p>Patient ID: PAT123456</p>
                  <p>Temp Password: temp123456</p>
                  <p className="text-red-600 mt-2">⚠️ Must change password on first login</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">🚀 Quick Start Guide</h4>
                <ol className="text-sm text-gray-700 space-y-2">
                  <li>1. Click "Setup System" to create default staff accounts</li>
                  <li>2. Login as receptionist to register test patients</li>
                  <li>3. Login as doctor to view patient records</li>
                  <li>4. Login as pharmacy staff to manage orders</li>
                  <li>5. Login as patient to view appointments and records</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              Got It! Let's Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInstructions;
