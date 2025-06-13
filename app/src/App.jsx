import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import StaffRegister from './components/StaffRegister';
import Dashboard from './components/Dashboard';
import FirebaseStatus from './components/FirebaseStatus';
import AdminSetup from './components/AdminSetup';
import SystemInstructions from './components/SystemInstructions';
import './App.css';

function AuthenticatedApp() {
  const { currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showFirebaseTest, setShowFirebaseTest] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (showAdminSetup) {
    return (
      <div>
        <AdminSetup onClose={() => setShowAdminSetup(false)} />
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div>
        <SystemInstructions onClose={() => setShowInstructions(false)} />
      </div>
    );
  }

  if (currentUser) {
    return <Dashboard />;
  }

  return (
    <div>
      <div className="absolute top-4 right-4 z-10 flex gap-2 flex-wrap">
        <button
          onClick={() => setShowInstructions(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-200 text-sm"
        >
          📖 User Guide
        </button>
        <button
          onClick={() => setShowAdminSetup(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition duration-200 text-sm"
        >
          🚀 Setup System
        </button>
      </div>
      
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <StaffRegister onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
