const db = require('../models');

const DirectorController = {
  getDirectorData: async (req, res) => {
    try {
      const { user } = req;
      
      if (!user.userId) {
        return res.status(400).json({
          success: false,
          error: 'No se pudo identificar al director'
        });
      }

      const director = await db.Director.findByPk(user.userId, {
        include: [
          {
            model: db.ProgramaEducativo,
            as: 'ProgramasEducativos',
            attributes: ['IdProgramaEducativo', 'NombreCorto', 'NombreProgramaEducativo'],
            include: [
              { 
                model: db.Alumno, 
                as: 'Alumnos',
                attributes: ['Matricula']
              },
              { 
                model: db.Docente,
                as: 'Docentes',
                through: { attributes: [] },
                attributes: ['IdDocente']
              }
            ]
          }
        ]
      });

      if (!director) {
        return res.status(404).json({ 
          success: false,
          error: 'Director no encontrado en la base de datos' 
        });
      }

      // Calcular estadísticas
      const stats = {
        totalProgramas: director.ProgramasEducativos.length,
        totalAlumnos: director.ProgramasEducativos.reduce((sum, p) => sum + (p.Alumnos?.length || 0), 0),
        totalDocentes: director.ProgramasEducativos.reduce((sum, p) => sum + (p.Docentes?.length || 0), 0)
      };

      const response = {
        success: true,
        role: user.role,
        data: {
          nombre: director.NombreDirector,
          email: director.CorreoDirector,
          programas: director.ProgramasEducativos.map(p => ({
            nombre: p.NombreProgramaEducativo,
            alumnos: p.Alumnos?.length || 0,
            docentes: p.Docentes?.length || 0
          })),
          estadisticas: stats
        }
      };

      return res.json(response);

    } catch (error) {
      console.error('Error en DirectorController:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno al obtener datos de director',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = DirectorController;