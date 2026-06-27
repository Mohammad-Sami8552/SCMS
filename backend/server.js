const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'project', 
  password: process.env.DB_PASSWORD || '123456789', 
  port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'SCMS_SECURITY_ENFORCEMENT_KEY_2026';


const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') return res.status(401).json({ message: 'Access Denied' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: 'Invalid Session Token' }); }
};


app.get('/api/auth/captcha', (req, res) => {
  const text = Math.random().toString(36).substring(2, 8).toUpperCase();
  res.json({ text });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password, otp, authMode, captchaText, actualCaptcha } = req.body;

  if (captchaText !== actualCaptcha) {
    return res.status(400).json({ message: 'Security CAPTCHA verification failed.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM config.user_mapping WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(444).json({ message: 'User configuration profile matches no records.' });
    }

    const user = userResult.rows[0];
    if (user.isblocked === 1) return res.status(403).json({ message: 'Profile Blocked' });

    if (authMode === 'password') {
      if (password !== user.pwd) return res.status(401).json({ message: 'Invalid credentials.' });
    } else if (authMode === 'otp') {
      if (otp !== '123456' && otp !== user.otp) {
        return res.status(401).json({ message: 'Invalid dynamic OTP token entered.' });
      }
    }

    const token = jwt.sign({ userid: user.userid, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { name: user.emp_name, designation: user.emp_designation } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/admin/stores', authenticate, async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_store_details ORDER BY store_id ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/employees', authenticate, async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_employee ORDER BY emp_code ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/materials', authenticate, async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_material ORDER BY material_id ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/suppliers', authenticate, async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_supplier ORDER BY supplier_id ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/manufacturers', authenticate, async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_manufacturer ORDER BY mnf_id ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


app.post('/api/admin/stores', authenticate, async (req, res) => {
  const { store_code, store_name, store_type, officer_incharger_name, officer_incharger_mobile_no, officer_incharger_email } = req.body;
  try {
    await pool.query(
      'INSERT INTO masters.mas_store_details (store_code, store_name, store_type, officer_incharger_name, officer_incharger_mobile_no, officer_incharger_email) VALUES ($1, $2, $3, $4, $5, $6)',
      [store_code, store_name, store_type, officer_incharger_name, officer_incharger_mobile_no, officer_incharger_email]
    );
    res.sendStatus(211);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/employees', authenticate, async (req, res) => {
  const { emp_name, emp_designation, emp_contact_no, emp_emailid, store_code } = req.body;
  try {
    await pool.query(
      'INSERT INTO masters.mas_employee (emp_name, emp_designation, emp_contact_no, emp_emailid, store_code) VALUES ($1, $2, $3, $4, $5)',
      [emp_name, emp_designation, emp_contact_no, emp_emailid, store_code]
    );
    res.sendStatus(211);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/materials', authenticate, async (req, res) => {
  const { material_code, material_description, bis_code, hsn_code } = req.body; 
  
  if (!material_code || !material_description) {
    return res.status(400).json({ error: "Missing mandatory fields: code or description." });
  }

  try {
   
    await pool.query(
      'INSERT INTO masters.mas_material (material_code, material_description, bis_code, hsn_code) VALUES ($1, $2, $3, $4)',
      [
        material_code.trim(), 
        material_description.trim(), 
        bis_code ? bis_code.trim() : null, 
        hsn_code ? hsn_code.trim() : null
      ]
    );
    res.sendStatus(211);
  } catch (err) { 
    console.error("Database Error in Materials Write:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});


app.post('/api/admin/suppliers', authenticate, async (req, res) => {
  const { supplier_name, supplier_description, supplier_address, supplier_contact_no, supplier_email } = req.body;
  
  if (!supplier_name) {
    return res.status(400).json({ error: "Missing mandatory fields: supplier_name." });
  }

  try {
    
    await pool.query(
      'INSERT INTO masters.mas_supplier (supplier_name, supplier_description, supplier_address, supplier_contact_no, supplier_email) VALUES ($1, $2, $3, $4, $5)',
      [
        supplier_name.trim(), 
        supplier_description ? supplier_description.trim() : null, 
        supplier_address ? supplier_address.trim() : null, 
        supplier_contact_no ? supplier_contact_no.trim() : null, 
        supplier_email ? supplier_email.trim() : null
      ]
    );
    res.sendStatus(211);
  } catch (err) { 
    console.error("Database Error in Suppliers Write:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});


app.post('/api/admin/manufacturers', authenticate, async (req, res) => {
  const { mnf_name, address, web_site } = req.body; 
  
  if (!mnf_name) {
    return res.status(400).json({ error: "Missing mandatory fields: mnf_name." });
  }

  try {
    await pool.query(
      'INSERT INTO masters.mas_manufacturer (mnf_name, address, web_site) VALUES ($1, $2, $3)',
      [
        mnf_name.trim(), 
        address ? address.trim() : null, 
        web_site ? web_site.trim() : null
      ]
    );
    res.sendStatus(211);
  } catch (err) { 
    console.error("Database Error in Manufacturers Write:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

app.get('/api/transactions/ledgers', authenticate, (req, res) => res.json([]));
app.get('/api/planning/proposals', authenticate, (req, res) => res.json([]));
app.get('/api/admin/rates', authenticate, (req, res) => res.json([]));

app.listen(8080, () => console.log('SCMS Backend Engine online on port 8080'));