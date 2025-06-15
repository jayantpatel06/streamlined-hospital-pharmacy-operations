import React, { useState } from 'react';

const HomePage = ({ onLogin, onRegisterHospital, onRegisterPatient, onRegisterDeliveryPartner }) => {
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💊</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                PharmaFlow
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === 'features' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === 'pricing' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : ''
                }`}
              >
                About
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onLogin}
                className="text-blue-600 hover:text-blue-700 px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onRegisterHospital}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Streamline Your
                <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  {" "}Hospital Pharmacy
                </span>
                {" "}Operations
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Enhance efficiency and accuracy with our comprehensive hospital management system. 
                Integrate inventory management, prescription processing, and medication dispensing 
                in one powerful platform.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onRegisterHospital}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
                >
                  Learn More
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  HIPAA Compliant
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  24/7 Support
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  99.9% Uptime
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-1 transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-t-lg"></div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">🏥</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Hospital Management</h3>
                      <p className="text-gray-600 text-sm">Complete administrative control</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">💊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Pharmacy Operations</h3>
                      <p className="text-gray-600 text-sm">Streamlined medication management</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-xl">👩‍⚕️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Patient Care</h3>
                      <p className="text-gray-600 text-sm">Enhanced patient experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your hospital's pharmacy operations efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Inventory Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time tracking of medication stock levels, expiration dates, and automated reorder alerts 
                to prevent stockouts and reduce waste.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Prescription Processing</h3>
              <p className="text-gray-600 leading-relaxed">
                Automated prescription verification, drug interaction checks, and precise dosage calculations 
                to ensure patient safety.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivery Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrated delivery partner system with real-time tracking and automated dispatch 
                for efficient medication delivery.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Portal</h3>
              <p className="text-gray-600 leading-relaxed">
                Self-service patient registration, appointment booking, and prescription ordering 
                with integrated payment processing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-teal-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Reporting</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive reporting dashboard with real-time analytics, billing management, 
                and performance metrics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Compliance</h3>
              <p className="text-gray-600 leading-relaxed">
                HIPAA-compliant security measures, role-based access control, and comprehensive 
                audit trails for regulatory compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that best fits your hospital's needs. All plans include 24/7 support and regular updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <p className="text-gray-600 mb-6">Perfect for small clinics</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">₹4,999</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Up to 50 patients</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Basic inventory management</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Prescription processing</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">5 staff accounts</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Email support</span>
                </div>
              </div>

              <button
                onClick={onRegisterHospital}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Start Free Trial
              </button>
            </div>

            {/* Professional Plan - Most Popular */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-blue-500 relative hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-6">Ideal for medium hospitals</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-blue-600">₹12,999</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Up to 500 patients</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Advanced inventory management</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Full prescription processing</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Delivery management</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Patient portal</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">20 staff accounts</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">24/7 phone support</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Analytics dashboard</span>
                </div>
              </div>

              <button
                onClick={onRegisterHospital}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-6">For large hospital networks</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">Custom</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Unlimited patients</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Multi-location support</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Custom integrations</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Advanced analytics</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Unlimited staff accounts</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Dedicated support manager</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">On-premise deployment</span>
                </div>
              </div>

              <button
                onClick={onRegisterHospital}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* Pricing Features */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-8">All plans include:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-xl">🔒</span>
                </div>
                <p className="text-sm text-gray-700">HIPAA Compliance</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-xl">☁️</span>
                </div>
                <p className="text-sm text-gray-700">Cloud Storage</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 text-xl">🔄</span>
                </div>
                <p className="text-sm text-gray-700">Regular Updates</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 text-xl">📞</span>
                </div>
                <p className="text-sm text-gray-700">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About PharmaFlow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing hospital pharmacy operations with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Our Mission
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                PharmaFlow is dedicated to transforming healthcare delivery by streamlining hospital 
                pharmacy operations. Our comprehensive platform reduces medication errors, improves 
                inventory management, and enhances patient safety through innovative technology solutions.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                We believe that efficient pharmacy operations are crucial for quality healthcare. 
                Our system integrates seamlessly with existing hospital workflows, providing 
                real-time insights and automation that saves time and reduces costs.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">5+</span>
                  </div>
                  <span className="text-gray-700">Years of healthcare technology experience</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">100+</span>
                  </div>
                  <span className="text-gray-700">Healthcare facilities served</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">99.9%</span>
                  </div>
                  <span className="text-gray-700">System uptime guarantee</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Value Proposition Cards */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Efficiency First</h4>
                <p className="text-gray-600">
                  Automate routine tasks and streamline workflows to reduce administrative burden 
                  and focus on patient care.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Patient Safety</h4>
                <p className="text-gray-600">
                  Advanced drug interaction checks and prescription verification systems 
                  to prevent medication errors.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Data-Driven Insights</h4>
                <p className="text-gray-600">
                  Comprehensive analytics and reporting to optimize inventory, 
                  reduce costs, and improve operational efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hospital Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of healthcare facilities already using PharmaFlow to improve 
            their pharmacy operations and patient care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onRegisterHospital}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold shadow-lg"
            >
              Start Free 30-Day Trial
            </button>
            <button
              onClick={onRegisterPatient}
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-lg font-semibold"
            >
              Register as Patient
            </button>
          </div>

          <p className="text-blue-100 mt-6 text-sm">
            No credit card required • Full access to all features • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">💊</span>
                </div>
                <span className="text-2xl font-bold">PharmaFlow</span>
              </div>
              <p className="text-gray-400">
                Streamlining hospital pharmacy operations with innovative technology solutions.
              </p>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-white transition-colors">📧</button>
                <button className="text-gray-400 hover:text-white transition-colors">📱</button>
                <button className="text-gray-400 hover:text-white transition-colors">🐦</button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('features')} className="block text-gray-400 hover:text-white transition-colors">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="block text-gray-400 hover:text-white transition-colors">Pricing</button>
                <button onClick={onLogin} className="block text-gray-400 hover:text-white transition-colors">Sign In</button>
                <button onClick={onRegisterHospital} className="block text-gray-400 hover:text-white transition-colors">Get Started</button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <div className="space-y-2">
                <p className="text-gray-400">Hospital Management</p>
                <p className="text-gray-400">Pharmacy Operations</p>
                <p className="text-gray-400">Patient Portal</p>
                <p className="text-gray-400">Delivery Management</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>📧 support@pharmaflow.com</p>
                <p>📞 +91 98765 43210</p>
                <p>📍 Mumbai, Maharashtra, India</p>
                <p>⏰ 24/7 Support Available</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 PharmaFlow. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">HIPAA Compliance</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
