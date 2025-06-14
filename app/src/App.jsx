import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FirebaseStatus from './components/FirebaseStatus';
import AdminSetup from './components/AdminSetup';
import SystemInstructions from './components/SystemInstructions';
import HospitalRegister from './components/HospitalRegister';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import HospitalAdminDashboard from './components/HospitalAdminDashboard';
import './App.css';

function AuthenticatedApp() {
  const { currentUser, userRole, logout } = useAuth();
  const [showFirebaseTest, setShowFirebaseTest] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showHospitalRegister, setShowHospitalRegister] = useState(false);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [currentView, setCurrentView] = useState('default');

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

  if (showHospitalRegister) {
    return (
      <HospitalRegister 
        onBack={() => setShowHospitalRegister(false)}
        onSuccess={() => {
          setShowHospitalRegister(false);
        }}
      />
    );
  }

  if (showSuperAdmin) {
    return (
      <SuperAdminDashboard 
        onLogout={() => {
          setShowSuperAdmin(false);
          logout();
        }}
      />
    );
  }

  if (currentUser) {
    // Route based on user role
    if (userRole === 'hospital_admin') {
      return (
        <HospitalAdminDashboard 
          onSwitchView={(view) => {
            if (view === 'hospital-operations') {
              setCurrentView('hospital-operations');
            }
          }}
        />
      );
    } else if (currentView === 'hospital-operations') {
      return <Dashboard />;
    } else {
      return <Dashboard />;
    }
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
          onClick={() => setShowHospitalRegister(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 text-sm"
        >
          🏥 Register Hospital
        </button>
        <button
          onClick={() => setShowSuperAdmin(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition duration-200 text-sm"
        >
          🌐 Super Admin
        </button>
        <button
          onClick={() => setShowAdminSetup(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition duration-200 text-sm"
        >
          🚀 Setup System
        </button>
      </div>
      
      <Login />
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
