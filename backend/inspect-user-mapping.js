const pool = require('./config/db');
pool.query('SELECT * FROM config.user_mapping LIMIT 1')
  .then((r) => {
    console.log(JSON.stringify(r.rows[0], null, 2));
    pool.end();
  })
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
