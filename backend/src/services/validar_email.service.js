const db = require('../models');

class EmailService {
  // Programas educativos válidos por tipo
  static programasValidos = {
    ing: ['software', 'biomedica', 'biotecnologia', 'financiera'],
    lic: ['gestion', 'terapiafisica']
  };

  static async validateStudent(email) {
    const matricula = email.split('@')[0];
    return await db.Alumno.findOne({
      where: { Matricula: matricula },
      include: [
        { model: db.DatosPersonales, as: 'DatosPersonales' },
        { model: db.ProgramaEducativo, as: 'ProgramaEducativo' }
      ]
    });
  }

  static async validateDirector(email) {
    // Buscar director directamente por correo
    return await db.Director.findOne({ 
      where: { 
        CorreoDirector: email
      },
      include: [
        { 
          model: db.ProgramaEducativo, 
          as: 'ProgramasEducativos', // Usar el alias correcto en plural
          attributes: ['NombreCorto', 'NombreProgramaEducativo'] // Campos que necesitas
        }
      ]
    });
}

  static async validateTeacher(email) {
    const [firstName, lastName] = email.split('@')[0].split('.');
    
    const docente = await db.Docente.findOne({
      include: [{
        model: db.DatosPersonales,
        as: 'DatosPersonales',
        where: {
          Nombre: {
            [db.Sequelize.Op.like]: `${this.capitalizeName(firstName)}%`
          },
          ApellidoPaterno: this.capitalizeName(lastName)
        }
      }]
    });

    return docente;
  }

  static capitalizeName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
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
        message: 'Email administrativo reconocido'
      };
    }

    // Patrones de validación
    const patterns = {
      director: /^(ing|lic)\.([a-z]+)@upqroo\.edu\.mx$/i,
      teacher: /^[a-z]+\.[a-z]+@upqroo\.edu\.mx$/i,
      student: /^\d{7,9}@upqroo\.edu\.mx$/
    };

    try {
      // Validación para directores
      // Validación para directores
if (patterns.director.test(email)) {
  const director = await this.validateDirector(email);
  
  if (director) {
    // Tomar el primer programa educativo (asumiendo que un director puede tener varios)
    const programaEducativo = director.ProgramasEducativos && director.ProgramasEducativos[0];
    
    return {
      success: true,
      role: 'Director',
      data: {
        id: director.id,
        nombreCompleto: director.NombreDirector,
        programaEducativo: programaEducativo?.NombreCorto,
        nombreProgramaCompleto: programaEducativo?.NombreProgramaEducativo,
        emailInstitucional: director.CorreoDirector
      },
      message: 'Director validado correctamente'
    };
  } else {
    return {
      success: false,
      role: 'Director',
      message: 'No existe un director con este correo registrado'
    };
  }
}

      // Validación para docentes
      if (patterns.teacher.test(email)) {
        const [firstName, lastName] = email.split('@')[0].split('.');
        const data = await this.validateTeacher(email);
        
        if (data) {
          return {
            success: true,
            role: 'Docente',
            data: { 
              id: data.id,
              nombreCompleto: `${data.DatosPersonales.Nombre} ${data.DatosPersonales.ApellidoPaterno}`,
              gradoAcademico: data.GradoAcademico,
              detalles: data.DatosPersonales,
              emailInstitucional: email
            },
            message: 'Docente validado correctamente'
          };
        } else {
          return {
            success: false,
            role: 'Docente',
            nombre: this.capitalizeName(firstName),
            apellido: this.capitalizeName(lastName),
            message: 'Docente no registrado en el sistema'
          };
        }
      }

      // Validación para estudiantes
      if (patterns.student.test(email)) {
        const data = await this.validateStudent(email);
        
        if (data) {
          return {
            success: true,
            role: 'Estudiante',
            data: {
              id: data.id,
              matricula: data.Matricula,
              nombreCompleto: `${data.DatosPersonales.Nombre} ${data.DatosPersonales.ApellidoPaterno}`,
              programaEducativo: data.ProgramaEducativo?.NombreCorto,
              detalles: data.DatosPersonales,
              emailInstitucional: email
            },
            message: 'Estudiante validado correctamente'
          };
        } else {
          return {
            success: false,
            role: 'Estudiante',
            matricula: email.split('@')[0],
            message: 'Estudiante no registrado en el sistema'
          };
        }
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