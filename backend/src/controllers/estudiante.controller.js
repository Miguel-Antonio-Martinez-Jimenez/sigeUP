const db = require('../models');

const EstudianteController = {
  getStudentData: async (req, res) => {
    try {
      const { user } = req;
      
      if (!user.userId && !user.matricula) {
        return res.status(400).json({
          success: false,
          error: 'No se pudo identificar al estudiante'
        });
      }

      const whereClause = user.matricula 
        ? { Matricula: user.matricula }
        : { id: user.userId };

      const student = await db.Alumno.findOne({
        where: whereClause,
        include: [
          { model: db.DatosPersonales, as: 'DatosPersonales' },
          { model: db.ProgramaEducativo, as: 'ProgramaEducativo' },
          { 
            model: db.Kardex, 
            as: 'Kardex',
            include: [{
              model: db.Clase,
              as: 'Clase',
              include: [{
                model: db.Curso,
                as: 'Curso',
                include: [{
                  model: db.Materia,
                  as: 'Materia'
                }]
              }]
            }]
          }
        ]
      });

      if (!student) {
        return res.status(404).json({ 
          success: false,
          error: 'Estudiante no encontrado en la base de datos' 
        });
      }

      const response = {
        success: true,
        role: user.role,
        data: {
          matricula: student.Matricula,
          nombreCompleto: `${student.DatosPersonales.Nombre} ${student.DatosPersonales.ApellidoPaterno}`,
          programa: student.ProgramaEducativo.NombreCorto,
          estatus: student.Estatus,
          historialAcademico: student.Kardex.map(k => ({
            materia: k.Clase?.Curso?.Materia?.Nombre || 'Materia no disponible',
            calificacion: k.CalificacionFinal,
            acreditado: k.Acreditado
          }))
        }
      };

      return res.json(response);

    } catch (error) {
      console.error('Error en EstudianteController:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno al obtener datos de estudiante',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = EstudianteController;