const express = require('express');
const router = express.Router();
const { 
  isStudent, 
  isTeacher, 
  isDirector, 
  isSchoolServices, 
  isFinancialServices 
} = require('../middlewares/roleMiddleware');

// Importar controladores separados
const EstudianteController = require('../controllers/estudiante.controller');
const DocenteController = require('../controllers/docente.controller');
const DirectorController = require('../controllers/director.controller');
const ServiciosEscolaresController = require('../controllers/servicios_escolares.controller');
const ServiciosFinancierosController = require('../controllers/servicios_financieros.controller');

// Rutas académicas
router.post('/estudiante', isStudent, EstudianteController.getStudentData);
router.post('/docente', isTeacher, DocenteController.getTeacherData);
router.post('/director', isDirector, DirectorController.getDirectorData);

// Rutas administrativas
router.post('/servicios-escolares', isSchoolServices, ServiciosEscolaresController.getDashboard);
router.post('/servicios-financieros', isFinancialServices, ServiciosFinancierosController.getDashboard);

module.exports = router;