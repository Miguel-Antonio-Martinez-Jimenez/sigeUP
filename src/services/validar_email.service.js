const db = require('../models');

class EmailService {
  // Programas educativos válidos por tipo
  static programasValidos = {
    ing: ['software', 'biomedica', 'biotecnologia', 'financiera'],
    lic: ['gestion', 'terapiafisica']
  };

  // Verifica si un usuario tiene un permiso específico
  static async verifyPermission(email, requiredPermission) {
    try {
      const user = await this.identifyEmailRole(email);
      
      if (!user.success) {
        return false;
      }

      // Definir permisos basados en roles
      const rolePermissions = {
        'Director': ['create_grades', 'edit_grades', 'view_all_grades', 'manage_users'],
        'Docente': ['create_grades', 'edit_grades', 'view_own_grades'],
        'Servicios Escolares': ['view_all_grades', 'edit_grades', 'manage_students'],
        'Estudiante': ['view_own_grades']
      };

      // Verificar si el rol tiene el permiso requerido
      const hasPermission = rolePermissions[user.role]?.includes(requiredPermission) || false;
      
      if (!hasPermission) {
        console.log(`Permiso denegado: ${user.role} no tiene permiso para ${requiredPermission}`);
      }
      
      return hasPermission;
      
    } catch (error) {
      console.error('Error en verifyPermission:', error);
      return false;
    }
  }

  // Valida un estudiante basado en su email
  static async validateStudent(email) {
    try {
      const matricula = email.split('@')[0];
      return await db.Alumno.findOne({
        where: { Matricula: matricula },
        include: [
          { model: db.DatosPersonales, as: 'DatosPersonales' },
          { model: db.ProgramaEducativo, as: 'ProgramaEducativo' }
        ]
      });
    } catch (error) {
      console.error('Error en validateStudent:', error);
      throw error;
    }
  }

  // Valida un director basado en su email
  static async validateDirector(email) {
    try {
      return await db.Director.findOne({ 
        where: { 
          CorreoDirector: email
        },
        include: [
          { 
            model: db.ProgramaEducativo, 
            as: 'ProgramasEducativos',
            attributes: ['NombreCorto', 'NombreProgramaEducativo']
          }
        ]
      });
    } catch (error) {
      console.error('Error en validateDirector:', error);
      throw error;
    }
  }

  // Valida un docente basado en su email
  static async validateTeacher(email) {
    try {
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
    } catch (error) {
      console.error('Error en validateTeacher:', error);
      throw error;
    }
  }

  // Formatea un nombre con mayúscula inicial
  static capitalizeName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  // Identifica el rol de un usuario basado en su email institucional
  static async identifyEmailRole(email) {
    if (!email || !email.endsWith('@upqroo.edu.mx')) {
      return { 
        success: false,
        error: 'Dominio no válido',
        message: 'El email debe terminar con @upqroo.edu.mx'
      };
    }  
 
    // Emails predefinidos para roles administrativos
    const predefined = {
      'servicios.escolares@upqroo.edu.mx': {
        role: 'Servicios Escolares',
        permissions: ['view_all_grades', 'edit_grades', 'manage_students']
      },
      'servicios.financieros@upqroo.edu.mx': {
        role: 'Servicios Financieros',
        permissions: ['manage_payments']
      }
    };

    if (predefined[email]) {
      return { 
        success: true,
        role: predefined[email].role,
        permissions: predefined[email].permissions,
        message: 'Email administrativo reconocido'
      };
    }

    // Patrones de validación para diferentes tipos de usuarios
    const patterns = {
      director: /^(ing|lic)\.([a-z]+)@upqroo\.edu\.mx$/i,
      teacher: /^[a-z]+\.[a-z]+@upqroo\.edu\.mx$/i,
      student: /^\d{7,9}@upqroo\.edu\.mx$/
    };

    try {
      // Validación para directores
      if (patterns.director.test(email)) {
        const director = await this.validateDirector(email);
        
        if (director) {
          const programaEducativo = director.ProgramasEducativos && director.ProgramasEducativos[0];
          
          return {
            success: true,
            role: 'Director',
            permissions: ['create_grades', 'edit_grades', 'view_all_grades', 'manage_users'],
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
            permissions: ['create_grades', 'edit_grades', 'view_own_grades'],
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
            permissions: ['view_own_grades'],
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
      console.error('Error detallado en identifyEmailRole:', {
        error: error.message,
        stack: error.stack,
        email: email
      });
      
      return {
        success: false,
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al validar el email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}

module.exports = EmailService;