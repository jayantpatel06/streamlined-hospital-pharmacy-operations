import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { defaultStaffData, loginInstructions } from '../utils/defaultData';

const AdminSetup = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('doctor');
  
  const { registerStaff } = useAuth();

  const initializeDefaultStaff = async () => {
    setLoading(true);
    setStatus('Initializing default staff accounts...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const staff of defaultStaffData) {
      try {
        await registerStaff(staff.email, staff.password, staff);
        successCount++;
        setStatus(prev => prev + `✓ Created ${staff.role}: ${staff.firstName} ${staff.lastName} (${staff.email})\n`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        if (error.message.includes('email-already-in-use')) {
          setStatus(prev => prev + `⚠ ${staff.email} already exists\n`);
        } else {
          setStatus(prev => prev + `❌ Failed to create ${staff.email}: ${error.message}\n`);
        }
      }
    }

    setStatus(prev => prev + `\n🎉 Setup Complete!\n✓ ${successCount} accounts created successfully\n⚠ ${errorCount} accounts skipped/failed\n`);
    setLoading(false);
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Initialize Default Staff</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-800 text-sm mb-2">
                  This will create default staff accounts for testing the system:
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 5 Doctors with different specializations</li>
                  <li>• 3 Receptionists for patient management</li>
                  <li>• 3 Pharmacy staff for medicine orders</li>
                </ul>
              </div>

              <button
                onClick={initializeDefaultStaff}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 mb-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Accounts...
                  </div>
                ) : (
                  'Initialize Default Staff Accounts'
                )}
              </button>

              {status && (
                <div className="bg-gray-100 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold text-gray-800 mb-2">Setup Status:</h4>
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
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="pharmacy">Pharmacy Staff</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">{instructions.title}</h4>
                
                {instructions.credentials && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 font-medium">Credentials:</p>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                      {instructions.credentials}
                    </p>
                  </div>
                )}

                {instructions.process && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 font-medium">Registration Process:</p>
                    <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1 mt-1">
                      {instructions.process.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-700 font-medium">Available Features:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mt-1">
                    {instructions.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedRole === 'patient' && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h5 className="font-semibold text-yellow-800 mb-2">Patient Registration Process:</h5>
                  <div className="text-sm text-yellow-700 space-y-2">
                    <p><strong>Step 1:</strong> Login as receptionist</p>
                    <p><strong>Step 2:</strong> Click "Register Patient" in dashboard</p>
                    <p><strong>Step 3:</strong> Fill patient information form</p>
                    <p><strong>Step 4:</strong> System generates Patient ID and temp password</p>
                    <p><strong>Step 5:</strong> Print credentials for patient</p>
                    <p><strong>Step 6:</strong> Patient logs in and changes password</p>
                  </div>
                </div>
              )}
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