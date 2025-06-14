import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginInstructions, systemRoles } from '../src/utils/defaultData.js';

const AdminSetup = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('hospital_admin');
  
  const { registerStaff } = useAuth();

  const displaySystemInfo = () => {
    setStatus(`🏥 Hospital Management System - Production Ready

📋 System Overview:
✅ Multi-hospital network support
✅ Real-time pharmacy operations
✅ Emergency patient prioritization  
✅ Automatic bed allocation
✅ Secure role-based access

👥 User Roles Available:
${Object.entries(systemRoles).map(([key, role]) => 
  `• ${role.name}: ${role.description}`
).join('\n')}

🚀 Getting Started:
1. Register your hospital using "🏥 Register Hospital"
2. Hospital admin account is created automatically
3. Hospital admin can register all staff members
4. Staff receives secure login credentials
5. Patients are registered by reception staff

🔒 Security Features:
• No default/mock credentials in production
• Secure password generation for patients
• Role-based access control
• Hospital data isolation
• Real-time session management

📞 Support:
For technical support, contact your system administrator.
All user accounts are created through proper registration flows.`);
  };

  const instructions = loginInstructions[selectedRole];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Hospital Management System Setup</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🏥 Production System Information</h3>
              
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-green-800 text-sm mb-2">
                  ✅ System is production-ready with secure authentication:
                </p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• No mock/default credentials</li>
                  <li>• Secure role-based access control</li>
                  <li>• Real-time hospital operations</li>
                  <li>• Multi-hospital network support</li>
                </ul>
              </div>

              <button
                onClick={displaySystemInfo}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 mb-4"
              >
                📋 View System Information
              </button>

              {status && (
                <div className="bg-gray-100 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold text-gray-800 mb-2">System Information:</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {status}
                  </pre>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Login Instructions</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role:</label>
                <select
                  value={selectedRole}                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="hospital_admin">Hospital Administrator</option>
                  <option value="staff">Hospital Staff</option>
                  <option value="patient">Patient</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">{instructions.title}</h4>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-700 font-medium">Description:</p>
                  <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                    {instructions.description}
                  </p>
                </div>

                {instructions.process && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 font-medium">Access Process:</p>
                    <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1 mt-1">
                      {instructions.process.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {instructions.features && (
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Available Features:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mt-1">
                      {instructions.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {instructions.roles && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 font-medium">Staff Roles & Features:</p>
                    {Object.entries(instructions.roles).map(([role, features]) => (
                      <div key={role} className="mt-2 bg-white p-2 rounded border">
                        <p className="text-sm font-medium text-gray-800 capitalize">{role}:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 mt-1">
                          {features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {instructions.access && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 font-medium">Access Information:</p>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                      {instructions.access}
                    </p>
                  </div>
                )}              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🔒 Production Security:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• No default/mock credentials in production system</li>
                <li>• All accounts created through secure registration processes</li>
                <li>• Hospital data isolation and role-based access control</li>
                <li>• Real-time session management and audit logging</li>
                <li>• Secure password generation for all user types</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
