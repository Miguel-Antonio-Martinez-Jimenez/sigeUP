const db = require('../models');
const EmailService = require('../services/validar_email.service');

const DatosPersonalesController = {
  // Obtener datos personales del usuario actual o de todos según rol
  obtenerDatos: async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido' 
        });
      }

      // Validar el usuario
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        return res.status(403).json(usuario);
      }

      let datos;
      
      switch(usuario.role) {
        case 'Estudiante':
          // Estudiantes solo pueden ver sus propios datos
          const alumno = await db.Alumno.findOne({
            where: { Matricula: usuario.data.matricula },
            include: [{
              model: db.DatosPersonales,
              as: 'DatosPersonales',
              attributes: { exclude: ['IdDatosPersonales'] }
            }]
          });

          if (!alumno) {
            return res.status(404).json({
              success: false,
              error: 'Alumno no encontrado'
            });
          }

          datos = [alumno.DatosPersonales];
          break;

        case 'Docente':
          // Docentes solo pueden ver sus propios datos
          const docente = await db.Docente.findOne({
            include: [{
              model: db.DatosPersonales,
              as: 'DatosPersonales',
              where: { CorreoPersonal: email },
              attributes: { exclude: ['IdDatosPersonales'] }
            }]
          });

          if (!docente) {
            return res.status(404).json({
              success: false,
              error: 'Docente no encontrado'
            });
          }

          datos = [docente.DatosPersonales];
          break;

        case 'Director':
          // Director puede ver todos los datos personales (solo lectura)
          datos = await db.DatosPersonales.findAll({
            include: [
              {
                model: db.Alumno,
                as: 'Alumno',
                attributes: ['Matricula', 'Estatus'],
                required: false
              },
              {
                model: db.Docente,
                as: 'Docente',
                attributes: ['IdDocente', 'GradoAcademico'],
                required: false
              }
            ],
            limit: 1000 // Limitar resultados para evitar sobrecarga
          });
          break;

        case 'Servicios Escolares':
          // Servicios escolares pueden ver todos los datos sin límite
          datos = await db.DatosPersonales.findAll({
            include: [
              {
                model: db.Alumno,
                as: 'Alumno',
                attributes: ['Matricula', 'Estatus'],
                required: false
              },
              {
                model: db.Docente,
                as: 'Docente',
                attributes: ['IdDocente', 'GradoAcademico'],
                required: false
              }
            ]
          });
          break;

        default:
          return res.status(403).json({
            success: false,
            error: 'Acceso no autorizado para este rol'
          });
      }

      res.json({
        success: true,
        count: datos.length,
        datos
      });

    } catch (error) {
      console.error('Error en obtenerDatos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener datos personales',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Actualizar datos personales
  actualizarDatos: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, idDatosPersonales, ...datosActualizar } = req.body;
      
      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido' 
        });
      }

      // Validar el usuario
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        await transaction.rollback();
        return res.status(403).json(usuario);
      }

      // Determinar el ID de datos personales a actualizar
      let idParaActualizar = idDatosPersonales;

      // Si no es servicios escolares, solo puede actualizar sus propios datos
      if (usuario.role !== 'Servicios Escolares') {
        let usuarioDB;
        
        if (usuario.role === 'Estudiante') {
          usuarioDB = await db.Alumno.findOne({
            where: { Matricula: usuario.data.matricula },
            transaction
          });
        } else if (usuario.role === 'Docente') {
          usuarioDB = await db.Docente.findOne({
            include: [{
              model: db.DatosPersonales,
              as: 'DatosPersonales',
              where: { CorreoPersonal: email }
            }],
            transaction
          });
        }

        if (!usuarioDB) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            error: 'Usuario no encontrado'
          });
        }

        // Forzar a que solo actualice sus propios datos
        idParaActualizar = usuarioDB.IdDatosPersonales;
      }

      // Validar que existan los datos personales
      const datosPersonales = await db.DatosPersonales.findByPk(idParaActualizar, { transaction });
      if (!datosPersonales) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Datos personales no encontrados'
        });
      }

      // Campos permitidos para actualización
      const camposPermitidos = [
        'Nombre',
        'ApellidoPaterno',
        'ApellidoMaterno',
        'FechaNacimiento',
        'CURP',
        'Sexo',
        'EstadoCivil',
        'Telefono',
        'Celular',
        'CorreoPersonal',
        'CorreoAlternativo',
        'Direccion',
        'Colonia',
        'Municipio',
        'Estado',
        'Pais',
        'CP',
        'ServicioMedico',
        'NumeroSeguroSocial'
      ];

      // Filtrar solo campos permitidos
      const datosFiltrados = {};
      Object.keys(datosActualizar).forEach(key => {
        if (camposPermitidos.includes(key)) {
          datosFiltrados[key] = datosActualizar[key];
        }
      });

      // Actualizar los datos
      await db.DatosPersonales.update(datosFiltrados, {
        where: { IdDatosPersonales: idParaActualizar },
        transaction
      });

      await transaction.commit();
      
      // Obtener los datos actualizados
      const datosActualizados = await db.DatosPersonales.findByPk(idParaActualizar);

      res.json({
        success: true,
        message: 'Datos personales actualizados correctamente',
        datos: datosActualizados
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en actualizarDatos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar datos personales',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Crear nuevos datos personales (solo servicios escolares)
  crearDatos: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, ...datosPersonales } = req.body;
      
      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido' 
        });
      }

      // Validar que solo servicios escolares pueden crear
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'No autorizado',
          message: 'Solo servicios escolares pueden crear datos personales'
        });
      }

      // Crear los datos personales
      const nuevosDatos = await db.DatosPersonales.create(datosPersonales, { transaction });

      await transaction.commit();
      
      res.status(201).json({
        success: true,
        message: 'Datos personales creados correctamente',
        datos: nuevosDatos
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en crearDatos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al crear datos personales',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Eliminar datos personales (solo servicios escolares)
  eliminarDatos: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, idDatosPersonales } = req.body;
      
      if (!email || !idDatosPersonales) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email e ID de datos personales son requeridos' 
        });
      }

      // Validar que solo servicios escolares pueden eliminar
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'No autorizado',
          message: 'Solo servicios escolares pueden eliminar datos personales'
        });
      }

      // Verificar que no esté asociado a un alumno o docente
      const asociadoAlumno = await db.Alumno.findOne({ 
        where: { IdDatosPersonales: idDatosPersonales },
        transaction
      });

      const asociadoDocente = await db.Docente.findOne({ 
        where: { IdDatosPersonales: idDatosPersonales },
        transaction
      });

      if (asociadoAlumno || asociadoDocente) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar',
          message: 'Los datos personales están asociados a un usuario'
        });
      }

      // Eliminar los datos personales
      const eliminados = await db.DatosPersonales.destroy({
        where: { IdDatosPersonales: idDatosPersonales },
        transaction
      });

      if (eliminados === 0) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Datos personales no encontrados'
        });
      }

      await transaction.commit();
      
      res.json({
        success: true,
        message: 'Datos personales eliminados correctamente'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en eliminarDatos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al eliminar datos personales',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = DatosPersonalesController;