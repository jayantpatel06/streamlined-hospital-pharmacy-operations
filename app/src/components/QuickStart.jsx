import React from 'react';

const QuickStart = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">🚀 Quick Start Guide</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">🏥 Updated Hospital Management System</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 mb-2">
                <strong>Major Updates:</strong> Streamlined patient management and staff registration!
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Patients are registered once with their basic information</li>
                <li>• Emergency/planned admissions are handled separately with bed allocation</li>
                <li>• Medicine delivery is automatically determined by admission status</li>
                <li>• Staff registration removed from public access - only hospital admins can add staff</li>
                <li>• One email = one patient, multiple visits/admissions possible</li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-red-800 mb-4">🔒 Staff Registration Security Update</h3>
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-semibold text-red-800 mb-2">Important: Staff Registration Removed from Public Access</h4>
              <p className="text-red-700 text-sm mb-2">
                Hospital staff can no longer register themselves. All staff accounts must be created by hospital administrators.
              </p>
              <ul className="text-red-600 text-sm space-y-1">
                <li>• Only hospital admins can register new staff members</li>
                <li>• Staff registration available in Hospital Admin Dashboard</li>
                <li>• Ensures proper authorization and hospital association</li>
                <li>• Maintains security and prevents unauthorized access</li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-green-800 mb-4">👥 Patient Management Workflow</h3>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 mb-2">Step 1: Register Patient (One-time)</h4>
                <p className="text-green-700 text-sm mb-2">
                  Register patient with basic information - no emergency checkbox
                </p>
                <ul className="text-green-600 text-sm space-y-1">
                  <li>• Basic info: name, email, phone, DOB, address</li>
                  <li>• Medical info: blood group, allergies, medical history</li>
                  <li>• Emergency contact details</li>
                  <li>• One email = one patient profile</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-800 mb-2">Step 2: Patient Admission (When needed)</h4>
                <p className="text-orange-700 text-sm mb-2">
                  Admit registered patients for emergency or planned treatment
                </p>
                <ul className="text-orange-600 text-sm space-y-1">
                  <li>• Select admission type: Emergency, Planned, or Transfer</li>
                  <li>• Choose department and ward type</li>
                  <li>• Automatic bed allocation</li>
                  <li>• Set severity level and estimated stay</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-800 mb-2">Step 3: Treatment & Medicine Delivery</h4>
                <p className="text-purple-700 text-sm mb-2">
                  Medicine delivery automatically determined by admission status
                </p>
                <ul className="text-purple-600 text-sm space-y-1">
                  <li>• <strong>Admitted patients:</strong> Medicines delivered to bedside</li>
                  <li>• <strong>Outpatients:</strong> Collect medicines from pharmacy</li>
                  <li>• Automatic notifications to pharmacy staff</li>
                  <li>• Clear delivery instructions for each case</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-red-800 mb-4">💊 Medicine Delivery System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">🚚 Bedside Delivery</h4>
                <p className="text-red-700 text-sm mb-2"><strong>For Emergency Admissions:</strong></p>
                <ul className="text-red-600 text-sm space-y-1">
                  <li>• Medicines delivered directly to patient's bed</li>
                  <li>• Pharmacy gets ward and bed number</li>
                  <li>• High priority notifications</li>
                  <li>• Delivery tracking system</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🏪 Pharmacy Pickup</h4>
                <p className="text-blue-700 text-sm mb-2"><strong>For Outpatients:</strong></p>
                <ul className="text-blue-600 text-sm space-y-1">
                  <li>• Patient collects from pharmacy counter</li>
                  <li>• Standard preparation notifications</li>
                  <li>• Normal priority processing</li>
                  <li>• Pickup confirmation system</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">👨‍⚕️ Role-based Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">👩‍💼 Receptionist</h4>
                <ul className="text-blue-600 text-sm space-y-1">
                  <li>• Register new patients</li>
                  <li>• Admit patients to wards</li>
                  <li>• Schedule appointments</li>
                  <li>• Manage billing</li>
                </ul>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">👨‍⚕️ Doctor</h4>
                <ul className="text-green-600 text-sm space-y-1">
                  <li>• View patient records</li>
                  <li>• Create prescriptions</li>
                  <li>• Update medical records</li>
                  <li>• Admit patients</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">💊 Pharmacy</h4>
                <ul className="text-purple-600 text-sm space-y-1">
                  <li>• Process prescriptions</li>
                  <li>• Manage bedside deliveries</li>
                  <li>• Handle pharmacy pickups</li>
                  <li>• Track medicine status</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">🏥 Ward Management</h3>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <h4 className="font-semibold text-indigo-800">Emergency</h4>
                  <p className="text-sm text-indigo-600">20 beds</p>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-800">ICU</h4>
                  <p className="text-sm text-indigo-600">12 beds</p>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-800">General</h4>
                  <p className="text-sm text-indigo-600">50 beds</p>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-800">Private</h4>
                  <p className="text-sm text-indigo-600">25 rooms</p>
                </div>
              </div>
              <p className="text-indigo-700 text-sm mt-4">
                • Real-time occupancy tracking • Automatic bed allocation • Ward-specific delivery routes
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-indigo-800 mb-4">🔐 Login & Access Workflow</h3>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                <h4 className="font-semibold text-indigo-800 mb-2">For Hospital Staff</h4>
                <ul className="text-indigo-700 text-sm space-y-1">
                  <li>• Contact your hospital administrator to create your account</li>
                  <li>• Staff registration is only available to hospital admins</li>
                  <li>• Login with credentials provided by your admin</li>
                  <li>• Access is automatically configured based on your role</li>
                </ul>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                <h4 className="font-semibold text-teal-800 mb-2">For Patients</h4>
                <ul className="text-teal-700 text-sm space-y-1">
                  <li>• Your account is created during registration at hospital</li>
                  <li>• Receive temporary password from reception staff</li>
                  <li>• Update password on first login</li>
                  <li>• Access your medical records and appointments</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">For New Users:</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>1. Register a patient first</li>
                  <li>2. Try admitting them to a ward</li>
                  <li>3. Create a prescription</li>
                  <li>4. Check pharmacy notifications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• Multi-hospital support</li>
                  <li>• Role-based permissions</li>
                  <li>• Real-time notifications</li>
                  <li>• Automatic bed allocation</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
            >
              Start Using the System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStart;
