import React, { useState } from 'react';

const ApplyPage = ({ onApplySuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    aadhaarNumber: '',
    aadhaarFile: null,
    password: '',
    marketing: false,
    legal: false
  });

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value)
    }));
  };

  // --- OTP LOGIC ---
  const sendOTP = () => {
    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number first.");
      return;
    }
    setOtpSent(true);
    alert(`OTP Sent to ${formData.phone}\n(Your Mock OTP is: 1234)`); 
  };

  const verifyOTP = () => {
    if (enteredOtp === '1234') {
      setIsOtpVerified(true);
      alert("Aadhaar Verified Successfully! ✅");
    } else {
      alert("Incorrect OTP. Please try '1234'.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isOtpVerified) {
      alert("Please verify your Aadhaar via OTP before submitting.");
      return;
    }
    if (!formData.legal) {
      alert("Please accept the Terms & Conditions.");
      return;
    }
    
    console.log("Application Data:", formData);
    alert("Application Submitted Successfully!");
    onApplySuccess(formData.fullName); // Log the user in
  };

  return (
    <div className="page-container">
      <div className="card apply-card">
        <h2>Loan Application</h2>
        <p className="subtitle">Secure Verification Process</p>
        
        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Basic Info */}
          <div className="form-section">
            <h3>1. Personal Details</h3>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="As per Aadhaar" />
            </div>
            <div className="input-group">
              <label>Mobile Number (Linked to Aadhaar)</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" />
            </div>
            <div className="input-group">
                <label>Set Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="For your account" />
            </div>
          </div>

          {/* Section 2: Aadhaar Verification (New Request) */}
          <div className="form-section highlight-section">
            <h3>2. Aadhaar Verification</h3>
            
            {/* Aadhaar Number */}
            <div className="input-group">
              <label>Aadhaar Number</label>
              <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} maxLength="12" placeholder="1234-5678-9012" required />
            </div>

            {/* Aadhaar Upload */}
            <div className="input-group">
              <label>Upload Aadhaar Card (Clear Photo)</label>
              <input type="file" name="aadhaarFile" accept="image/*,.pdf" onChange={handleChange} required />
              <small style={{display:'block', marginTop:'5px', opacity:0.7}}>Max size: 5MB. Format: JPG, PNG, PDF</small>
            </div>

            {/* OTP Process */}
            <div className="otp-container">
                {!otpSent ? (
                    <button type="button" className="action-btn secondary-btn" onClick={sendOTP}>
                        Send OTP to Linked Mobile
                    </button>
                ) : (
                    <div className="otp-verify-box">
                         {isOtpVerified ? (
                             <div className="success-badge">✅ Aadhaar Verified</div>
                         ) : (
                             <>
                                <label>Enter OTP</label>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <input 
                                        type="text" 
                                        value={enteredOtp} 
                                        onChange={(e) => setEnteredOtp(e.target.value)} 
                                        placeholder="Enter 1234"
                                        style={{width: '100px'}}
                                    />
                                    <button type="button" className="action-btn verify-btn" onClick={verifyOTP}>
                                        Verify
                                    </button>
                                </div>
                                <small>OTP sent to {formData.phone}</small>
                             </>
                         )}
                    </div>
                )}
            </div>
          </div>

          {/* Section 3: Legal & Marketing */}
          <div className="form-section">
            <div className="checkbox-row">
                <input type="checkbox" id="legal" name="legal" checked={formData.legal} onChange={handleChange} />
                <label htmlFor="legal">I agree to the Terms, Conditions, and Privacy Policy.</label>
            </div>
            <div className="checkbox-row">
                <input type="checkbox" id="mkt" name="marketing" checked={formData.marketing} onChange={handleChange} />
                <label htmlFor="mkt">Send me exclusive loan offers.</label>
            </div>
          </div>

          <button type="submit" className="action-btn submit-btn" disabled={!isOtpVerified}>
            {isOtpVerified ? "Submit Application" : "Verify Aadhaar to Submit"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ApplyPage;