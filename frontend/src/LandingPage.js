import React from 'react';
import './App.css'; 

const LandingPage = ({ onApplyClick }) => {
  return (
    <div className="landing-container">
      
      {/* 1. HERO SECTION - Simple & Bold */}
      <header className="hero-section simple-hero">
        <div className="hero-content">
          <div className="sloth-badge">Presented by Team SlothX</div>
          <h1 className="hero-title">Easy Lenders</h1>
          <h2 className="hero-subtitle">The Future of AI & Blockchain Finance</h2>
          
          <p className="hero-simple-text">
            Smart Loans. Zero Paperwork. 100% Trust. <br/>
            We use AI to fetch your data and Blockchain to secure it.
          </p>

          <button className="primary-btn glow-btn" onClick={onApplyClick}>Start Application 🚀</button>
        </div>
      </header>

      {/* 2. FEATURES - Clean Cards */}
      <section className="info-section" id="about">
        <div className="features-grid simple-grid">
          <div className="feature-card glass-card">
            <div className="icon">🤖</div>
            <h4>AI Agents</h4>
            <p>No human managers. AI processes your loan instantly.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="icon">🔗</div>
            <h4>Blockchain Trust</h4>
            <p>Your data is locked in a secure, tamper-proof vault.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="icon">⚡</div>
            <h4>Instant Payouts</h4>
            <p>Smart contracts release funds the moment you are approved.</p>
          </div>
        </div>
      </section>

      {/* 3. CREATIVE TEAM SECTION */}
      <section className="team-section" id="team">
        <h2 className="section-title">Meet The Minds Behind SlothX</h2>
        
        <div className="team-container">
            {/* Left: Interactive Team List */}
            <div className="team-members">
                <div className="member-card">
                    <span className="avatar">🎨</span>
                    <div className="member-info">
                        <h3>Nuvvula Geethika</h3>
                    </div>
                </div>

                <div className="member-card">
                    <span className="avatar">🚀</span>
                    <div className="member-info">
                        <h3>Lakshmi Sowmya</h3>
                    </div>
                </div>

                <div className="member-card">
                    <span className="avatar">👩‍💻</span>
                    <div className="member-info">
                        <h3>Mohammed Rafi</h3>
                    </div>
                </div>
            </div>

            {/* Right: Team Logo Display */}
            <div className="team-logo-display">
                <div className="logo-circle">
                    {/* PLACEHOLDER FOR YOUR LOGO */}
                    {/* Make sure to put an image named 'team-logo.png' in your public folder */}
                    <img src="/team-logo.png" alt="SlothX Logo" onError={(e) => e.target.style.display='none'} />
                    <span className="logo-text">SlothX</span>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;