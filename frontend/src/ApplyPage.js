import React, { useState } from 'react';

const ApplyPage = ({ onApplySuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Form State
  const [formData, setFormData] = useState({
    // 1. Personal
    full_name: '', date_of_birth: '', gender: '', phone_number: '', email: '', father_or_mother_name: '', current_address: '', permanent_address: '', selfie: null,
    // 2. KYC
    aadhaar_number: '', pan_number: '', aadhaar_document: null, pan_document: null,
    // 3. Employment
    employment_type: '', employer_name: '', job_role: '', monthly_income: '', salary_credit_bank: '', work_experience_months: '',
    // 4. Financial
    credit_score: '', existing_emis: '', monthly_emi_obligation: '', net_monthly_savings: '', salary_slip: null, bank_statement: null,
    // 5. Loan
    loan_amount_requested: '', loan_purpose: '', tenure_months: '', repayment_mode: '',
    // 6. Bank
    account_holder_name: '', account_number: '', ifsc_code: '', bank_name: '', linked_mobile_number: '', bank_document: null,
    // 7. Refs
    emergency_contact_1_name: '', emergency_contact_1_phone: '', emergency_contact_1_relation: '', emergency_contact_2_name: '', emergency_contact_2_phone: '', emergency_contact_2_relation: ''
  });

  // OTP Logic
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Navigation
  const nextStep = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelection = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
  };

  const sendOTP = () => {
    setOtpSent(true);
    alert(`Magic Link & OTP sent to ${formData.phone_number || 'your number'}\n(OTP: 1234)`);
  };

  const verifyOTP = () => {
    if (enteredOtp === '1234') {
      setIsOtpVerified(true);
      alert("Identity Verified! 🎉");
    } else alert("Wrong code. Try 1234.");
  };

  // Render Logic
  return (
    <div className="page-container creative-apply-container">
      
      {/* Sidebar / Progress Section */}
      <div className="apply-sidebar">
        <div className="sidebar-header">
           <h2>Your Journey</h2>
           <p>Step {currentStep} of {totalSteps}</p>
        </div>
        
        <div className="vertical-progress">
          <div className="progress-fill" style={{ height: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>

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

      {/* Main Content Area */}
      <div className="apply-content-area">
        <form onSubmit={(e) => { e.preventDefault(); onApplySuccess(formData.full_name); }}>
          
          {/* STEP 1: PERSONAL */}
          {currentStep === 1 && (
            <div className="step-animate">
              <h1 className="step-title">Let's start with the basics. 👋</h1>
              <p className="step-desc">Tell us a bit about yourself so we can address you correctly.</p>
              
              <div className="creative-input-grid">
                <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} className="big-input" />
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="big-input" />
              </div>

              <p className="field-label">I identify as:</p>
              <div className="selection-cards">
                {['Male', 'Female', 'Other'].map(g => (
                  <div key={g} className={`select-card ${formData.gender === g ? 'selected' : ''}`} onClick={() => handleSelection('gender', g)}>
                    {g}
                  </div>
                ))}
              </div>

              <div className="creative-input-grid" style={{marginTop:'20px'}}>
                <input type="tel" name="phone_number" placeholder="Mobile Number" value={formData.phone_number} onChange={handleChange} className="big-input" />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="big-input" />
              </div>

               <div className="file-upload-box">
                  <label htmlFor="selfie">📸 Upload a Selfie</label>
                  <input type="file" id="selfie" name="selfie" onChange={handleFileChange} />
                  {formData.selfie && <span className="file-name">{formData.selfie.name}</span>}
              </div>
            </div>
          )}

          {/* STEP 2: KYC */}
          {currentStep === 2 && (
            <div className="step-animate">
              <h1 className="step-title">Verify your Identity 🛡️</h1>
              <p className="step-desc">We need to make sure you are really you.</p>

              <div className="aadhaar-box">
                <input type="text" name="aadhaar_number" placeholder="Enter 12-digit Aadhaar Number" value={formData.aadhaar_number} onChange={handleChange} className="big-input" />
                
                {!otpSent ? (
                    <button type="button" className="action-btn-creative" onClick={sendOTP}>Send OTP</button>
                ) : (
                    <div className="otp-verify-animate">
                         {isOtpVerified ? <div className="success-msg">Verified ✅</div> : (
                             <div className="otp-row">
                                 <input type="text" placeholder="1234" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} className="otp-input" />
                                 <button type="button" className="action-btn-creative" onClick={verifyOTP}>Confirm</button>
                             </div>
                         )}
                    </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: EMPLOYMENT */}
          {currentStep === 3 && (
            <div className="step-animate">
              <h1 className="step-title">What do you do? 💼</h1>
              <p className="field-label">I am currently:</p>
              <div className="selection-cards">
                {['Salaried', 'Self-Employed', 'Freelancer', 'Student'].map(type => (
                  <div key={type} className={`select-card ${formData.employment_type === type ? 'selected' : ''}`} onClick={() => handleSelection('employment_type', type)}>
                    {type}
                  </div>
                ))}
              </div>

              <input type="text" name="employer_name" placeholder="Company / Business Name" value={formData.employer_name} onChange={handleChange} className="big-input full-width" style={{marginTop:'20px'}} />
              
              <div className="creative-input-grid">
                 <input type="number" name="monthly_income" placeholder="Monthly Income (₹)" value={formData.monthly_income} onChange={handleChange} className="big-input" />
                 <input type="number" name="work_experience_months" placeholder="Experience (Months)" value={formData.work_experience_months} onChange={handleChange} className="big-input" />
              </div>
            </div>
          )}

          {/* STEP 4: FINANCIAL */}
          {currentStep === 4 && (
            <div className="step-animate">
              <h1 className="step-title">Financial Health 💰</h1>
              <div className="creative-input-grid">
                  <input type="number" name="credit_score" placeholder="Credit Score (e.g., 750)" value={formData.credit_score} onChange={handleChange} className="big-input" />
                  <input type="number" name="monthly_emi_obligation" placeholder="Current Monthly EMIs (₹)" value={formData.monthly_emi_obligation} onChange={handleChange} className="big-input" />
              </div>
              
              <div className="upload-zone">
                  <p>Drop your <b>Salary Slip</b> & <b>Bank Statement</b> here</p>
                  <div className="file-row">
                      <input type="file" name="salary_slip" onChange={handleFileChange} />
                      <input type="file" name="bank_statement" onChange={handleFileChange} />
                  </div>
              </div>
            </div>
          )}

          {/* STEP 5: LOAN DETAILS */}
          {currentStep === 5 && (
            <div className="step-animate">
              <h1 className="step-title">How can we help? 🤝</h1>
              
              <div className="money-input-wrapper">
                 <span>₹</span>
                 <input type="number" name="loan_amount_requested" placeholder="50,000" value={formData.loan_amount_requested} onChange={handleChange} className="huge-money-input" />
              </div>

              <p className="field-label">Purpose:</p>
              <div className="selection-cards">
                {['Education', 'Medical', 'Travel', 'Personal', 'Business'].map(p => (
                  <div key={p} className={`select-card ${formData.loan_purpose === p ? 'selected' : ''}`} onClick={() => handleSelection('loan_purpose', p)}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: BANK INFO */}
          {currentStep === 6 && (
            <div className="step-animate">
              <h1 className="step-title">Where to send the money? 🏦</h1>
              <input type="text" name="account_holder_name" placeholder="Account Holder Name" value={formData.account_holder_name} onChange={handleChange} className="big-input full-width" />
              <input type="text" name="account_number" placeholder="Account Number" value={formData.account_number} onChange={handleChange} className="big-input full-width" style={{marginTop:'15px'}} />
              <div className="creative-input-grid" style={{marginTop:'15px'}}>
                  <input type="text" name="ifsc_code" placeholder="IFSC Code" value={formData.ifsc_code} onChange={handleChange} className="big-input" />
                  <input type="text" name="bank_name" placeholder="Bank Name" value={formData.bank_name} onChange={handleChange} className="big-input" />
              </div>
            </div>
          )}

          {/* STEP 7: REFERENCES */}
          {currentStep === 7 && (
            <div className="step-animate">
              <h1 className="step-title">Final Step! References 📞</h1>
              <p className="step-desc">Just in case we can't reach you.</p>
              
              <div className="ref-block">
                  <h3>Contact 1</h3>
                  <div className="creative-input-grid">
                      <input type="text" name="emergency_contact_1_name" placeholder="Name" value={formData.emergency_contact_1_name} onChange={handleChange} className="big-input" />
                      <input type="tel" name="emergency_contact_1_phone" placeholder="Phone" value={formData.emergency_contact_1_phone} onChange={handleChange} className="big-input" />
                  </div>
              </div>

              <div className="ref-block">
                  <h3>Contact 2</h3>
                  <div className="creative-input-grid">
                      <input type="text" name="emergency_contact_2_name" placeholder="Name" value={formData.emergency_contact_2_name} onChange={handleChange} className="big-input" />
                      <input type="tel" name="emergency_contact_2_phone" placeholder="Phone" value={formData.emergency_contact_2_phone} onChange={handleChange} className="big-input" />
                  </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="creative-nav-buttons">
            {currentStep > 1 && <button type="button" className="nav-arrow back" onClick={prevStep}>← Back</button>}
            {currentStep < totalSteps ? (
                <button type="button" className="nav-arrow next" onClick={nextStep}>Next →</button>
            ) : (
                <button type="submit" className="nav-arrow finish">Submit Application ✨</button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default ApplyPage;