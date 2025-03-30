const express = require('express');
const PermisosController = require('../controllers/permisos.controller');

const router = express.Router();

router.post('/permisos', PermisosController.obtenerPermisos);

module.exports = router;