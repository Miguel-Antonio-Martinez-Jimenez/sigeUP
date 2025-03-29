const db = require('../models');

class EmailService {
  static programasValidos = {
    ing: ['software', 'biomedica', 'biotecnologia', 'financiera'],
    lic: ['gestion', 'terapiafisica']
  };

  static async validateStudent(email) {
    try {
      const matricula = email.split('@')[0];
      const alumno = await db.Alumno.findOne({
        where: { Matricula: matricula },
        include: [
          { model: db.DatosPersonales, as: 'DatosPersonales' },
          { model: db.ProgramaEducativo, as: 'ProgramaEducativo' }
        ]
      });
      
      return alumno ? { 
        success: true, 
        data: {
          id: alumno.id,
          Matricula: alumno.Matricula,
          DatosPersonales: alumno.DatosPersonales,
          ProgramaEducativo: alumno.ProgramaEducativo
        } 
      } : { success: false };
    } catch (error) {
      console.error('Error validando estudiante:', error);
      return { success: false, error: 'Error al validar estudiante' };
    }
  }

  static async validateDirector(email) {
    try {
      const director = await db.Director.findOne({ 
        where: { CorreoDirector: email },
        include: [
          { 
            model: db.ProgramaEducativo, 
            as: 'ProgramasEducativos',
            attributes: ['IdProgramaEducativo', 'NombreCorto', 'NombreProgramaEducativo']
          }
        ],
        attributes: ['IdDirector', 'NombreDirector', 'CorreoDirector']
      });

      if (!director) return { success: false };

      // Validar que el programa sea válido
      const dominio = email.split('@')[0].split('.')[1];
      const tipoPrograma = email.split('@')[0].split('.')[0];
      
      if (!this.programasValidos[tipoPrograma] || 
          !this.programasValidos[tipoPrograma].includes(dominio)) {
        return { 
          success: false,
          error: 'Programa educativo no válido para director'
        };
      }

      return { 
        success: true, 
        data: {
          id: director.IdDirector,
          NombreDirector: director.NombreDirector,
          CorreoDirector: director.CorreoDirector,
          ProgramasEducativos: director.ProgramasEducativos
        },
        programaValido: dominio
      };
    } catch (error) {
      console.error('Error validando director:', error);
      return { success: false, error: 'Error al validar director' };
    }
  }

  static async validateTeacher(email) {
    try {
      const [firstName, lastName] = email.split('@')[0].split('.');
      
      // Primero buscamos en DatosPersonales
      const datosPersonales = await db.DatosPersonales.findOne({
        where: {
          Nombre: firstName,
          ApellidoPaterno: lastName
        }
      });

      if (!datosPersonales) {
        return { 
          success: false,
          error: 'Datos personales no encontrados',
          nombre: firstName,
          apellido: lastName
        };
      }

      // Luego buscamos el docente relacionado
      const docente = await db.Docente.findOne({
        where: { IdDatosPersonales: datosPersonales.IdDatosPersonales },
        include: [
          { model: db.DatosPersonales, as: 'DatosPersonales' },
          { model: db.DatosProfesor, as: 'DatosProfesionales' }
        ],
        attributes: ['IdDocente', 'GradoAcademico']
      });

      if (!docente) {
        return { 
          success: false,
          error: 'Docente no registrado en el sistema',
          nombre: firstName,
          apellido: lastName,
          datosPersonalesExisten: true
        };
      }

      return { 
        success: true, 
        data: {
          id: docente.IdDocente,
          GradoAcademico: docente.GradoAcademico,
          DatosPersonales: docente.DatosPersonales,
          DatosProfesionales: docente.DatosProfesionales
        },
        nombreCompleto: `${docente.DatosPersonales.Nombre} ${docente.DatosPersonales.ApellidoPaterno}`
      };
    } catch (error) {
      console.error('Error validando docente:', error);
      return { 
        success: false, 
        error: 'Error al validar docente',
        details: error.message
      };
    }
  }

  static async identifyEmailRole(email) {
    if (!email.endsWith('@upqroo.edu.mx')) {
      return { 
        success: false,
        error: 'Dominio no válido',
        message: 'El email debe terminar con @upqroo.edu.mx'
      };
    }

    // Emails predefinidos
    const predefined = {
      'servicios.escolares@upqroo.edu.mx': 'Servicios Escolares',
      'servicios.financieros@upqroo.edu.mx': 'Servicios Financieros'
    };

    if (predefined[email]) {
      return { 
        success: true,
        role: predefined[email],
        isAdmin: true,
        message: 'Email administrativo reconocido'
      };
    }

    // Patrones de validación
    const patterns = {
      director: /^(ing|lic)\.([a-z]+)@upqroo\.edu\.mx$/i,
      teacher: /^([a-z]+)\.([a-z]+)@upqroo\.edu\.mx$/i,
      student: /^(\d{7,9})@upqroo\.edu\.mx$/i
    };

    try {
      // Validación para directores
      if (patterns.director.test(email)) {
        const result = await this.validateDirector(email);
        
        if (!result.success) {
          return {
            success: false,
            role: 'Director',
            message: result.error || 'Director no registrado en el sistema'
          };
        }

        return {
          success: true,
          role: 'Director',
          isAdmin: false,
          data: {
            id: result.data.id,
            nombre: result.data.NombreDirector,
            email: result.data.CorreoDirector,
            programas: result.data.ProgramasEducativos
          },
          message: 'Director validado correctamente'
        };
      }

      // Validación para docentes
      // Validación para docentes
if (patterns.teacher.test(email)) {
  const result = await this.validateTeacher(email);
  
  if (!result.success) {
    const [firstName, lastName] = email.split('@')[0].split('.');
    const response = {
      success: false,
      role: 'Docente',
      message: result.error,
      nombre: firstName,
      apellido: lastName
    };
    
    if (result.datosPersonalesExisten) {
      response.message = 'Existen datos personales pero no registro de docente';
    }
    
    return response;
  }

  return {
    success: true,
    role: 'Docente',
    isAdmin: false,
    data: {
      id: result.data.id,
      nombreCompleto: result.nombreCompleto,
      grado: result.data.GradoAcademico,
      cedula: result.data.DatosProfesionales?.Cedula || 'No registrada',
      email: email
    },
    message: 'Docente validado correctamente'
  };
}

      // Validación para estudiantes
      if (patterns.student.test(email)) {
        const result = await this.validateStudent(email);
        
        if (!result.success) {
          return {
            success: false,
            role: 'Estudiante',
            message: result.error || 'Estudiante no registrado en el sistema',
            matricula: email.split('@')[0]
          };
        }

        return {
          success: true,
          role: 'Estudiante',
          isAdmin: false,
          data: {
            id: result.data.id,
            matricula: result.data.Matricula,
            nombreCompleto: `${result.data.DatosPersonales.Nombre} ${result.data.DatosPersonales.ApellidoPaterno}`,
            programa: result.data.ProgramaEducativo?.NombreCorto,
            email: email
          },
          message: 'Estudiante validado correctamente'
        };
      }

      return { 
        success: false,
        error: 'Formato no reconocido',
        message: 'El formato del email no corresponde a ningún rol válido'
      };
    } catch (error) {
      console.error('Error en validación de email:', error);
      return {
        success: false,
        error: 'Error interno',
        message: 'Ocurrió un error al validar el email'
      };
    }
  }
}

module.exports = EmailService;