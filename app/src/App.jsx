import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FirebaseStatus from './components/FirebaseStatus';
import AdminSetup from './components/AdminSetup';
import SystemInstructions from './components/SystemInstructions';
import HospitalRegister from './components/HospitalRegister';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import HospitalAdminDashboard from './components/HospitalAdminDashboard';
import DeliveryPartnerRegister from './components/DeliveryPartnerRegister';
import DeliveryPartnerDashboard from './components/DeliveryPartnerDashboard';
import PatientPortal from './components/PatientPortal';
import PublicPatientRegister from './components/PublicPatientRegister';
import './App.css';

function AuthenticatedApp() {
  const { currentUser, userRole, logout } = useAuth();
  const [showFirebaseTest, setShowFirebaseTest] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showHospitalRegister, setShowHospitalRegister] = useState(false);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [showDeliveryPartnerRegister, setShowDeliveryPartnerRegister] = useState(false);
  const [showPatientRegister, setShowPatientRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState('default');

  if (showAdminSetup) {
    return (
      <div>
        <AdminSetup onClose={() => {
          setShowAdminSetup(false);
          setShowLogin(false);
        }} />
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div>
        <SystemInstructions onClose={() => {
          setShowInstructions(false);
          setShowLogin(false);
        }} />
      </div>
    );
  }

  if (showHospitalRegister) {
    return (
      <HospitalRegister 
        onBack={() => {
          setShowHospitalRegister(false);
          setShowLogin(false);
        }}
        onSuccess={() => {
          setShowHospitalRegister(false);
          setShowLogin(false);
        }}
      />
    );
  }

  if (showDeliveryPartnerRegister) {
    return (
      <DeliveryPartnerRegister 
        onBack={() => {
          setShowDeliveryPartnerRegister(false);
          setShowLogin(false);
        }}
        onSuccess={() => {
          setShowDeliveryPartnerRegister(false);
          setShowLogin(false);
          alert('🎉 Registration successful! Please login with your credentials.');
        }}
      />
    );
  }

  if (showPatientRegister) {
    return (
      <PublicPatientRegister 
        onBack={() => {
          setShowPatientRegister(false);
          setShowLogin(false);
        }}
        onSuccess={() => {
          setShowPatientRegister(false);
          setShowLogin(false);
          alert('🎉 Registration successful! Please login with your credentials.');
        }}
      />
    );
  }

  if (showSuperAdmin) {
    return (
      <SuperAdminDashboard 
        onLogout={() => {
          setShowSuperAdmin(false);
          setShowLogin(false);
          logout();
        }}
      />
    );
  }

  if (currentUser) {
    // Route based on user role
    if (userRole === 'patient') {
      return (
        <PatientPortal 
          onBack={logout}
        />
      );
    } else if (userRole === 'hospital_admin') {
      return (
        <HospitalAdminDashboard 
          onSwitchView={(view) => {
            if (view === 'hospital-operations') {
              setCurrentView('hospital-operations');
            }
          }}
        />
      );
    } else if (userRole === 'delivery_partner') {
      return (
        <DeliveryPartnerDashboard 
          onLogout={logout}
        />
      );
    } else if (currentView === 'hospital-operations') {
      return <Dashboard />;
    } else {
      return <Dashboard />;
    }
  }

  if (showLogin) {
    return (
      <div>
        <div className="absolute top-4 right-4 z-10 flex gap-2 flex-wrap">
          <button
            onClick={() => setShowLogin(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition duration-200 text-sm"
          >
            ← Back to Home
          </button>
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
            onClick={() => setShowPatientRegister(true)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-pink-700 transition duration-200 text-sm"
          >
            👤 Register as Patient
          </button>
          <button
            onClick={() => setShowDeliveryPartnerRegister(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition duration-200 text-sm"
          >
            🚚 Join as Delivery Partner
          </button>
          <button
            onClick={() => setShowSuperAdmin(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition duration-200 text-sm"
          >
            🌐 Super Admin
          </button>
          <button
            onClick={() => setShowAdminSetup(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-orange-700 transition duration-200 text-sm"
          >
            🚀 Setup System
          </button>
        </div>
        
        <Login />
      </div>
    );
  }

  return (
    <HomePage
      onLogin={() => setShowLogin(true)}
      onRegisterHospital={() => setShowHospitalRegister(true)}
      onRegisterPatient={() => setShowPatientRegister(true)}
      onRegisterDeliveryPartner={() => setShowDeliveryPartnerRegister(true)}
    />
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