import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DeliveryPartnerRegister = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    licenseNumber: '',
    aadharNumber: '',
    emergencyContact: '',
    workingHours: 'flexible',
    preferredAreas: '',
    experience: '',
    bankAccountNumber: '',
    bankIFSC: '',
    panNumber: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { registerDeliveryPartner } = useAuth();

  const vehicleTypes = [
    { value: 'bike', label: '🏍️ Motorcycle', description: 'Fast delivery for medicines' },
    { value: 'scooter', label: '🛵 Scooter', description: 'Efficient city delivery' },
    { value: 'bicycle', label: '🚲 Bicycle', description: 'Eco-friendly short distance' },
    { value: 'car', label: '🚗 Car', description: 'Large orders and equipment' },
    { value: 'van', label: '🚐 Van', description: 'Bulk medical supplies' }
  ];

  const workingHourOptions = [
    { value: 'flexible', label: '⏰ Flexible Hours', description: 'Available when online' },
    { value: 'morning', label: '🌅 Morning Shift', description: '6 AM - 2 PM' },
    { value: 'afternoon', label: '☀️ Afternoon Shift', description: '2 PM - 10 PM' },
    { value: 'night', label: '🌙 Night Shift', description: '10 PM - 6 AM' },
    { value: 'full_time', label: '🕐 Full Time', description: '24/7 availability' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.phoneNumber) {
      setError('Please fill all required personal information fields');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.vehicleType || !formData.vehicleNumber || !formData.licenseNumber) {
      setError('Please fill all required vehicle and work information');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.bankAccountNumber || !formData.bankIFSC) {
      setError('Bank details are required for payment processing');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    try {
      setLoading(true);
      setError('');
      
      const result = await registerDeliveryPartner(formData);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (error) {
      console.error('Error registering delivery partner:', error);
      setError(error.message || 'Failed to register delivery partner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">👤 Personal Information</h3>
        <p className="text-gray-600 mt-2">Join our delivery network and earn money helping hospitals</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your first name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email address"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your phone number"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Create a password"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm your password"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your complete address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your city"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your state"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ZIP Code"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">🚴 Vehicle & Work Information</h3>
        <p className="text-gray-600 mt-2">Tell us about your vehicle and availability</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Vehicle Type *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vehicleTypes.map(vehicle => (
            <label key={vehicle.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="vehicleType"
                value={vehicle.value}
                checked={formData.vehicleType === vehicle.value}
                onChange={handleChange}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-800">{vehicle.label}</div>
                <div className="text-sm text-gray-600">{vehicle.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., MH01AB1234"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Driving License Number *</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter license number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
          <input
            type="text"
            name="aadharNumber"
            value={formData.aadharNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Aadhar number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
          <input
            type="tel"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Emergency contact number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Working Hours</label>
        <div className="space-y-2">
          {workingHourOptions.map(option => (
            <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="workingHours"
                value={option.value}
                checked={formData.workingHours === option.value}
                onChange={handleChange}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-800">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Areas</label>
        <textarea
          name="preferredAreas"
          value={formData.preferredAreas}
          onChange={handleChange}
          rows="2"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Areas you prefer to work in (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Experience</label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows="3"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about your delivery experience (optional)"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">💰 Payment Information</h3>
        <p className="text-gray-600 mt-2">Bank details for receiving payments</p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
        <h4 className="font-semibold text-green-800 mb-2">💵 Earning Information</h4>
        <ul className="text-green-700 text-sm space-y-1">
          <li>• Emergency deliveries: ₹50-150 per delivery</li>
          <li>• Regular deliveries: ₹30-80 per delivery</li>
          <li>• Ratings bonus: Extra ₹10-20 for 5-star ratings</li>
          <li>• Distance-based payments</li>
          <li>• Weekly payment settlements</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number *</label>
          <input
            type="text"
            name="bankAccountNumber"
            value={formData.bankAccountNumber}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter account number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank IFSC Code *</label>
          <input
            type="text"
            name="bankIFSC"
            value={formData.bankIFSC}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., SBIN0001234"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
        <input
          type="text"
          name="panNumber"
          value={formData.panNumber}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter PAN number"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">📋 Terms & Conditions</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• You can work with only one hospital at a time</li>
          <li>• You can switch hospitals anytime when offline</li>
          <li>• Emergency deliveries have priority and higher pay</li>
          <li>• Maintain professional behavior with hospital staff</li>
          <li>• Handle medical supplies with care</li>
          <li>• You can work for free or set your rates (where applicable)</li>
        </ul>
        <label className="flex items-center mt-3">
          <input type="checkbox" required className="mr-2" />
          <span className="text-sm text-blue-800">I agree to the terms and conditions</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">🚚 Delivery Partner Registration</h2>
              <p className="text-green-100 mt-1">Join our network and start earning money</p>
            </div>
            <button
              onClick={handleBack}
              className="text-green-200 hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-4 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-green-600' : 'bg-green-400 text-white'}`}>
              1
            </div>
            <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-white' : 'bg-green-400'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-green-600' : 'bg-green-400 text-white'}`}>
              2
            </div>
            <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-white' : 'bg-green-400'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-white text-green-600' : 'bg-green-400 text-white'}`}>
              3
            </div>
          </div>
          
          <div className="mt-2 text-green-100 text-sm">
            Step {step} of 3: {step === 1 ? 'Personal Information' : step === 2 ? 'Vehicle & Work Info' : 'Payment Details'}
          </div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {step === 1 ? 'Cancel' : '← Previous'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {step === 3 ? 'Registering...' : 'Processing...'}
                </div>
              ) : (
                step === 3 ? '🎉 Complete Registration' : 'Next Step →'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryPartnerRegister;