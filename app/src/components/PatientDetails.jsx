import React from 'react';

const PatientDetails = ({ patient, onClose, onEdit, onScheduleAppointment }) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Patient Details</h2>
              <p className="text-gray-600 mt-1">Complete patient information and medical history</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full transition duration-200"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Patient Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Patient ID:</span>
                  <span className="font-semibold text-gray-800">{patient.patientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Full Name:</span>
                  <span className="font-semibold text-gray-800">{patient.firstName} {patient.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="font-semibold text-gray-800">{patient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="font-semibold text-gray-800">{patient.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Date of Birth:</span>
                  <span className="font-semibold text-gray-800">{patient.dateOfBirth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Registration Date:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(patient.registrationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-green-800 mb-4">Medical Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Blood Group:</span>
                  <span className="font-semibold text-gray-800">{patient.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Known Allergies:</span>
                  <span className="font-semibold text-gray-800">{patient.allergies || 'None reported'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Emergency Contact:</span>
                  <span className="font-semibold text-gray-800">{patient.emergencyContact}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 p-6 rounded-xl mb-6 border-l-4 border-gray-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Address</h3>
            <p className="text-gray-700">{patient.address}</p>
          </div>

          {/* Medical History */}
          <div className="bg-purple-50 p-6 rounded-xl mb-6 border-l-4 border-purple-500">
            <h3 className="text-xl font-semibold text-purple-800 mb-3">Medical History</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {patient.medicalHistory || 'No significant medical history recorded.'}
            </p>
          </div>

          {/* Recent Activity */}
          <div className="bg-orange-50 p-6 rounded-xl mb-6 border-l-4 border-orange-500">
            <h3 className="text-xl font-semibold text-orange-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">Last Appointment</h4>
                  <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600">General checkup with Dr. Smith</p>
                <p className="text-sm text-gray-500 mt-1">Status: Completed</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">Recent Prescription</h4>
                  <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600">Paracetamol 500mg - 3 times daily</p>
                <p className="text-sm text-gray-500 mt-1">Prescribed by: Dr. Smith</p>
              </div>
            </div>
          </div>          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">            <button 
              onClick={() => {
                onClose();
                if (onScheduleAppointment) {
                  onScheduleAppointment(patient);
                }
              }}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              📅 Schedule Appointment
            </button>
            <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200 font-medium">
              📝 Create Prescription
            </button>
            <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition duration-200 font-medium">
              📋 Update Medical Records
            </button>
            <button 
              onClick={onEdit}
              className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition duration-200 font-medium"
            >
              ✏️ Edit Patient Info
            </button>
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white py-2 px-8 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;