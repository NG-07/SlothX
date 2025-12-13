import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

const ApplyPage = ({ onApplySuccess, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const isEditing = !!initialData; 

  // OTP Logic State
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '', date_of_birth: '', gender: '', phone_number: '', email: '', 
    father_or_mother_name: '', current_address: '', permanent_address: '', 
    aadhaar_number: '', pan_number: '', 
    employment_type: '', employer_name: '', job_role: '', monthly_income: '', work_experience_months: '',
    credit_score: '', existing_emis: '', monthly_emi_obligation: '', net_monthly_savings: '', 
    loan_amount_requested: '', loan_purpose: '', tenure_months: '', repayment_mode: '',
    account_holder_name: '', account_number: '', ifsc_code: '', bank_name: '', linked_mobile_number: '', 
    emergency_contact_1_name: '', emergency_contact_1_phone: '', emergency_contact_1_relation: '', 
    emergency_contact_2_name: '', emergency_contact_2_phone: '', emergency_contact_2_relation: ''
  });

  // OTP API Functions (Minimalist)
  const sendOTP = async () => {
    if(!formData.phone_number) return alert("Phone number required.");
    try {
      await axios.post('http://localhost:5000/api/send-otp', { phone: formData.phone_number });
      setOtpSent(true);
      alert("Code sent.");
    } catch (err) { alert("Error sending code."); }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/verify-otp', { phone: formData.phone_number, otp: enteredOtp });
      if(res.data.success) { setIsOtpVerified(true); alert("Verified."); }
    } catch (err) { alert("Invalid code."); }
  };

  // MAPPING LOGIC
  useEffect(() => {
    if (initialData) {
        setFormData({
            ...initialData,
            date_of_birth: initialData.dob ? initialData.dob.split('T')[0] : '',
            father_or_mother_name: initialData.parent_name || '',
            net_monthly_savings: initialData.net_savings || '',
            loan_amount_requested: initialData.loan_amount || '',
            account_holder_name: initialData.account_holder || '',
            linked_mobile_number: initialData.linked_mobile || '',
            emergency_contact_1_name: initialData.ref1_name || '',
            emergency_contact_1_phone: initialData.ref1_phone || '',
            emergency_contact_1_relation: initialData.ref1_relation || '',
            emergency_contact_2_name: initialData.ref2_name || '',
            emergency_contact_2_phone: initialData.ref2_phone || '',
            emergency_contact_2_relation: initialData.ref2_relation || '',
        });
    }
  }, [initialData]);

  // Handlers
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelection = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  // Navigation
  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  // --- 🔴 CHANGED: SEPARATE FINAL SUBMIT FUNCTION ---
  // This is NO LONGER attached to the form 'onSubmit'. 
  // It is only called when you explicitly click the button in Step 7.
  const handleFinalSubmit = async () => {
    
    // 1. SAFETY CHECK (Validation)
    if (!formData.emergency_contact_1_name || !formData.emergency_contact_1_phone) {
      alert("Please fill in Reference 1 details before submitting.");
      return; 
    }

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/update-application/${initialData.id}`, formData);
        alert("Application Updated Successfully!");
      } else {
        await axios.post('http://localhost:5000/api/submit-application', formData);
        alert("Application Submitted Successfully!");
      }
      onApplySuccess(); 
    } catch (err) { 
      alert("Action Failed: " + err.message); 
    }
  };

  return (
    <div className="page-container creative-apply-container">
      {/* SIDEBAR */}
      <div className="apply-sidebar">
        <div className="sidebar-header">
            <h2>{isEditing ? "Edit Mode ✏️" : "New Application"}</h2>
            <p>Step {currentStep} of {totalSteps}</p>
        </div>
        <div className="vertical-progress"><div className="progress-fill" style={{ height: `${(currentStep / totalSteps) * 100}%` }}></div></div>
        <div className="step-names">
            <div className={currentStep === 1 ? 'active' : ''}>1. Personal</div>
            <div className={currentStep === 2 ? 'active' : ''}>2. KYC</div>
            <div className={currentStep === 3 ? 'active' : ''}>3. Employment</div>
            <div className={currentStep === 4 ? 'active' : ''}>4. Financial</div>
            <div className={currentStep === 5 ? 'active' : ''}>5. Loan</div>
            <div className={currentStep === 6 ? 'active' : ''}>6. Bank</div>
            <div className={currentStep === 7 ? 'active' : ''}>7. Refs</div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="apply-content-area">
        {/* 🔴 CHANGED: Form simply prevents default. It does NOT handle logic anymore. */}
        <form 
          onSubmit={(e) => e.preventDefault()} 
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} 
        >
          
          {/* STEP 1: PERSONAL */}
          {currentStep === 1 && (
            <div className="step-animate">
              <h1 className="step-title">{isEditing ? "Update Personal Info" : "Let's start. 👋"}</h1>
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

          {/* STEP 2: KYC */}
          {currentStep === 2 && (
            <div className="step-animate">
              <h1 className="step-title">Verify Identity 🛡️</h1>
              <div className="aadhaar-box">
                <input type="text" name="aadhaar_number" placeholder="Aadhaar Number (12 Digits)" value={formData.aadhaar_number} onChange={handleChange} maxLength="12" className="big-input" />
                
                <div style={{marginTop: '15px'}}>
                  {!otpSent ? (
                      <button type="button" className="action-btn-creative" onClick={sendOTP} style={{width:'100%'}}>📲 Get OTP</button>
                  ) : (
                      <div className="otp-verify-animate">
                          {isOtpVerified ? <div className="success-msg" style={{color:'green', fontWeight:'bold'}}>Verified ✅</div> : (
                              <div className="otp-row" style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                                  <input type="text" placeholder="OTP" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} className="big-input" style={{width:'60%'}} />
                                  <button type="button" className="action-btn-creative" onClick={verifyOTP} style={{width:'40%'}}>Confirm</button>
                              </div>
                          )}
                      </div>
                  )}
                </div>
              </div>
              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                <input type="text" name="pan_number" placeholder="PAN Number" value={formData.pan_number} onChange={handleChange} className="big-input full-width" maxLength="10" />
              </div>
            </div>
          )}

          {/* STEP 3: EMPLOYMENT */}
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
          
          {/* STEP 4: FINANCIAL */}
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

          {/* STEP 5: LOAN */}
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

          {/* STEP 6: BANK */}
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

          {/* STEP 7: REFS */}
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

          {/* FIXED BUTTON SECTION */}
          <div className="creative-nav-buttons">
            {currentStep > 1 && (
              <button type="button" className="nav-arrow back" onClick={prevStep}>
                ← Back
              </button>
            )}
            
            {/* 🔴 IMPORTANT: We use separate logical blocks to prevent 'ghost clicks' */}
            {currentStep < totalSteps ? (
              // This is the NEXT button
              <button key="next-btn" type="button" className="nav-arrow next" onClick={nextStep}>
                Next →
              </button>
            ) : (
              // This is the SUBMIT button - Now type="button" to prevent auto-submit
              <button key="submit-btn" type="button" className="nav-arrow finish" onClick={handleFinalSubmit}>
                {isEditing ? "Save & Resend Email" : "Submit Application"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;