import React, { useState } from 'react';
import './App.css';
import LandingPage from './LandingPage';
import ApplyPage from './ApplyPage';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'apply'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userUser, setUserUser] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false); // New state for modal

  // Global Toggle Theme
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Global Navigation Helper
  const navigateTo = (view) => setCurrentView(view);

  // Handle Login Logic (Simulated)
  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    setUserUser(username);
    setShowAuthModal(false); // Close modal on success
    setCurrentView('landing');
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserUser('');
    alert("Logged out successfully.");
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      
      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigateTo('landing')}>
          <span className="logo-icon">C</span> YES LOANS
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#service">Service ▾</a>
          <a href="#contact">Contact Us</a>
        </div>

        <div className="nav-actions">
          <button className="theme-btn" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {isLoggedIn ? (
            <div className="user-info">
              <span>Hello, <b>{userUser}</b></span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            // Updated Button Text and onClick handler
            <button className="nav-btn" onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          )}
        </div>
      </nav>

      {/* --- PAGE CONTENT RENDERING --- */}
      <div className="main-content">
        {currentView === 'landing' && (
          <LandingPage onApplyClick={() => navigateTo('apply')} />
        )}

        {currentView === 'apply' && (
          <ApplyPage onApplySuccess={handleLoginSuccess} />
        )}
      </div>

      {/* --- AUTH MODAL --- */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="auth-modal">
            <button className="close-modal" onClick={() => setShowAuthModal(false)}>×</button>
            
            {/* Left Partition: Login */}
            <div className="auth-partition login-partition">
              <h2>Log in</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleLoginSuccess('DemoUser'); }}>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" required />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" required />
                </div>
                <button className="action-btn submit-btn">Log in</button>
              </form>
              <div className="social-login">
                <p>Or Login with</p>
                <button className="social-btn facebook">Facebook</button>
                <button className="social-btn google">Google</button>
              </div>
            </div>

            {/* Right Partition: Sign Up */}
            <div className="auth-partition signup-partition">
              <h2>Sign up</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleLoginSuccess('NewUser'); }}>
                <div className="input-group">
                  <label>Username</label>
                  <input type="text" placeholder="Choose a username" required />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" required />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="Create a password" required />
                </div>
                <button className="action-btn submit-btn">Sign up</button>
              </form>
              <div className="social-login">
                <p>Or Sign up with</p>
                <button className="social-btn facebook">Facebook</button>
                <button className="social-btn google">Google</button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="footer">
        <p>&copy; 2025 YesLoans. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default App;