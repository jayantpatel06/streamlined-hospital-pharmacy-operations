import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { login, updatePatientPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      const result = await login(formData.email, formData.password);
      
      if (result.isFirstLogin) {
        setShowPasswordUpdate(true);
        setTempPassword(result.tempPassword);
      }
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    }
    
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await updatePatientPassword(newPassword);
      setShowPasswordUpdate(false);
    } catch (error) {
      setError('Failed to update password: ' + error.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  if (showPasswordUpdate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
        <form onSubmit={handlePasswordUpdate} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md backdrop-blur-sm">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">Update Your Password</h2>
          <p className="text-center text-gray-600 italic mb-6">This is your first login. Please update your password for security.</p>
          
          {error && <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg mb-4 text-center font-medium">{error}</div>}
          
          <div className="mb-4">
            <label htmlFor="tempPassword" className="block mb-2 text-gray-700 font-medium">Current Temporary Password:</label>
            <input
              type="text"
              id="tempPassword"
              value={tempPassword}
              disabled
              className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newPassword" className="block mb-2 text-gray-700 font-medium">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-gray-700 font-medium">Confirm New Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md backdrop-blur-sm">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-2">Hospital Management System</h2>
        <h3 className="text-center text-xl text-gray-600 font-normal mb-6">Login</h3>
        
        {error && <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg mb-4 text-center font-medium">{error}</div>}
        
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email address"
            className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all duration-300 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 focus:-translate-y-0.5"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold uppercase tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-6">
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
            <p className="text-blue-800 font-medium mb-1">🏥 <strong>For Hospital Staff:</strong></p>
            <p className="text-blue-700 text-sm">If you're a new staff member, please contact your hospital administrator to create your account. Staff accounts are managed by hospital admins only.</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-green-800 font-medium mb-1">👥 <strong>For Patients:</strong></p>
            <p className="text-green-700 text-sm">Your account will be created by hospital reception staff during registration. You will receive your login credentials after completing the registration process.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;