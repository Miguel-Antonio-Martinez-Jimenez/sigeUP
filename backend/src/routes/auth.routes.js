// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.get('/google', AuthController.googleAuth);
router.get('/google/callback', AuthController.googleAuthCallback);

module.exports = router;