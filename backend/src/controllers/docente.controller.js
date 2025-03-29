const db = require('../models');

const DocenteController = {
  getTeacherData: async (req, res) => {
    try {
      const { user } = req;
      
      if (!user.userId) {
        return res.status(400).json({
          success: false,
          error: 'No se pudo identificar al docente'
        });
      }

      const teacher = await db.Docente.findByPk(user.userId, {
        include: [
          { model: db.DatosPersonales, as: 'DatosPersonales' },
          { model: db.DatosProfesor, as: 'DatosProfesionales' },
          {
            model: db.ProgramaEducativo,
            as: 'ProgramasEducativos',
            through: { attributes: [] }
          },
          {
            model: db.Clase,
            as: 'Clases',
            include: [
              { model: db.Materia },
              { model: db.Grupo }
            ]
          }
        ]
      });

      if (!teacher) {
        return res.status(404).json({ 
          success: false,
          error: 'Docente no encontrado en la base de datos' 
        });
      }

      const response = {
        success: true,
        role: user.role,
        data: {
          nombreCompleto: `${teacher.DatosPersonales.Nombre} ${teacher.DatosPersonales.ApellidoPaterno}`,
          gradoAcademico: teacher.GradoAcademico,
          cedula: teacher.DatosProfesionales?.Cedula || 'No registrada',
          programas: teacher.ProgramasEducativos.map(p => p.NombreCorto),
          clasesActuales: teacher.Clases.map(c => ({
            materia: c.Materia.Nombre,
            grupo: c.Grupo.Nombre
          }))
        }
      };

      return res.json(response);

    } catch (error) {
      console.error('Error en DocenteController:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno al obtener datos de docente',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = DocenteController;