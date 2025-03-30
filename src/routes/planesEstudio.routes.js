const express = require('express');
const PlanesEstudioController = require('../controllers/planesEstudio.controller');

const router = express.Router();
// Ver un plan específico
router.get('/:id', PlanesEstudioController.verPlan);

// Listar planes (Director: solo su programa | Servicios Escolares: todos)
router.get('/', PlanesEstudioController.listarPlanes);

// Crear plan (SOLO Servicios Escolares)
router.post('/', PlanesEstudioController.crearPlan);

// Editar plan (Director: su programa | Servicios Escolares: todos)
router.put('/:id', PlanesEstudioController.editarPlan);

module.exports = router;