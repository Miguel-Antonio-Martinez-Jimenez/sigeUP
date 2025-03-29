const express = require('express');
const EmailController = require('../controllers/email.controller');

const router = express.Router();

// Ruta unificada para validar cualquier tipo de email
router.post('/validar-email', EmailController.validarEmail);

module.exports = router;