const pool = require('../config/db');


exports.getStores = async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_store_details ORDER BY store_id ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getEmployees = async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_employee ORDER BY emp_code ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMaterials = async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_material ORDER BY material_id ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getSuppliers = async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_supplier ORDER BY supplier_id ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getManufacturers = async (req, res) => {
  try {
    const data = await pool.query('SELECT * FROM masters.mas_manufacturer ORDER BY mnf_id ASC');
    res.json(data.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- POST WRITE REQUESTS (WITH IDENTITY PARSING FIXES) ---
exports.addStore = async (req, res) => {
  const { store_code, store_name, store_type, officer_incharger_name, officer_incharger_mobile_no, officer_incharger_email } = req.body;
  try {
    await pool.query(
      'INSERT INTO masters.mas_store_details (store_code, store_name, store_type, officer_incharger_name, officer_incharger_mobile_no, officer_incharger_email) VALUES ($1, $2, $3, $4, $5, $6)',
      [store_code, store_name, store_type, officer_incharger_name, officer_incharger_mobile_no, officer_incharger_email]
    );
    res.sendStatus(211);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addEmployee = async (req, res) => {
  const { emp_name, emp_designation, emp_contact_no, emp_emailid, store_code } = req.body;
  try {
    await pool.query(
      'INSERT INTO masters.mas_employee (emp_name, emp_designation, emp_contact_no, emp_emailid, store_code) VALUES ($1, $2, $3, $4, $5)',
      [emp_name, emp_designation, emp_contact_no, emp_emailid, store_code]
    );
    res.sendStatus(211);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addMaterial = async (req, res) => {
  const { material_code, material_description, bis_code, hsn_code } = req.body; 
  if (!material_code || !material_description) {
    return res.status(400).json({ error: "Missing mandatory fields: code or description." });
  }
  try {
    await pool.query(
      'INSERT INTO masters.mas_material (material_code, material_description, bis_code, hsn_code) VALUES ($1, $2, $3, $4)',
      [material_code.trim(), material_description.trim(), bis_code ? bis_code.trim() : null, hsn_code ? hsn_code.trim() : null]
    );
    res.sendStatus(211);
  } catch (err) { 
    console.error("Database Error in Materials Write:", err.message);
    res.status(500).json({ error: err.message }); 
  }
};

exports.addSupplier = async (req, res) => {
  const { supplier_name, supplier_description, supplier_address, supplier_contact_no, supplier_email } = req.body;
  if (!supplier_name) {
    return res.status(400).json({ error: "Missing mandatory fields: supplier_name." });
  }
  try {
    await pool.query(
      'INSERT INTO masters.mas_supplier (supplier_name, supplier_description, supplier_address, supplier_contact_no, supplier_email) VALUES ($1, $2, $3, $4, $5)',
      [supplier_name.trim(), supplier_description ? supplier_description.trim() : null, supplier_address ? supplier_address.trim() : null, supplier_contact_no ? supplier_contact_no.trim() : null, supplier_email ? supplier_email.trim() : null]
    );
    res.sendStatus(211);
  } catch (err) { 
    console.error("Database Error in Suppliers Write:", err.message);
    res.status(500).json({ error: err.message }); 
  }
};

exports.addManufacturer = async (req, res) => {
  const { mnf_name, address, web_site } = req.body; 
  if (!mnf_name) {
    return res.status(400).json({ error: "Missing mandatory fields: mnf_name." });
  }
  try {
    await pool.query(
      'INSERT INTO masters.mas_manufacturer (mnf_name, address, web_site) VALUES ($1, $2, $3)',
      [mnf_name.trim(), address ? address.trim() : null, web_site ? web_site.trim() : null]
    );
    res.sendStatus(211);
  } catch (err) { 
    console.error("Database Error in Manufacturers Write:", err.message);
    res.status(500).json({ error: err.message }); 
  }
};