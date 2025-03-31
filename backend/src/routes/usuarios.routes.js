const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario2.controller');

// Obtener mis datos personales
router.get('/mis-datos', async (req, res) => {
  await usuarioController.obtenerMisDatos(req, res);
});

// Actualizar mis datos personales
router.put('/mis-datos', async (req, res) => {
  await usuarioController.actualizarMisDatos(req, res);
});

// Obtener listado de alumnos (paginado)
router.get('/alumnos', async (req, res) => {
  await usuarioController.obtenerAlumno(req, res);
});

// Crear un nuevo usuario (alumno o docente)
router.post('/crear', async (req, res) => {
  await usuarioController.crearUsuario(req, res);
});

// Actualizar datos de otro usuario
router.put('/actualizar', async (req, res) => {
  await usuarioController.actualizarOtroUsuario(req, res);
});

// Eliminar un usuario
router.delete('/eliminar', async (req, res) => {
  await usuarioController.eliminarUsuario(req, res);
});

module.exports = router;