const express = require('express');
const router = express.Router();
const gruposController = require('..//controllers/gestiongrupo.controller');

// Obtener un grupo específico
router.get('/:id', gruposController.verGrupo);

// Listar todos los grupos
router.get('/', gruposController.listarGrupo);

// Crear un nuevo grupo
router.post('/', gruposController.crearGrupo);

// Actualizar un grupo existente
router.put('/:id', gruposController.editarGrupo);

module.exports = router;