const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library'); // <--- IMPORT THIS

const app = express();
app.use(express.json());
app.use(cors());

// REPLACE THIS WITH YOUR OWN CLIENT ID FROM GOOGLE CLOUD CONSOLE
const GOOGLE_CLIENT_ID = "263303907123-gmok720j1p9tqia0l5ff1d5nep5d3qq9.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Rafi#sql24',
  database: 'sloth'
});

let otpStore = {}; // Stores { "9876543210": "4521" }

// ---------------- API ROUTES ----------------

// 1. SEND OTP (Logs to Console)
app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number required" });

  // Generate Random 4-Digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Store it temporarily
  otpStore[phone] = otp;

  // LOG TO CONSOLE (This is what you asked for!)
  console.log(`\n=============================`);
  console.log(`📲 OTP for ${phone}: ${otp}`);
  console.log(`=============================\n`);

  res.json({ message: "OTP Sent to Terminal" });
});

// 2. VERIFY OTP
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  
  if (otpStore[phone] === otp) {
    delete otpStore[phone]; // Clear after use
    res.json({ success: true, message: "OTP Verified!" });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

// 3. SUBMIT LOAN APPLICATION
// ... existing imports ...

// Helper functions to safely handle empty data
const toInt = (val) => (val === '' || val === undefined || val === null) ? 0 : val;
const toDecimal = (val) => (val === '' || val === undefined || val === null) ? 0.00 : val;

app.post('/api/submit-application', (req, res) => {
  const data = req.body;

  const sql = `
    INSERT INTO loan_applications (
      full_name, dob, gender, phone_number, email, parent_name, current_address, permanent_address,
      aadhaar_number, pan_number,
      employment_type, employer_name, job_role, monthly_income, work_experience_months,
      credit_score, existing_emis, monthly_emi_obligation, net_savings,
      loan_amount, loan_purpose, tenure_months, repayment_mode,
      account_holder, account_number, ifsc_code, bank_name, linked_mobile,
      ref1_name, ref1_phone, ref1_relation, ref2_name, ref2_phone, ref2_relation
    ) VALUES (?)
  `;

  const values = [
    data.full_name, data.date_of_birth, data.gender, data.phone_number, data.email, data.father_or_mother_name, data.current_address, data.permanent_address,
    data.aadhaar_number, data.pan_number,
    data.employment_type, data.employer_name, data.job_role, 
    toDecimal(data.monthly_income), 
    toInt(data.work_experience_months),
    toInt(data.credit_score), 
    toInt(data.existing_emis), // <--- This runs through the helper now!
    toDecimal(data.monthly_emi_obligation), 
    toDecimal(data.net_monthly_savings),
    toDecimal(data.loan_amount_requested), 
    data.loan_purpose, 
    toInt(data.tenure_months), 
    data.repayment_mode,
    data.account_holder_name, data.account_number, data.ifsc_code, data.bank_name, data.linked_mobile_number,
    data.emergency_contact_1_name, data.emergency_contact_1_phone, data.emergency_contact_1_relation,
    data.emergency_contact_2_name, data.emergency_contact_2_phone, data.emergency_contact_2_relation
  ];

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error(err);
      // Give a clear error message back to the frontend
      return res.status(500).json({ error: "Database Error: " + err.sqlMessage });
    }
    res.status(201).json({ message: "Application Saved!" });
  });
});
// ... (Keep your existing Signup / Login APIs here) ...

// --- 3. GOOGLE LOGIN API (NEW) ---
app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    const { sub: google_id, email, name, picture } = payload;

    // 2. Check if this user already exists in our DB
    const checkSql = 'SELECT * FROM simple_users WHERE email = ?';
    
    db.query(checkSql, [email], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        // CASE A: User exists -> Log them in
        const user = results[0];
        
        // Optional: Update their google_id if it wasn't linked before
        if (!user.google_id) {
           db.query('UPDATE simple_users SET google_id = ?, picture = ? WHERE email = ?', [google_id, picture, email]);
        }
        
        return res.json({ message: "Google Login Successful", name: user.name });

      } else {
        // CASE B: New User -> Create account automatically (Auto-Signup)
        const insertSql = 'INSERT INTO simple_users (name, email, google_id, picture) VALUES (?, ?, ?, ?)';
        
        db.query(insertSql, [name, email, google_id, picture], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          return res.status(201).json({ message: "Google Signup Successful", name: name });
        });
      }
    });

  } catch (error) {
    res.status(401).json({ message: "Invalid Google Token" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));