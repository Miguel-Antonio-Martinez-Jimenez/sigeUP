const express = require('express');
const PeriodosController = require('../controllers/periodos.controller');

const router = express.Router();

// CRUD completo para periodos (solo Servicios Escolares)
router.post('/', PeriodosController.crearPeriodo);
router.get('/', PeriodosController.obtenerPeriodos);
router.get('/:id', PeriodosController.obtenerPeriodoPorId);
router.put('/:id', PeriodosController.actualizarPeriodo);
router.delete('/:id', PeriodosController.eliminarPeriodo);

// Ruta adicional para activar/desactivar periodo
router.put('/:id/toggle-activo', PeriodosController.togglePeriodoActivo);

module.exports = router;