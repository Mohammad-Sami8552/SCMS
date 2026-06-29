const pool = require('./config/db');
pool.query("INSERT INTO config.user_mapping (userid, emp_code, username, pwd, emp_name, emp_designation_code, emp_designation, emp_contact_no, emp_emailid, isblocked, block_emp) VALUES (999999, 123456, 'manualtest', 'pw', 'Manual Test', 1, 'User', 'N/A', NULL, 0, 0) RETURNING userid")
  .then((r) => {
    console.log(JSON.stringify(r.rows));
    return pool.end();
  })
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
