const express = require('express');
const DatosPersonalesController = require('../controllers/Usuarios2.controller');

const router = express.Router();

// Obtener datos personales (según rol)
router.get('/', DatosPersonalesController.obtenerDatos);

// Actualizar datos personales
router.put('/', DatosPersonalesController.actualizarDatos);

// Crear nuevos datos personales (solo servicios escolares)
router.post('/', DatosPersonalesController.crearDatos);

// Eliminar datos personales (solo servicios escolares)
router.delete('/', DatosPersonalesController.eliminarDatos);

module.exports = router;