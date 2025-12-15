import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Credit Risk Prediction - AI-Powered Loan Assessment</p>
        <p>&copy; {currentYear} All rights reserved.</p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/predict">Predict</Link>
          <Link to="/about">About</Link>
          <a href="https://github.com/bhatganeshdarshan/codered-credit-risk-prediction" target="_blank" rel="noopener noreferrer">
            <FaGithub /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
