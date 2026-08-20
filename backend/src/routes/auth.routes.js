const express = require('express');
const authController = require('../controllers/auth.controllers');

const router = express.Router();

router.post('/signup', authController.signIn);
router.post('/login', authController.login);

module.exports = router;
