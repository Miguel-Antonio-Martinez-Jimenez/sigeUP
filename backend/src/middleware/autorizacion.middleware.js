const db = require('../models');
const EmailService = require('../services/validar_email.service');

class UsersController {
  // Obtener datos del usuario actual (para todos los roles)
  async getMyData(req, res) {
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

      let userData;
      switch(user.role) {
        case 'Alumno':
          userData = await this.getStudentData(user.data.matricula);
          break;
        case 'Docente':
          userData = await this.getTeacherData(email);
          break;
        default:
          userData = await this.getFullUserData(email, user.role);
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
      console.error('Error en getMyData:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener datos'
      });
    }
  }

  // Actualizar datos personales (alumno/docente)
  async updateMyData(req, res) {
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

      // Solo alumnos y docentes pueden actualizar sus datos
      if (!['Alumno', 'Docente'].includes(user.role)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para esta acción'
        });
      }

      const result = await this.updatePersonalData(email, data, user.role, transaction);

      await transaction.commit();
      res.json({
        success: true,
        message: 'Datos actualizados correctamente',
        data: result
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en updateMyData:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar datos' 
      });
    }
  }

  // Métodos auxiliares
  async getStudentData(matricula) {
    return await db.Alumno.findOne({
      where: { Matricula: matricula },
      include: [
        { 
          model: db.DatosPersonales, 
          as: 'DatosPersonales',
          attributes: { exclude: ['IdDatosPersonales', 'password'] }
        },
        {
          model: db.ProgramaEducativo,
          as: 'ProgramaEducativo',
          attributes: ['NombreCorto']
        }
      ],
      attributes: ['Matricula', 'Estatus', 'AnioIngreso']
    });
  }

  async getTeacherData(email) {
    return await db.Docente.findOne({
      include: [
        { 
          model: db.DatosPersonales, 
          as: 'DatosPersonales',
          where: { CorreoPersonal: email },
          attributes: { exclude: ['IdDatosPersonales', 'password'] }
        },
        {
          model: db.DatosProfesor,
          as: 'DatosProfesionales',
          attributes: ['Grado', 'Cedula']
        }
      ],
      attributes: ['IdDocente', 'GradoAcademico']
    });
  }

  async getFullUserData(email, role) {
    if (role === 'Director') {
      return await db.Director.findOne({
        where: { CorreoDirector: email },
        include: [{
          model: db.ProgramaEducativo,
          as: 'ProgramasEducativos',
          attributes: ['NombreCorto']
        }]
      });
    }
    // Servicios Escolares puede necesitar datos adicionales
    return { email, role, fullAccess: true };
  }

  async updatePersonalData(email, data, role, transaction) {
    const allowedFields = {
      telefono: 'Telefono',
      direccion: 'Direccion',
      servicioMedico: 'ServicioMedico'
    };

    const updateData = {};
    Object.keys(data).forEach(key => {
      if (allowedFields[key]) {
        updateData[allowedFields[key]] = data[key];
      }
    });

    if (role === 'Alumno') {
      const student = await db.Alumno.findOne({
        where: { Matricula: data.matricula },
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

module.exports = new UsersController();