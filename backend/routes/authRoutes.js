const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/captcha', authController.getCaptcha);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;