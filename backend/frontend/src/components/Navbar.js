import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaBars, FaTimes } from 'react-icons/fa';
import { checkHealth } from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const [isHealthy, setIsHealthy] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const health = await checkHealth();
        setIsHealthy(health.status === 'healthy');
      } catch (error) {
        setIsHealthy(false);
      }
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <FaChartLine />
          <span>Credit Risk AI</span>
        </Link>

        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/predict" className={isActive('/predict') ? 'active' : ''}>
              Predict
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/about" className={isActive('/about') ? 'active' : ''}>
              About
            </Link>
          </li>
          <li>
            <div className="health-status">
              <span className={`health-dot ${isHealthy ? 'online' : 'offline'}`}></span>
              <span>{isHealthy ? 'API Online' : 'API Offline'}</span>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
