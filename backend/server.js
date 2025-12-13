const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const PDFDocument = require("pdfkit"); 
const fs = require("fs");              
const nodemailer = require("nodemailer"); 

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURATION ---
const GOOGLE_CLIENT_ID = "263303907123-gmok720j1p9tqia0l5ff1d5nep5d3qq9.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- EMAIL CONFIG ---
const MY_EMAIL = "rafi04rafi@gmail.com"; 
const MY_APP_PASS = "ssup hdkz hwbc rflx"; 

// --- DATABASE CONNECTION ---
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Rafi#sql24',
  database: 'sloth'
});

let otpStore = {};

// ==========================================
// 1. AUTHENTICATION ROUTES (Login / Signup)
// ==========================================

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

  const sql = 'INSERT INTO simple_users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Email already exists" });
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "User registered successfully!" });
  });
});

// B. SIMPLE LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM simple_users WHERE email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    if (password === user.password) {
      res.json({ message: "Login Successful", name: user.name });
    } else {
      res.status(400).json({ message: "Incorrect Password" });
    }
  });
});

// C. GOOGLE LOGIN
app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { sub: google_id, email, name, picture } = payload;

    const checkSql = 'SELECT * FROM simple_users WHERE email = ?';
    db.query(checkSql, [email], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        const user = results[0];
        if (!user.google_id) {
           db.query('UPDATE simple_users SET google_id = ?, picture = ? WHERE email = ?', [google_id, picture, email]);
        }
        return res.json({ message: "Google Login Successful", name: user.name });
      } else {
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

// ==========================================
// 2. OTP ROUTES
// ==========================================

app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone required" });
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[phone] = otp;
  console.log(`\n📲 OTP for ${phone}: ${otp}\n`); 
  res.json({ message: "OTP Sent" });
});

app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore[phone] === otp) {
    delete otpStore[phone];
    res.json({ success: true, message: "Verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

// ==========================================
// 3. APPLICATION SUBMIT (DETAILED PDF)
// ==========================================

function generatePDF(data, outputPath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // -- TITLE --
        doc.fontSize(24).font('Helvetica-Bold').text("YesLoans Application Form", { align: "center" });
        doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" });
        doc.moveDown(2);

        // Helper for sections
        const addSection = (title, contentObj) => {
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text(title, { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica').fillColor('black');
            
            for (const [key, value] of Object.entries(contentObj)) {
                if(value) doc.text(`${key}:  ${value}`);
            }
            doc.moveDown(1.5);
        };

        // 1. Personal Details
        addSection("1. Personal Details", {
            "Full Name": data.full_name,
            "Date of Birth": data.date_of_birth,
            "Gender": data.gender,
            "Phone Number": data.phone_number,
            "Email": data.email,
            "Parent/Spouse Name": data.father_or_mother_name,
            "Current Address": data.current_address,
            "Permanent Address": data.permanent_address
        });

        // 2. Identity (KYC)
        addSection("2. Identity Verification", {
            "Aadhaar Number": data.aadhaar_number,
            "PAN Number": data.pan_number
        });

        // 3. Employment
        addSection("3. Employment Details", {
            "Employment Type": data.employment_type,
            "Employer Name": data.employer_name,
            "Designation / Role": data.job_role,
            "Monthly Income": `Rs. ${data.monthly_income}`,
            "Work Experience": `${data.work_experience_months} Months`
        });

        // 4. Financial Status
        addSection("4. Financial Status", {
            "Credit Score": data.credit_score,
            "Existing Loans": data.existing_emis,
            "Monthly EMI Obligation": `Rs. ${data.monthly_emi_obligation}`,
            "Net Monthly Savings": `Rs. ${data.net_monthly_savings}`
        });

        // 5. Loan Request
        addSection("5. Loan Request", {
            "Loan Amount Requested": `Rs. ${data.loan_amount_requested}`,
            "Purpose": data.loan_purpose,
            "Tenure": `${data.tenure_months} Months`,
            "Repayment Mode": data.repayment_mode
        });

        // 6. Bank Details
        addSection("6. Bank Details", {
            "Account Holder": data.account_holder_name,
            "Bank Name": data.bank_name,
            "Account Number": data.account_number,
            "IFSC Code": data.ifsc_code,
            "Linked Mobile": data.linked_mobile_number
        });

        // 7. References
        addSection("7. References", {
            "Ref 1 Name": data.emergency_contact_1_name,
            "Ref 1 Phone": data.emergency_contact_1_phone,
            "Ref 1 Relation": data.emergency_contact_1_relation,
            "Ref 2 Name": data.emergency_contact_2_name,
            "Ref 2 Phone": data.emergency_contact_2_phone,
            "Ref 2 Relation": data.emergency_contact_2_relation
        });

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica-Oblique').text("Declaration: The details above have been submitted by the applicant for loan processing.", { align: "center", color: "grey" });

        doc.end();
        stream.on("finish", () => resolve(outputPath));
        stream.on("error", reject);
    });
}

// --- HELPER: SEND EMAIL ---
async function sendEmail(to, filePath) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: MY_EMAIL, pass: MY_APP_PASS }
    });

    await transporter.sendMail({
      from: `"YesLoans Support" <${MY_EMAIL}>`,
      to: to,
      subject: "Application Submitted Successfully! ✅",
      html: `
          <h3>Dear Applicant,</h3>
          <p>Congratulations! Your loan application has been successfully submitted to <b>YesLoans</b>.</p>
          <p>We have attached a complete copy of your application form for your records.</p>
          <br>
          <p>Best Regards,<br>The YesLoans Team</p>
      `,
      attachments: [{ filename: "YesLoans-Application-Form.pdf", path: filePath }]
  });
}

// --- SUBMIT API ---
app.post('/api/submit-application', async (req, res) => {
  const data = req.body;
  const toInt = (val) => (val === '' || val === undefined) ? 0 : val;
  const toDecimal = (val) => (val === '' || val === undefined) ? 0.00 : val;

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
    toDecimal(data.monthly_income), toInt(data.work_experience_months),
    toInt(data.credit_score), toInt(data.existing_emis), toDecimal(data.monthly_emi_obligation), toDecimal(data.net_monthly_savings),
    toDecimal(data.loan_amount_requested), data.loan_purpose, toInt(data.tenure_months), data.repayment_mode,
    data.account_holder_name, data.account_number, data.ifsc_code, data.bank_name, data.linked_mobile_number,
    data.emergency_contact_1_name, data.emergency_contact_1_phone, data.emergency_contact_1_relation,
    data.emergency_contact_2_name, data.emergency_contact_2_phone, data.emergency_contact_2_relation
  ];

  db.query(sql, [values], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database Insert Failed: " + err.sqlMessage });
    }

    try {
        const pdfPath = `./temp-loan-${Date.now()}.pdf`;
        await generatePDF(data, pdfPath); // Now calls the Detailed PDF function
        await sendEmail(data.email, pdfPath);
        fs.unlink(pdfPath, (err) => { if(err) console.error("Failed to delete temp PDF"); });
        res.status(201).json({ message: "Application Saved & Detailed Email Sent!" });
    } catch (emailErr) {
        console.error("Email/PDF Error:", emailErr);
        res.status(201).json({ message: "Application Saved (Email failed)" });
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));