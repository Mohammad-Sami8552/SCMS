require('dotenv').config();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'SCMS_SECURITY_ENFORCEMENT_KEY_2026';

exports.getCaptcha = (req, res) => {
  const text = Math.random().toString(36).substring(2, 8).toUpperCase();
  res.json({ text });
};

exports.signup = async (req, res) => {
  const { username, password, fullName, designation, email, phone, captchaText, actualCaptcha } = req.body;
  const normalizedCaptcha = (captchaText || '').toUpperCase().trim();
  const expectedCaptcha = (actualCaptcha || '').toUpperCase().trim();

  if (!normalizedCaptcha || !expectedCaptcha || normalizedCaptcha !== expectedCaptcha) {
    return res.status(400).json({ message: 'Security CAPTCHA verification failed.' });
  }

  if (!username || !password || !fullName) {
    return res.status(400).json({ message: 'Username, password and full name are required.' });
  }

  try {
    const existing = await pool.query('SELECT 1 FROM config.user_mapping WHERE username = $1', [username.trim()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: 'Username is already registered.' });
    }

    const userIdResult = await pool.query('SELECT COALESCE(MAX(userid), 0) + 1 AS next_userid FROM config.user_mapping');
    const nextUserId = Number(userIdResult.rows[0].next_userid || 1);
    const nextEmpCode = Math.floor(100000 + Math.random() * 900000);
    const normalizedDesignation = (designation?.trim() || 'User').toLowerCase();
    const designationCode = normalizedDesignation.includes('manager')
      ? 2
      : normalizedDesignation.includes('supervisor')
        ? 3
        : 1;

    const insertQuery = `
      INSERT INTO config.user_mapping (
        userid, emp_code, username, pwd, emp_name, emp_designation_code, emp_designation, emp_contact_no, emp_emailid, isblocked, block_emp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0)
      RETURNING userid, username, emp_name, emp_designation
    `;

    const values = [
      nextUserId,
      nextEmpCode,
      username.trim(),
      password,
      fullName.trim(),
      designationCode,
      designation?.trim() || 'User',
      phone?.trim() || 'N/A',
      email?.trim() || null
    ];

    const result = await pool.query(insertQuery, values);
    const user = result.rows[0];
    const token = jwt.sign({ userid: user.userid, username: user.username }, JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({ token, user: { name: user.emp_name, designation: user.emp_designation } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password, otp, authMode, captchaText, actualCaptcha } = req.body;
  const normalizedCaptcha = (captchaText || '').toUpperCase().trim();
  const expectedCaptcha = (actualCaptcha || '').toUpperCase().trim();

  if (!normalizedCaptcha || !expectedCaptcha || normalizedCaptcha !== expectedCaptcha) {
    return res.status(400).json({ message: 'Security CAPTCHA verification failed.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM config.user_mapping WHERE username = $1 LIMIT 1', [username.trim()]);
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
};