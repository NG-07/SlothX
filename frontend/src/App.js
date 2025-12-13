import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; 
import LandingPage from './LandingPage';
import ApplyPage from './ApplyPage';
import DashboardPage from './DashboardPage';
import logo_image from './assets/logo.jpg';

const GOOGLE_CLIENT_ID = "263303907123-gmok720j1p9tqia0l5ff1d5nep5d3qq9.apps.googleusercontent.com";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); 
  const [editingLoan, setEditingLoan] = useState(null);
  const [userUserEmail, setUserUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userUser, setUserUser] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const navigateTo = (view) => setCurrentView(view);

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });

  const handleAxiosLogin = async (e) => {
      e.preventDefault();
      try {
        const res = await axios.post('http://localhost:5000/api/login', loginData);
        if (res.status === 200) {
          // 👇 FIXED: Pass 'res.data.email' too
          completeLogin(res.data.name, res.data.email);
        }
      } catch (err) { alert(err.response?.data?.message || "Login Failed"); }
  };

  const handleAxiosSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/signup', {
        name: signupData.username, email: signupData.email, password: signupData.password
      });
      if (res.status === 201) { alert("Signup Success! Please Login."); }
    } catch (err) { alert(err.response?.data?.message || "Signup Failed"); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
      try {
        const res = await axios.post('http://localhost:5000/api/google-login', {
          token: credentialResponse.credential
        });
        // 👇 FIXED: Pass 'res.data.email' too
        completeLogin(res.data.name, res.data.email);
      } catch (err) {
      console.error("Google Login Failed", err);
      alert("Google Login Failed");
    }
  };

  const completeLogin = (name, email) => {
    setUserUserEmail(email);
    alert(`Welcome, ${name}!`);
    setIsLoggedIn(true);
    setUserUser(name);
    setShowAuthModal(false);
    setLoginData({ email: '', password: '' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setUserUser(''); alert("Logged out.");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        
        {/* NAVBAR */}
        <nav className="navbar">
          {/* In App.js inside <nav> */}
          {isLoggedIn && (
            <button className="dashboard-link-btn" onClick={() => navigateTo('dashboard')}>
              Dashboard
            </button>
          )}
          {/* UPDATED LOGO */}
          <div className="logo" onClick={() => navigateTo('landing')}>
              {/* Updates the text to an image */}
              <img src={logo_image} alt="SlothX Logo" className="navbar-logo-img" /> 
              <span>SlothX</span>
          </div>
          
          <div className="nav-links">
            <a href="#home">Home</a><a href="#about">About</a><a href="#team">Team</a>
          </div>
          
          <div className="nav-actions">
            <button className="theme-btn" onClick={toggleTheme}>{isDarkMode ? '☀️' : '🌙'}</button>
            {isLoggedIn ? (
              <div className="user-info"><span>Hi, <b>{userUser}</b></span><button className="logout-btn" onClick={handleLogout}>Logout</button></div>
            ) : (
              <button className="nav-btn" onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
            )}
          </div>
        </nav>

        {/* CONTENT */}
        <div className="main-content">
    
          {/* LANDING */}
          {currentView === 'landing' && <LandingPage onApplyClick={() => {
              setEditingLoan(null); // Clear edit data for new loan
              navigateTo('apply');
          }} />}

          {/* DASHBOARD (Pass email and edit handler) */}
          {currentView === 'dashboard' && (
              <DashboardPage 
                  userEmail={userUserEmail} // You need to store logged-in email, not just name!
                  onEdit={(loan) => {
                      setEditingLoan(loan); // Save loan data
                      navigateTo('apply');  // Go to form
                  }}
              />
          )}

          {/* APPLY PAGE (Accepts initialData) */}
          {currentView === 'apply' && (
              <ApplyPage 
                  initialData={editingLoan} // Pass the data to edit
                  onApplySuccess={() => {
                      setEditingLoan(null);
                      navigateTo('dashboard'); // Go back to dashboard after save
                  }} 
              />
          )}
      </div>

        {/* AUTH MODAL */}
        {showAuthModal && (
          <div className="modal-overlay">
            <div className="auth-modal">
              <button className="close-modal" onClick={() => setShowAuthModal(false)}>×</button>
              
              {/* LEFT: LOGIN */}
              <div className="auth-partition login-partition">
                <h2>Log in</h2>
                
                {/* 1. Google Button */}
                <div className="google-btn-wrapper">
                    <GoogleLogin 
                        onSuccess={handleGoogleSuccess} 
                        onError={() => console.log('Login Failed')}
                        theme={isDarkMode ? 'filled_black' : 'outline'}
                        shape="pill"
                        text="signin_with"
                        width="100%"
                    />
                </div>

                <div className="divider"><span>OR</span></div>

                {/* 2. Standard Form */}
                <form onSubmit={handleAxiosLogin}>
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="john@example.com" value={loginData.email} onChange={handleLoginChange} required />
                  </div>
                  <div className="input-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="********" value={loginData.password} onChange={handleLoginChange} required />
                  </div>
                  <button className="action-btn submit-btn">Log in with Email</button>
                </form>
              </div>

              {/* RIGHT: SIGNUP */}
              <div className="auth-partition signup-partition">
                <h2>Create Account</h2>
                {/* Google for Signup too! */}
                <div className="google-btn-wrapper">
                     <GoogleLogin 
                        onSuccess={handleGoogleSuccess} 
                        onError={() => console.log('Signup Failed')}
                        text="signup_with"
                        shape="pill"
                        width="100%"
                    />
                </div>
                
                <div className="divider"><span>OR</span></div>

                <form onSubmit={handleAxiosSignup}>
                  <div className="input-group"><label>Name</label><input type="text" name="username" placeholder="Your Name" value={signupData.username} onChange={handleSignupChange} required /></div>
                  <div className="input-group"><label>Email</label><input type="email" name="email" placeholder="john@example.com" value={signupData.email} onChange={handleSignupChange} required /></div>
                  <div className="input-group"><label>Password</label><input type="password" name="password" placeholder="Create Password" value={signupData.password} onChange={handleSignupChange} required /></div>
                  <button className="action-btn submit-btn">Sign up</button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="footer"><p>&copy; 2025 SlothX Innovations. All rights reserved.</p></footer>
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;