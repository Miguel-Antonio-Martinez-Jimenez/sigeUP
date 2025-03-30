const express = require('express');
const CalificacionesController = require('../controllers/calificaciones.controller');

const router = express.Router();

// Obtener una calificación específica
router.get('/:idKardex', CalificacionesController.obtenerCalificacionPorId);

// Obtener calificaciones (según rol)
router.get('/', CalificacionesController.obtenerCalificaciones);

// Crear nueva calificación (solo docentes y admin)
router.post('/', CalificacionesController.crearCalificacion);

// Editar calificación (solo docentes y admin)
router.put('/:idKardex', CalificacionesController.editarCalificacion);

module.exports = router;