import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

const ResultCard = ({ result, onReset }) => {
  const { prediction, probability, risk_level, message } = result;
  
  const getRiskClass = () => {
    switch (risk_level.toLowerCase()) {
      case 'low':
        return 'low';
      case 'medium':
        return 'medium';
      case 'high':
        return 'high';
      default:
        return 'medium';
    }
  };

  const getRiskIcon = () => {
    switch (risk_level.toLowerCase()) {
      case 'low':
        return <FaCheckCircle />;
      case 'medium':
        return <FaExclamationTriangle />;
      case 'high':
        return <FaTimesCircle />;
      default:
        return <FaExclamationTriangle />;
    }
  };

  const probabilityPercent = (probability * 100).toFixed(1);

  return (
    <div className="card result-card fade-in">
      <div className={`result-icon ${getRiskClass()}`}>
        {getRiskIcon()}
      </div>

      <h2 className={`result-title ${getRiskClass()}`}>
        {risk_level} Risk
      </h2>

      <p className="result-probability">{probabilityPercent}%</p>
      <p style={{ color: '#718096', marginBottom: '16px' }}>Default Probability</p>

      <div className="progress-bar">
        <div 
          className={`progress-bar-fill ${getRiskClass()}`}
          style={{ width: `${probabilityPercent}%` }}
        ></div>
      </div>

      <p className="result-message">{message}</p>

      <div className="divider"></div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <span className={`badge badge-${getRiskClass() === 'low' ? 'success' : getRiskClass() === 'medium' ? 'warning' : 'danger'}`}>
          {prediction === 0 ? 'Approve' : 'Review Required'}
        </span>
      </div>

      <button className="btn btn-primary" onClick={onReset} style={{ marginTop: '24px' }}>
        New Assessment
      </button>
    </div>
  );
};

export default ResultCard;
