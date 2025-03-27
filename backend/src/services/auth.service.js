// backend/src/services/auth.service.js

class AuthService {
    static determineRole(email) {
      if (!email.endsWith('@upqroo.edu.mx')) {
        throw new Error('Solo se permiten correos institucionales @upqroo.edu.mx');
      }
  
      const username = email.split('@')[0];
  
      // 1. Alumnos (matrícula de 9 dígitos)
      if (/^\d{9}$/.test(username)) {
        return 'alumno';
      }
  
      // 2. Directores (Ing. o Lic.)
      if (/^(Ing|Lic)\.\w+$/.test(username)) {
        return 'director';
      }
  
      // 3. Docentes (nombre.apellido)
      if (/^[a-z]+\.[a-z]+$/.test(username)) {
        return 'docente';
      }
  
      // 4. Servicios Escolares
      if (username === 'serv.escolares') {
        return 'servicios escolares';
      }
  
      // 5. Servicios Financieros
      if (username === 'serv.financieros') {
        return 'servicios financieros';
      }
  
      throw new Error('Formato de correo no reconocido para asignación de roles');
    }
  }
  
  module.exports = AuthService;