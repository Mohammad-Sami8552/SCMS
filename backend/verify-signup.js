const auth = require('./controllers/authController');

const req = {
  body: {
    username: 'verifyuser1',
    password: 'Test1234',
    fullName: 'Verify User',
    designation: 'Engineer',
    email: 'verify@example.com',
    phone: '1234567890',
    captchaText: 'A5K9R',
    actualCaptcha: 'A5K9R'
  }
};

const res = {
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    console.log(JSON.stringify({ statusCode: this.statusCode, payload }, null, 2));
    process.exit(0);
  }
};

auth.signup(req, res).catch((err) => {
  console.error(err);
  process.exit(1);
});
