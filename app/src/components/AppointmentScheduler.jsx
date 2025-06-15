import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const AppointmentScheduler = ({ onBack, selectedPatient }) => {  const [selectedPatientData, setSelectedPatientData] = useState(selectedPatient || null);
  const [patientSearch, setPatientSearch] = useState(selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { getPatients, userRole, userDetails, createAppointmentWithBilling, getStaffForHospital } = useAuth();
  const dropdownRef = useRef(null);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];  useEffect(() => {
    loadPatients();
    
    if (userRole === 'doctor' && userDetails) {
      const doctorFullName = `${userDetails.firstName} ${userDetails.lastName}`;
      const specialization = userDetails.specialization || userDetails.department || '';
      setDoctorName(specialization ? `${doctorFullName} - ${specialization}` : doctorFullName);
    } else {
      // Load doctors for receptionist and other staff
      loadDoctors();
    }
  }, [userRole, userDetails]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await getPatients();
      setAllPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadDoctors = async () => {
    try {
      console.log("Loading doctors, hospital ID:", userDetails?.hospitalId);
      if (userDetails?.hospitalId) {
        const staff = await getStaffForHospital(userDetails.hospitalId);
        console.log("Retrieved staff:", staff);
        
        // Filter for doctors only
        const doctors = staff.filter(member => member.role === 'doctor');
        console.log("Filtered doctors:", doctors);
        
        setAvailableDoctors(doctors);
        
        // If no doctors found, show a message
        if (doctors.length === 0) {
          console.warn("No doctors found for this hospital. Please register doctors first.");
        }
      } else {
        console.warn("No hospital ID available for doctor lookup");
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      setAvailableDoctors([]);
    }
  };

  const handlePatientSearch = (searchValue) => {
    setPatientSearch(searchValue);
    setShowPatientDropdown(true);
    
    if (searchValue.trim() === '') {
      setFilteredPatients(allPatients);
      setSelectedPatientData(null);
    } else {
      const filtered = allPatients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatientData(patient);
    setPatientSearch(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatientData) {
      alert('Please select a patient');
      return;
    }
    
    if (userRole === 'receptionist' && !doctorName) {
      alert('Please select a doctor');
      return;
    }
    
    try {
      setLoading(true);
      
      // Find the selected doctor in the available doctors list
      let doctorId = '';
      let doctorFullName = doctorName;
      let departmentName = department;
        // Process doctor information
      if (doctorName.includes('-')) {
        const parts = doctorName.split('-');
        doctorFullName = parts[0].trim();        if (parts.length > 1) {
          departmentName = parts[1].trim();
        }
      }
      
      // Find the selected doctor in availableDoctors to get their ID
      const selectedDoctor = availableDoctors.find(doctor => 
        doctorName.includes(`${doctor.firstName} ${doctor.lastName}`)
      );
      
      if (selectedDoctor) {
        doctorId = selectedDoctor.staffId || selectedDoctor.id;
        // If department not set from the selection, use the doctor's department
        if (!departmentName) {
          departmentName = selectedDoctor.department || selectedDoctor.specialization;
        }
      }
        const appointmentData = {
        patientId: selectedPatientData.patientId,
        patientName: `${selectedPatientData.firstName} ${selectedPatientData.lastName}`,
        doctorId: doctorId, // Add doctor ID for reference
        doctorName: doctorFullName,
        department: departmentName,
        date: date,
        time: time,
        type: type,
        notes: notes,
        status: 'Scheduled',
        createdBy: userDetails?.uid || '',
        createdByRole: userRole,
        hospitalId: userDetails?.hospitalId
      };
        const result = await createAppointmentWithBilling(appointmentData);
      
      setSuccess(true);
      
      if (result.bill) {
        alert(`✅ Appointment scheduled successfully!\n💰 Bill created: ${result.bill.billId}\n💵 Amount: $${result.bill.totalAmount.toFixed(2)}`);
      }
      
      setTimeout(() => {
        if (!selectedPatient) { 
          setSelectedPatientData(null);
          setPatientSearch('');
        }
        if (userRole === 'receptionist') {
          setDoctorName('');
        }
        setDepartment('');
        setDate('');
        setTime('');
        setType('');
        setNotes('');
        setSuccess(false);
        setShowPatientDropdown(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const appointmentTypes = [
    'Regular Checkup',
    'Follow-up Visit',
    'Consultation',
    'Emergency',
    'Preventive Care',
    'Specialist Referral'
  ];
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Schedule New Appointment</h2>
          <p className="text-gray-600 mt-1">
            {userRole === 'doctor' 
              ? 'Schedule an appointment with your patients' 
              : 'Book an appointment for a patient'
            }
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          {userRole === 'doctor' ? 'Back to Dashboard' : 'Back to Appointments'}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Appointment scheduled successfully! The patient will be notified.
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        aria-label="Schedule New Appointment Form"
      >        {selectedPatientData && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Selected Patient</h3>
            <p className="text-gray-700">
              <strong>Name:</strong> {selectedPatientData.firstName} {selectedPatientData.lastName}
            </p>
            <p className="text-gray-700">
              <strong>Patient ID:</strong> {selectedPatientData.patientId}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {selectedPatientData.email}
            </p>
          </div>
        )}        <div className={`grid grid-cols-1 ${userRole === 'receptionist' ? 'md:grid-cols-2' : ''} gap-6`}>
          <div className="relative" ref={dropdownRef}>
            <label htmlFor="patientSearch" className="block text-sm font-medium text-gray-700 mb-1">
              Select Patient *
            </label>
            <input
              type="text"
              id="patientSearch"
              value={patientSearch}
              onChange={(e) => handlePatientSearch(e.target.value)}
              onFocus={() => setShowPatientDropdown(true)}
              required
              placeholder="Search by name, ID, or email..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {showPatientDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.patientId}
                      onClick={() => handlePatientSelect(patient)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {patient.patientId} • {patient.email}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-center">
                    No patients found
                  </div>
                )}
              </div>
            )}
          </div>

          {userRole === 'receptionist' && (
            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor *
              </label>
              <select
                id="doctorName"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"              >
                <option value="">Select a doctor</option>
                {availableDoctors.length > 0 ? (
                  availableDoctors.map((doctor) => {
                    const doctorDisplay = `Dr. ${doctor.firstName} ${doctor.lastName}${doctor.department || doctor.specialization ? ` - ${doctor.department || doctor.specialization}` : ''}`;
                    return (
                      <option key={doctor.staffId || doctor.id} value={doctorDisplay}>
                        {doctorDisplay}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No doctors registered at this hospital</option>
                )}
              </select>
            </div>
          )}

          {userRole === 'doctor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Doctor
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                {doctorName || 'Loading doctor information...'}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time *
            </label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select time</option>
              <option value="09:00">09:00 AM</option>
              <option value="09:30">09:30 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="10:30">10:30 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="11:30">11:30 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="14:30">02:30 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="15:30">03:30 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="16:30">04:30 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Type *
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select appointment type</option>
            {appointmentTypes.map((appointmentType, index) => (
              <option key={index} value={appointmentType}>{appointmentType}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            placeholder="Any additional information or special requirements"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Scheduling...
              </div>
            ) : (
              'Schedule Appointment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentScheduler;

