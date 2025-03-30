const EmailService = require('../services/validar_email.service');

const verificarPermisos = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido para verificación de permisos' 
        });
      }

      const resultado = await EmailService.identifyEmailRole(email);

      if (!resultado.success || !resultado.permissions.includes(permisoRequerido)) {
        return res.status(403).json({ 
          success: false,
          error: 'No autorizado para esta acción' 
        });
      }

      req.userRole = resultado.role;
      req.userData = resultado.data;
      next();

    } catch (error) {
      console.error('Error en middleware de autorización:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  };
};

module.exports = verificarPermisos;