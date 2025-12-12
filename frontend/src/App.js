import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; 
import LandingPage from './LandingPage';
import ApplyPage from './ApplyPage';

// REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID = "263303907123-gmok720j1p9tqia0l5ff1d5nep5d3qq9.apps.googleusercontent.com";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userUser, setUserUser] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auth Inputs (Separated for Login vs Signup)
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });

  // Toggles
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const navigateTo = (view) => setCurrentView(view);

  // Input Handlers
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });

  // --- AXIOS HANDLERS ---
  const handleAxiosLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', loginData);
      if (res.status === 200) {
        completeLogin(res.data.name);
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

  // --- GOOGLE SUCCESS HANDLER ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:5000/api/google-login', {
        token: credentialResponse.credential
      });
      completeLogin(res.data.name);
    } catch (err) {
      console.error("Google Login Failed", err);
      alert("Google Login Failed");
    }
  };

  // Helper to DRY up login code
  const completeLogin = (name) => {
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
          <div className="logo" onClick={() => navigateTo('landing')}><span className="logo-icon">C</span> YES LOANS</div>
          <div className="nav-links">
             <a href="#home">Home</a><a href="#about">About</a><a href="#service">Service</a><a href="#contact">Contact</a>
          </div>
          <div className="nav-actions">
            <button className="theme-btn" onClick={toggleTheme}>{isDarkMode ? '☀️' : '🌙'}</button>
            {isLoggedIn ? (
              <div className="user-info"><span>Hi, <b>{userUser}</b></span><button className="logout-btn" onClick={handleLogout}>Logout</button></div>
            ) : (
              // FIXED: Button text restored
              <button className="nav-btn" onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
            )}
          </div>
        </nav>

        {/* CONTENT */}
        <div className="main-content">
          {currentView === 'landing' && <LandingPage onApplyClick={() => navigateTo('apply')} />}
          {currentView === 'apply' && <ApplyPage onApplySuccess={(name) => { completeLogin(name); setCurrentView('landing'); }} />}
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

        <footer className="footer"><p>&copy; 2025 YesLoans.</p></footer>
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;