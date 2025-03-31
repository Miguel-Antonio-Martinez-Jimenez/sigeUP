const db = require('../models');
const EmailService = require('../services/validar_email.service');
const { Op } = require('sequelize');

class UsuarioController {
  // Obtener mis datos personales
  async obtenerMisDatos(req, res) {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido'
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        return res.status(403).json(user);
      }

      if (!['Estudiante', 'Docente'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Solo estudiantes y docentes pueden acceder a esta función'
        });
      }

      let userData;
      if (user.role === 'Estudiante') {
        userData = await this._getStudentData(user.data.matricula);
      } else {
        userData = await this._getTeacherData(email);
      }

      if (!userData) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        role: user.role,
        data: userData
      });

    } catch (error) {
      console.error('Error en obtenerMisDatos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener datos del usuario'
      });
    }
  }

  // Actualizar mis datos personales
  async actualizarMisDatos(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, ...data } = req.body;
      
      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido' 
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        await transaction.rollback();
        return res.status(403).json(user);
      }

      if (!['Estudiante', 'Docente'].includes(user.role)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo estudiantes y docentes pueden actualizar sus datos'
        });
      }

      const result = await this._updatePersonalData(email, data, user.role, transaction);

      await transaction.commit();
      res.json({
        success: true,
        message: 'Datos actualizados correctamente',
        data: result
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en actualizarMisDatos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar datos del usuario' 
      });
    }
  }

  // Obtener listado de estudiantes (paginado)
  async obtenerEstudiantes(req, res) {
    try {
      const { email, page = 1, limit = 10, programa } = req.query;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido'
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        return res.status(403).json(user);
      }

      if (!['Director', 'Servicios Escolares'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para ver estudiantes'
        });
      }

      // Configurar filtros
      const filters = {};
      
      // Director solo puede ver estudiantes de su programa
      if (user.role === 'Director') {
        filters.IdProgramaEducativo = user.data.programaEducativo;
      } else if (programa) {
        // Servicios Escolares puede filtrar por programa si se especifica
        filters.IdProgramaEducativo = programa;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await db.Alumno.findAndCountAll({
        where: filters,
        include: [
          { 
            model: db.DatosPersonales, 
            as: 'DatosPersonales',
            attributes: { exclude: ['password'] }
          },
          {
            model: db.ProgramaEducativo,
            as: 'ProgramaEducativo',
            attributes: ['NombreCorto', 'NombreProgramaEducativo']
          }
        ],
        attributes: ['Matricula', 'Estatus', 'AnioIngreso'],
        limit: parseInt(limit),
        offset: offset,
        order: [['Matricula', 'ASC']]
      });

      res.json({
        success: true,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        data: rows
      });

    } catch (error) {
      console.error('Error en obtenerEstudiantes:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener listado de estudiantes'
      });
    }
  }

  // Crear un nuevo usuario (Alumno o Docente)
  async crearUsuario(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, tipoUsuario, datosPersonales, datosEspecificos } = req.body;
      
      if (!email || !tipoUsuario || !datosPersonales) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email, tipoUsuario y datosPersonales son requeridos'
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        await transaction.rollback();
        return res.status(403).json(user);
      }

      if (user.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares puede crear usuarios'
        });
      }

      if (!['Alumno', 'Docente'].includes(tipoUsuario)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Tipo de usuario no válido'
        });
      }

      // Validar matrícula única para alumnos
      if (tipoUsuario === 'Alumno' && datosEspecificos.Matricula) {
        const existeAlumno = await db.Alumno.findOne({
          where: { Matricula: datosEspecificos.Matricula },
          transaction
        });
        
        if (existeAlumno) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'La matrícula ya está registrada'
          });
        }
      }

      // Crear datos personales primero
      const datosPersonalesCreados = await db.DatosPersonales.create(datosPersonales, { transaction });

      // Crear usuario específico según el tipo
      let usuarioCreado;
      if (tipoUsuario === 'Alumno') {
        usuarioCreado = await db.Alumno.create({
          ...datosEspecificos,
          IdDatosPersonales: datosPersonalesCreados.IdDatosPersonales
        }, { transaction });
      } else {
        usuarioCreado = await db.Docente.create({
          ...datosEspecificos,
          IdDatosPersonales: datosPersonalesCreados.IdDatosPersonales
        }, { transaction });

        // Si es docente, también crear datos profesionales si se proporcionan
        if (datosEspecificos.datosProfesionales) {
          await db.DatosProfesor.create({
            ...datosEspecificos.datosProfesionales,
            IdDocente: usuarioCreado.IdDocente
          }, { transaction });
        }
      }

      await transaction.commit();
      res.status(201).json({
        success: true,
        message: `${tipoUsuario} creado correctamente`,
        data: {
          datosPersonales: datosPersonalesCreados,
          [tipoUsuario.toLowerCase()]: usuarioCreado
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en crearUsuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al crear usuario' 
      });
    }
  }

  // Actualizar datos de otro usuario
  async actualizarOtroUsuario(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, matricula, idDocente, ...data } = req.body;
      
      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido' 
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        await transaction.rollback();
        return res.status(403).json(user);
      }

      if (user.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares puede actualizar otros usuarios'
        });
      }

      // Determinar si es alumno o docente
      let usuario;
      if (matricula) {
        usuario = await db.Alumno.findOne({
          where: { Matricula: matricula },
          transaction
        });
      } else if (idDocente) {
        usuario = await db.Docente.findOne({
          where: { IdDocente: idDocente },
          transaction
        });
      } else {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Se requiere matricula o idDocente'
        });
      }

      if (!usuario) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Actualizar datos personales
      if (data.datosPersonales) {
        await db.DatosPersonales.update(data.datosPersonales, {
          where: { IdDatosPersonales: usuario.IdDatosPersonales },
          transaction
        });
      }

      // Actualizar datos específicos
      if (data.datosEspecificos) {
        if (matricula) {
          await db.Alumno.update(data.datosEspecificos, {
            where: { Matricula: matricula },
            transaction
          });
        } else {
          await db.Docente.update(data.datosEspecificos, {
            where: { IdDocente: idDocente },
            transaction
          });

          // Actualizar datos profesionales si existen
          if (data.datosProfesionales) {
            await db.DatosProfesor.update(data.datosProfesionales, {
              where: { IdDocente: idDocente },
              transaction
            });
          }
        }
      }

      await transaction.commit();
      res.json({
        success: true,
        message: 'Usuario actualizado correctamente'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en actualizarOtroUsuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar usuario' 
      });
    }
  }

  // Eliminar un usuario
  async eliminarUsuario(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, matricula, idDocente } = req.body;
      
      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido' 
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        await transaction.rollback();
        return res.status(403).json(user);
      }

      if (user.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares puede eliminar usuarios'
        });
      }

      // Determinar si es alumno o docente
      let usuario;
      if (matricula) {
        usuario = await db.Alumno.findOne({
          where: { Matricula: matricula },
          include: [{ model: db.DatosPersonales, as: 'DatosPersonales' }],
          transaction
        });
      } else if (idDocente) {
        usuario = await db.Docente.findOne({
          where: { IdDocente: idDocente },
          include: [
            { model: db.DatosPersonales, as: 'DatosPersonales' },
            { model: db.DatosProfesor, as: 'DatosProfesionales' }
          ],
          transaction
        });
      } else {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Se requiere matricula o idDocente'
        });
      }

      if (!usuario) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Eliminar usuario específico primero
      if (matricula) {
        await db.Alumno.destroy({
          where: { Matricula: matricula },
          transaction
        });
      } else {
        // Eliminar datos profesionales primero si existen
        if (usuario.DatosProfesionales) {
          await db.DatosProfesor.destroy({
            where: { IdDocente: idDocente },
            transaction
          });
        }
        
        await db.Docente.destroy({
          where: { IdDocente: idDocente },
          transaction
        });
      }

      // Finalmente eliminar datos personales
      await db.DatosPersonales.destroy({
        where: { IdDatosPersonales: usuario.IdDatosPersonales },
        transaction
      });

      await transaction.commit();
      res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en eliminarUsuario:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al eliminar usuario' 
      });
    }
  }

  // Métodos auxiliares privados
  async _getStudentData(matricula) {
    return await db.Alumno.findOne({
      where: { Matricula: matricula },
      include: [
        { 
          model: db.DatosPersonales, 
          as: 'DatosPersonales',
          attributes: { exclude: ['password'] }
        },
        {
          model: db.ProgramaEducativo,
          as: 'ProgramaEducativo',
          attributes: ['NombreCorto', 'NombreProgramaEducativo']
        },
        {
          model: db.Contacto,
          as: 'Contactos'
        }
      ],
      attributes: ['Matricula', 'Estatus', 'AnioIngreso', 'PromedioBachillerato']
    });
  }

  async _getTeacherData(email) {
    return await db.Docente.findOne({
      include: [
        { 
          model: db.DatosPersonales, 
          as: 'DatosPersonales',
          where: { CorreoPersonal: email },
          attributes: { exclude: ['password'] }
        },
        {
          model: db.DatosProfesor,
          as: 'DatosProfesionales',
          attributes: ['Grado', 'Cedula']
        },
        {
          model: db.ListaDocente,
          as: 'ProgramasEducativos',
          include: [{
            model: db.ProgramaEducativo,
            as: 'ProgramaEducativo',
            attributes: ['NombreCorto']
          }]
        }
      ],
      attributes: ['IdDocente', 'GradoAcademico']
    });
  }

  async _updatePersonalData(email, data, role, transaction) {
    const allowedFields = {
      telefono: 'Telefono',
      direccion: 'Direccion',
      servicioMedico: 'ServicioMedico',
      estadoCivil: 'EstadoCivil',
      correoPersonal: 'CorreoPersonal'
    };

    const updateData = {};
    Object.keys(data).forEach(key => {
      if (allowedFields[key]) {
        updateData[allowedFields[key]] = data[key];
      }
    });

    if (role === 'Estudiante') {
      const student = await db.Alumno.findOne({
        where: { Matricula: email.split('@')[0] },
        transaction
      });
      return await db.DatosPersonales.update(updateData, {
        where: { IdDatosPersonales: student.IdDatosPersonales },
        transaction
      });
    } else { // Docente
      const teacher = await db.Docente.findOne({
        include: [{
          model: db.DatosPersonales,
          as: 'DatosPersonales',
          where: { CorreoPersonal: email }
        }],
        transaction
      });
      return await db.DatosPersonales.update(updateData, {
        where: { IdDatosPersonales: teacher.IdDatosPersonales },
        transaction
      });
    }
  }
}

module.exports = new UsuarioController();
