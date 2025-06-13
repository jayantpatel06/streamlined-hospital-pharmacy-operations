import React from 'react';

const PatientCredentials = ({ patientData, onClose, onPrint, onScheduleAppointment }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('patient-credentials-print');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Credentials - ${patientData.patientId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #3B82F6; 
              padding-bottom: 15px;
            }
            .credentials-box { 
              border: 2px solid #3B82F6; 
              padding: 20px; 
              border-radius: 8px; 
              background: #F8FAFC;
            }
            .credential-item { 
              margin: 10px 0; 
              padding: 8px 0; 
              border-bottom: 1px dotted #CBD5E1;
            }
            .label { 
              font-weight: bold; 
              color: #1E40AF;
            }
            .important { 
              background: #FEF3C7; 
              padding: 15px; 
              border-radius: 6px; 
              margin-top: 20px; 
              border-left: 4px solid #F59E0B;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    
    if (onPrint) onPrint();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Patient Credentials</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div id="patient-credentials-print">
            <div className="header">
              <h2 style={{color: '#1E40AF', margin: '0 0 10px 0'}}>Hospital Management System</h2>
              <h3 style={{color: '#374151', margin: '0'}}>Patient Login Credentials</h3>
            </div>
            
            <div className="credentials-box">
              <div className="credential-item">
                <span className="label">Patient Name:</span> {patientData.firstName} {patientData.lastName}
              </div>
              <div className="credential-item">
                <span className="label">Patient ID:</span> {patientData.patientId}
              </div>
              <div className="credential-item">
                <span className="label">Email:</span> {patientData.email}
              </div>
              <div className="credential-item">
                <span className="label">Temporary Password:</span> {patientData.tempPassword}
              </div>
              <div className="credential-item">
                <span className="label">Registration Date:</span> {new Date().toLocaleDateString()}
              </div>
              
              <div className="important">
                <strong>Important Instructions:</strong>
                <ul style={{margin: '10px 0', paddingLeft: '20px'}}>
                  <li>Use the above credentials to log into the patient portal</li>
                  <li>You will be required to change your password on first login</li>
                  <li>Keep these credentials secure and confidential</li>
                  <li>Contact reception if you forget your new password</li>
                </ul>
              </div>
            </div>
          </div>
            <div className="flex gap-3 mt-6 no-print">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              🖨️ Print
            </button>
            {onScheduleAppointment && (
              <button
                onClick={onScheduleAppointment}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
              >
                📅 Schedule Appointment
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCredentials;