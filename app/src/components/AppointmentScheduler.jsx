import React, { useState } from 'react';

const AppointmentScheduler = ({ onBack }) => {
  const [patientId, setPatientId] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement actual scheduling logic here, e.g., API call
    alert(
      `Appointment Scheduled:\nPatient ID: ${patientId}\nDoctor: ${doctorName}\nDepartment: ${department}\nDate: ${date}\nTime: ${time}\nType: ${type}`
    );
    // Reset form after submission
    setPatientId('');
    setDoctorName('');
    setDepartment('');
    setDate('');
    setTime('');
    setType('');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Schedule New Appointment</h2>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Back to Appointments
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        aria-label="Schedule New Appointment Form"
      >
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
            Patient ID
          </label>
          <input
            type="text"
            id="patientId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
            placeholder="Enter patient ID"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
            Doctor Name
          </label>
          <input
            type="text"
            id="doctorName"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            required
            placeholder="Enter doctor's name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            type="text"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            placeholder="Enter department"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Type
          </label>
          <input
            type="text"
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            placeholder="e.g., Regular Checkup, Follow-up"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
        >
          Schedule Appointment
        </button>
      </form>
    </div>
  );
};

export default AppointmentScheduler;

