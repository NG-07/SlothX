import React, { useState } from 'react';

const LandingPage = ({ onApplyClick }) => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  
  const toggleFAQ = (index) => setActiveFAQ(activeFAQ === index ? null : index);

  return (
    <>
      {/* Hero */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <p className="hero-sub">PERSONAL, BUSINESS, AND HOME LOANS MADE SIMPLE</p>
          <h1>SMARTER LOANS, FASTER ACCESS<br />100+ LENDERS AT YOUR FINGERTIPS.</h1>
          <p className="hero-desc">Compare Exclusive Offers from Leading Lenders</p>
          <button className="cta-btn" onClick={onApplyClick}>Apply Now</button>
        </div>
        <div className="hero-image">
          <img src="https://placehold.co/600x400/png?text=Loan+Image" alt="Loans" />
        </div>
      </section>

      {/* Steps */}
      <section className="section-block steps-section">
        <h2 className="section-title center">LOAN APPROVAL IN 5 EASY STEPS</h2>
        <div className="steps-container">
          {[ 
            "Review and select your ideal loan offer", 
            "Upload your documents for quick verification", 
            "Fill out and submit the registration form", 
            "Our Relationship Manager will reach out", 
            "Receive instant loan approval" 
          ].map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-number">{i + 1}</div>
              <div className="step-text">{step}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-block faq-section">
        <div className="faq-header">
            <img src="https://placehold.co/400x300/png?text=FAQ+Blocks" alt="FAQ" className="faq-img"/>
        </div>
        <div className="faq-list">
          <h2 className="section-title">FAQS</h2>
          {[ "Why take a business loan?", "Process for personal loan?", "Best deals on Loans", "Do I Qualify?" ].map((q, i) => (
            <div key={i} className="faq-item" onClick={() => toggleFAQ(i)}>
              <div className="faq-question">{q} <span>{activeFAQ === i ? '-' : '+'}</span></div>
              {activeFAQ === i && <div className="faq-answer">Details here...</div>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default LandingPage;