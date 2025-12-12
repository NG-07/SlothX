import React, { useState } from 'react';

const LoginPage = ({ onLoginSuccess, onGoToApply }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate a successful login
    // In a real app, you would check the database here.
    if (formData.username && formData.password) {
      onLoginSuccess(formData.username);
    } else {
      alert("Please enter both username and password");
    }
  };

  return (
    <div className="page-container">
      <div className="card login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to view your loan status</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
              placeholder="Enter your username"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="action-btn submit-btn">Login</button>
          
          <p className="switch-text" onClick={onGoToApply}>
            New here? <b>Apply for a Loan</b>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;