import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaCode, FaDatabase, FaRocket, FaBrain, FaChartLine } from 'react-icons/fa';

const About = () => {
  return (
    <div className="container">
      <div className="section-title">
        <h2>About Credit Risk AI</h2>
        <p>Understanding our credit risk prediction system</p>
      </div>

      {/* Overview */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <FaBrain />
          <h2>Project Overview</h2>
        </div>
        <p style={{ lineHeight: '1.8', color: '#4a5568' }}>
          Credit Risk AI is a machine learning-powered application designed to help financial institutions 
          make informed lending decisions. Our system analyzes various applicant attributes including 
          income, employment history, housing situation, and credit history to predict the likelihood 
          of loan default.
        </p>
        <p style={{ lineHeight: '1.8', color: '#4a5568', marginTop: '16px' }}>
          The model was trained on over 307,000 historical loan applications, achieving a 91% accuracy 
          rate in predicting credit defaults. This enables lenders to quickly assess risk and make 
          data-driven decisions.
        </p>
      </div>

      {/* Technology Stack */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <FaCode />
          <h2>Technology Stack</h2>
        </div>
        <div className="form-grid">
          <div>
            <h4 style={{ color: '#2d3748', marginBottom: '8px' }}>Backend</h4>
            <ul style={{ color: '#4a5568', paddingLeft: '20px' }}>
              <li>Python 3.11</li>
              <li>FastAPI Framework</li>
              <li>Scikit-learn (ML Models)</li>
              <li>Pandas & NumPy</li>
              <li>Uvicorn (ASGI Server)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#2d3748', marginBottom: '8px' }}>Frontend</h4>
            <ul style={{ color: '#4a5568', paddingLeft: '20px' }}>
              <li>React 18</li>
              <li>React Router DOM</li>
              <li>Axios (HTTP Client)</li>
              <li>React Icons</li>
              <li>React Toastify</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#2d3748', marginBottom: '8px' }}>DevOps</h4>
            <ul style={{ color: '#4a5568', paddingLeft: '20px' }}>
              <li>Docker & Docker Compose</li>
              <li>Git Version Control</li>
              <li>GitHub Actions (CI/CD)</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#2d3748', marginBottom: '8px' }}>Machine Learning</h4>
            <ul style={{ color: '#4a5568', paddingLeft: '20px' }}>
              <li>Random Forest Classifier</li>
              <li>Logistic Regression</li>
              <li>Neural Networks (Keras)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data & Model */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <FaDatabase />
          <h2>Data & Model Information</h2>
        </div>
        <div className="form-grid">
          <div className="stat-card">
            <div className="stat-value">307K+</div>
            <div className="stat-label">Training Samples</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">122</div>
            <div className="stat-label">Original Features</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">239</div>
            <div className="stat-label">Processed Features</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">91%</div>
            <div className="stat-label">Model Accuracy</div>
          </div>
        </div>
        <div className="divider"></div>
        <h4 style={{ color: '#2d3748', marginBottom: '12px' }}>Key Features Analyzed</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            'Income', 'Credit Amount', 'Employment Duration', 'Age', 'Family Status',
            'Housing Type', 'Education Level', 'Occupation', 'Property Ownership',
            'External Credit Scores', 'Document Flags', 'Region Information'
          ].map((feature, index) => (
            <span key={index} className="badge badge-success">{feature}</span>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <FaChartLine />
          <h2>How It Works</h2>
        </div>
        <div className="features-grid" style={{ marginTop: '16px' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>1</div>
            <h4>Input Data</h4>
            <p style={{ color: '#718096', fontSize: '0.875rem' }}>
              Enter applicant information including personal, financial, and employment details
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>2</div>
            <h4>Data Processing</h4>
            <p style={{ color: '#718096', fontSize: '0.875rem' }}>
              Our system preprocesses and encodes the data to match the model's training format
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>3</div>
            <h4>ML Prediction</h4>
            <p style={{ color: '#718096', fontSize: '0.875rem' }}>
              Random Forest model analyzes 239 features to predict default probability
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>4</div>
            <h4>Risk Assessment</h4>
            <p style={{ color: '#718096', fontSize: '0.875rem' }}>
              Receive instant risk classification: Low, Medium, or High with probability score
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <h3 style={{ marginBottom: '16px' }}>Ready to try it out?</h3>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/predict" className="btn btn-primary btn-lg">
            <FaRocket /> Start Prediction
          </Link>
          <a 
            href="https://github.com/bhatganeshdarshan/codered-credit-risk-prediction" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline btn-lg"
          >
            <FaGithub /> View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
