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