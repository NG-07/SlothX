import React, { useState, useEffect } from 'react';
import { FaServer, FaDatabase, FaCog, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { checkHealth, getModelInfo } from '../services/api';

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, modelData] = await Promise.all([
          checkHealth(),
          getModelInfo()
        ]);
        setHealth(healthData);
        setModelInfo(modelData);
      } catch (err) {
        setError('Failed to connect to API. Make sure the backend server is running.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="section-title">
          <h2>System Dashboard</h2>
          <p>Loading system status...</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-title">
        <h2>System Dashboard</h2>
        <p>Monitor API health and model information</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <FaTimesCircle /> {error}
        </div>
      )}

      <div className="stats-grid" style={{ marginTop: '24px' }}>
        {/* API Status */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: health?.status === 'healthy' ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            {health?.status === 'healthy' ? (
              <FaCheckCircle size={32} color="#38a169" />
            ) : (
              <FaTimesCircle size={32} color="#e53e3e" />
            )}
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>API Status</h3>
          <span className={`badge badge-${health?.status === 'healthy' ? 'success' : 'danger'}`}>
            {health?.status || 'Unknown'}
          </span>
        </div>

        {/* Model Status */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: health?.model_loaded ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FaCog size={32} color={health?.model_loaded ? '#38a169' : '#e53e3e'} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Model Status</h3>
          <span className={`badge badge-${health?.model_loaded ? 'success' : 'danger'}`}>
            {health?.model_loaded ? 'Loaded' : 'Not Loaded'}
          </span>
        </div>

        {/* Model Type */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'rgba(49, 130, 206, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FaDatabase size={32} color="#3182ce" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Model Type</h3>
          <p style={{ color: '#718096' }}>{modelInfo?.model_type || 'N/A'}</p>
        </div>

        {/* Features Count */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'rgba(49, 130, 206, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FaServer size={32} color="#3182ce" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Features</h3>
          <p style={{ color: '#718096' }}>{modelInfo?.n_features || 'N/A'}</p>
        </div>
      </div>

      {/* Model Details */}
      {modelInfo && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <FaCog />
            <h2>Model Details</h2>
          </div>
          <div className="form-grid">
            <div>
              <p style={{ color: '#718096', marginBottom: '4px' }}>Model Type</p>
              <p style={{ fontWeight: '600' }}>{modelInfo.model_type}</p>
            </div>
            <div>
              <p style={{ color: '#718096', marginBottom: '4px' }}>Number of Features</p>
              <p style={{ fontWeight: '600' }}>{modelInfo.n_features}</p>
            </div>
            <div>
              <p style={{ color: '#718096', marginBottom: '4px' }}>Number of Estimators</p>
              <p style={{ fontWeight: '600' }}>{modelInfo.n_estimators || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: '#718096', marginBottom: '4px' }}>Classes</p>
              <p style={{ fontWeight: '600' }}>{modelInfo.classes?.join(', ') || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Endpoints */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <FaServer />
          <h2>Available API Endpoints</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Endpoint</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}><span className="badge badge-success">GET</span></td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>/health</td>
                <td style={{ padding: '12px' }}>Health check endpoint</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}><span className="badge badge-success">GET</span></td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>/model/info</td>
                <td style={{ padding: '12px' }}>Get model information</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}><span className="badge badge-warning">POST</span></td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>/predict</td>
                <td style={{ padding: '12px' }}>Single credit risk prediction</td>
              </tr>
              <tr>
                <td style={{ padding: '12px' }}><span className="badge badge-warning">POST</span></td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>/predict/bulk</td>
                <td style={{ padding: '12px' }}>Bulk predictions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
