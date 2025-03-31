const EmailService = require('../services/validar_email.service');

const verificarPermisos = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      // Obtener email de query params, body o headers
      const email = req.query.email || req.body.email || req.headers['x-user-email'];
      
      if (!email) {
        return res.status(401).json({ 
          success: false,
          error: 'Autenticación requerida',
          message: 'Email no proporcionado'
        });
      }

      // Validar email y obtener rol
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        return res.status(403).json(usuario);
      }

      // Definir permisos por rol
      const permisosPorRol = {
        'Alumno': ['usuario:ver', 'usuario:actualizar'],
        'Docente': ['usuario:ver', 'usuario:actualizar'],
        'Director': ['usuario:ver', 'estudiantes:ver'],
        'Servicios Escolares': ['usuario:ver', 'usuario:crear', 'usuario:actualizar', 'usuario:eliminar', 'estudiantes:ver']
      };

      // Verificar si el rol tiene el permiso requerido
      const permisosDelRol = permisosPorRol[usuario.role] || [];
      
      if (!permisosDelRol.includes(permisoRequerido)) {
        return res.status(403).json({ 
          success: false,
          error: 'Acceso denegado',
          message: `El rol ${usuario.role} no tiene permiso para esta acción`
        });
      }

      // Adjuntar información del usuario al request
      req.user = usuario;
      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  };
};

module.exports = verificarPermisos;