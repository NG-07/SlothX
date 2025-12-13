import React, { useState } from 'react';
import axios from 'axios'; 

const ApplyPage = ({ onApplySuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Form State
  const [formData, setFormData] = useState({
    // 1. Personal
    full_name: '', date_of_birth: '', gender: '', phone_number: '', email: '', 
    father_or_mother_name: '', current_address: '', permanent_address: '', 
    // 2. KYC
    aadhaar_number: '', pan_number: '', 
    // 3. Employment
    employment_type: '', employer_name: '', job_role: '', monthly_income: '', work_experience_months: '',
    // 4. Financial
    credit_score: '', existing_emis: '', monthly_emi_obligation: '', net_monthly_savings: '', 
    // 5. Loan
    loan_amount_requested: '', loan_purpose: '', tenure_months: '', repayment_mode: '',
    // 6. Bank
    account_holder_name: '', account_number: '', ifsc_code: '', bank_name: '', linked_mobile_number: '', 
    // 7. Refs
    emergency_contact_1_name: '', emergency_contact_1_phone: '', emergency_contact_1_relation: '', 
    emergency_contact_2_name: '', emergency_contact_2_phone: '', emergency_contact_2_relation: ''
  });

  // OTP Logic
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // --- VALIDATION LOGIC ---
  const validateStep = (step) => {
    const d = formData;
    switch(step) {
      case 1: 
        if(!d.full_name || !d.date_of_birth || !d.father_or_mother_name || !d.current_address) return "Please fill all Personal Details.";
        return true;
      case 2: 
        if(!d.aadhaar_number || !d.pan_number) return "Please fill KYC Details.";
        if(d.aadhaar_number.length !== 12) return "Aadhaar must be 12 digits.";
        if(!isOtpVerified) return "Please Verify OTP first."; 
        return true;
      case 3: 
        if(!d.employment_type || !d.monthly_income || !d.job_role) return "Please fill Employment Details.";
        return true;
      case 4: 
        if(!d.credit_score || !d.monthly_emi_obligation) return "Please fill Financial Details.";
        return true;
      case 5: 
        if(!d.loan_amount_requested || !d.tenure_months) return "Please fill Loan Details.";
        return true;
      case 6: 
        if(!d.account_number || !d.ifsc_code || !d.linked_mobile_number) return "Please fill Bank Details.";
        return true;
      case 7: 
        if(!d.emergency_contact_1_name || !d.emergency_contact_1_relation) return "Please provide Reference 1.";
        return true;
      default: return true;
    }
  };

  // Navigation
  const nextStep = () => {
    const isValid = validateStep(currentStep);
    if (isValid === true) {
      if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    } else { alert(isValid); }
  };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // Handlers
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelection = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  // OTP API
  const sendOTP = async () => {
    if(!formData.phone_number) return alert("Enter phone number first!");
    try {
      await axios.post('http://localhost:5000/api/send-otp', { phone: formData.phone_number });
      setOtpSent(true);
      alert(`OTP Sent! Check your VS Code Terminal.`);
    } catch (err) { alert("Failed to send OTP"); }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/verify-otp', { phone: formData.phone_number, otp: enteredOtp });
      if(res.data.success) { setIsOtpVerified(true); alert("Verified! ✅"); }
    } catch (err) { alert("Wrong OTP."); }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(7) !== true) return alert("Please fill Reference Details.");
    try {
      const res = await axios.post('http://localhost:5000/api/submit-application', formData);
      if (res.status === 201) { onApplySuccess(); }
    } catch (err) { alert(err.response?.data?.error || "Submission Failed"); }
  };

  return (
    <div className="page-container creative-apply-container">
      {/* Sidebar */}
      <div className="apply-sidebar">
        <div className="sidebar-header"><h2>Your Journey</h2><p>Step {currentStep} of {totalSteps}</p></div>
        <div className="vertical-progress"><div className="progress-fill" style={{ height: `${(currentStep / totalSteps) * 100}%` }}></div></div>
        <div className="step-names">
            <div className={currentStep === 1 ? 'active' : ''}>1. About You</div>
            <div className={currentStep === 2 ? 'active' : ''}>2. Identity Check</div>
            <div className={currentStep === 3 ? 'active' : ''}>3. Work Life</div>
            <div className={currentStep === 4 ? 'active' : ''}>4. Money Matters</div>
            <div className={currentStep === 5 ? 'active' : ''}>5. Loan Details</div>
            <div className={currentStep === 6 ? 'active' : ''}>6. Bank Info</div>
            <div className={currentStep === 7 ? 'active' : ''}>7. Friends & Family</div>
        </div>
      </div>

      {/* Content */}
      <div className="apply-content-area">
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: PERSONAL (Added Address & Parent) */}
          {currentStep === 1 && (
            <div className="step-animate">
              <h1 className="step-title">Let's start. 👋</h1>
              <div className="creative-input-grid">
                <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} className="big-input" />
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="big-input" />
              </div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                <input type="tel" name="phone_number" placeholder="Mobile Number" value={formData.phone_number} onChange={handleChange} className="big-input" />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="big-input" />
              </div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                <input type="text" name="father_or_mother_name" placeholder="Father's / Spouse Name" value={formData.father_or_mother_name} onChange={handleChange} className="big-input full-width" />
              </div>
               <div className="creative-input-grid" style={{marginTop:'20px'}}>
                <input type="text" name="current_address" placeholder="Current Address" value={formData.current_address} onChange={handleChange} className="big-input full-width" />
              </div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                <input type="text" name="permanent_address" placeholder="Permanent Address" value={formData.permanent_address} onChange={handleChange} className="big-input full-width" />
              </div>
               <p className="field-label" style={{marginTop:'20px'}}>Gender:</p>
              <div className="selection-cards">
                {['Male', 'Female', 'Other'].map(g => (<div key={g} className={`select-card ${formData.gender === g ? 'selected' : ''}`} onClick={() => handleSelection('gender', g)}>{g}</div>))}
              </div>
            </div>
          )}

          {/* STEP 2: KYC (Added PAN) */}
          {currentStep === 2 && (
            <div className="step-animate">
              <h1 className="step-title">Verify Identity 🛡️</h1>
              <div className="aadhaar-box">
                <input type="text" name="aadhaar_number" placeholder="Aadhaar Number (12 Digits)" value={formData.aadhaar_number} onChange={handleChange} maxLength="12" className="big-input" />
                
                {!otpSent ? (
                    <button type="button" className="action-btn-creative" onClick={sendOTP}>Get OTP</button>
                ) : (
                    <div className="otp-verify-animate">
                         {isOtpVerified ? <div className="success-msg">Verified ✅</div> : (
                             <div className="otp-row">
                                 <input type="text" placeholder="Check Terminal" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} className="otp-input" />
                                 <button type="button" className="action-btn-creative" onClick={verifyOTP}>Confirm</button>
                             </div>
                         )}
                    </div>
                )}
              </div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                 <input type="text" name="pan_number" placeholder="PAN Number (e.g. ABCDE1234F)" value={formData.pan_number} onChange={handleChange} className="big-input full-width" maxLength="10" />
              </div>
            </div>
          )}

          {/* STEP 3 (Added Job Role) */}
          {currentStep === 3 && (
            <div className="step-animate">
              <h1 className="step-title">Employment 💼</h1>
              <div className="selection-cards">
                {['Salaried', 'Self-Employed', 'Student'].map(t => (<div key={t} className={`select-card ${formData.employment_type === t ? 'selected' : ''}`} onClick={() => handleSelection('employment_type', t)}>{t}</div>))}
              </div>
              <div className="money-input-wrapper small-money">
                 <span>₹</span><input type="number" name="monthly_income" placeholder="Monthly Income" value={formData.monthly_income} onChange={handleChange} className="huge-money-input" />
              </div>
              <div className="creative-input-grid" style={{marginTop: '20px'}}>
                  <input type="text" name="employer_name" placeholder="Employer Name" value={formData.employer_name} onChange={handleChange} className="big-input" />
                  <input type="text" name="job_role" placeholder="Job Role / Designation" value={formData.job_role} onChange={handleChange} className="big-input" />
              </div>
              <div className="creative-input-grid" style={{marginTop: '20px'}}>
                  <input type="number" name="work_experience_months" placeholder="Experience (Months)" value={formData.work_experience_months} onChange={handleChange} className="big-input" />
              </div>
            </div>
          )}
          
          {/* STEP 4 (Added Existing EMIs & Net Savings) */}
          {currentStep === 4 && (
            <div className="step-animate">
              <h1 className="step-title">Finances 💰</h1>
              <div className="creative-input-grid">
                <input type="number" name="credit_score" placeholder="Credit Score" value={formData.credit_score} onChange={handleChange} className="big-input" />
                <input type="number" name="monthly_emi_obligation" placeholder="Current EMIs (₹)" value={formData.monthly_emi_obligation} onChange={handleChange} className="big-input" />
              </div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                <input type="number" name="existing_emis" placeholder="No. of Existing Loans" value={formData.existing_emis} onChange={handleChange} className="big-input" />
                <input type="number" name="net_monthly_savings" placeholder="Net Savings (₹)" value={formData.net_monthly_savings} onChange={handleChange} className="big-input" />
              </div>
            </div>
          )}

          {/* STEP 5 (Added Tenure & Repayment Mode) */}
          {currentStep === 5 && (
            <div className="step-animate">
              <h1 className="step-title">Loan Details 🤝</h1>
              <div className="money-input-wrapper"><span>₹</span><input type="number" name="loan_amount_requested" placeholder="50000" value={formData.loan_amount_requested} onChange={handleChange} className="huge-money-input"/></div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                 <input type="number" name="tenure_months" placeholder="Tenure (Months)" value={formData.tenure_months} onChange={handleChange} className="big-input" />
                 <input type="text" name="repayment_mode" placeholder="Repayment (e.g. Monthly/Weekly)" value={formData.repayment_mode} onChange={handleChange} className="big-input" />
              </div>
              <p className="field-label" style={{marginTop:'20px'}}>Purpose:</p>
              <div className="selection-cards">
                 {['Education', 'Medical', 'Personal'].map(p => (<div key={p} className={`select-card ${formData.loan_purpose === p ? 'selected' : ''}`} onClick={() => handleSelection('loan_purpose', p)}>{p}</div>))}
              </div>
            </div>
          )}

          {/* STEP 6 (Added Linked Mobile) */}
          {currentStep === 6 && (
            <div className="step-animate">
              <h1 className="step-title">Bank Info 🏦</h1>
              <div className="creative-input-grid">
                  <input type="text" name="account_number" placeholder="Account Number" value={formData.account_number} onChange={handleChange} className="big-input" maxLength="18" />
                  <input type="text" name="ifsc_code" placeholder="IFSC Code" value={formData.ifsc_code} onChange={(e) => handleChange({target: {name: 'ifsc_code', value: e.target.value.toUpperCase()}})} className="big-input" maxLength="11" />
              </div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                  <input type="text" name="bank_name" placeholder="Bank Name" value={formData.bank_name} onChange={handleChange} className="big-input" />
                  <input type="text" name="account_holder_name" placeholder="Account Holder Name" value={formData.account_holder_name} onChange={handleChange} className="big-input" />
              </div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                   <input type="tel" name="linked_mobile_number" placeholder="Bank Linked Mobile" value={formData.linked_mobile_number} onChange={handleChange} className="big-input full-width" />
              </div>
            </div>
          )}

          {/* STEP 7: REFS (Added Relations) */}
          {currentStep === 7 && (
            <div className="step-animate">
              <h1 className="step-title">References 📞</h1>
              <div className="ref-block">
                  <h3>Contact 1</h3>
                  <div className="creative-input-grid">
                      <input type="text" name="emergency_contact_1_name" placeholder="Name" value={formData.emergency_contact_1_name} onChange={handleChange} className="big-input" />
                      <input type="tel" name="emergency_contact_1_phone" placeholder="Phone" value={formData.emergency_contact_1_phone} onChange={handleChange} className="big-input" />
                      <input type="text" name="emergency_contact_1_relation" placeholder="Relation" value={formData.emergency_contact_1_relation} onChange={handleChange} className="big-input" />
                  </div>
              </div>
              <div className="ref-block" style={{marginTop: '20px'}}>
                  <h3>Contact 2</h3>
                  <div className="creative-input-grid">
                      <input type="text" name="emergency_contact_2_name" placeholder="Name" value={formData.emergency_contact_2_name} onChange={handleChange} className="big-input" />
                      <input type="tel" name="emergency_contact_2_phone" placeholder="Phone" value={formData.emergency_contact_2_phone} onChange={handleChange} className="big-input" />
                      <input type="text" name="emergency_contact_2_relation" placeholder="Relation" value={formData.emergency_contact_2_relation} onChange={handleChange} className="big-input" />
                  </div>
              </div>
            </div>
          )}

          <div className="creative-nav-buttons">
            {currentStep > 1 && <button type="button" className="nav-arrow back" onClick={prevStep}>← Back</button>}
            {currentStep < totalSteps ? (<button type="button" className="nav-arrow next" onClick={nextStep}>Next →</button>) : (<button type="submit" className="nav-arrow finish">Submit Application ✨</button>)}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;