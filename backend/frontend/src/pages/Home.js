import React from 'react';
import { Link } from 'react-router-dom';
import { FaRocket, FaShieldAlt, FaChartBar, FaBolt, FaUsers, FaLock } from 'react-icons/fa';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>AI-Powered Credit Risk Assessment</h1>
          <p>
            Make informed lending decisions with our advanced machine learning model.
            Get instant credit risk predictions based on comprehensive applicant analysis.
          </p>
          <div className="hero-buttons">
            <Link to="/predict" className="btn btn-secondary btn-lg">
              <FaRocket /> Start Assessment
            </Link>
            <Link to="/about" className="btn btn-outline-white btn-lg">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">91%</div>
              <div className="stat-label">Model Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">307K+</div>
              <div className="stat-label">Training Samples</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">239</div>
              <div className="stat-label">Features Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">&lt;1s</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Our Solution?</h2>
            <p>Advanced features designed for accurate and reliable credit risk assessment</p>
          </div>
          <div className="features-grid">
            <div className="card feature-card">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Accurate Predictions</h3>
              <p>
                Our Random Forest model trained on 300K+ historical records delivers 
                91% accuracy in predicting credit defaults.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FaBolt />
              </div>
              <h3>Instant Results</h3>
              <p>
                Get real-time credit risk assessments in under a second. 
                No more waiting for manual reviews.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FaChartBar />
              </div>
              <h3>Comprehensive Analysis</h3>
              <p>
                Analyzes 239 different features including income, employment, 
                housing, and credit history.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Easy Integration</h3>
              <p>
                RESTful API design allows seamless integration with your 
                existing loan processing systems.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FaLock />
              </div>
              <h3>Secure & Private</h3>
              <p>
                Your data is processed securely. We don't store any personal 
                information from predictions.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FaRocket />
              </div>
              <h3>Scalable Solution</h3>
              <p>
                Docker-ready deployment supports high-volume batch processing 
                for enterprise needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero" style={{ padding: '60px 20px' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Ready to Get Started?</h2>
          <p style={{ marginBottom: '24px', opacity: 0.9 }}>
            Try our credit risk prediction tool and see how AI can transform your lending decisions.
          </p>
          <Link to="/predict" className="btn btn-secondary btn-lg">
            <FaRocket /> Make Your First Prediction
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
