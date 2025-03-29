const EmailService = require('../services/validar_email.service');

const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido en el cuerpo de la solicitud' 
        });
      }

      const result = await EmailService.identifyEmailRole(email);
      
      if (!result.success) {
        return res.status(403).json({ 
          success: false,
          error: result.message || 'Email no válido',
          details: result
        });
      }

      if (result.role !== requiredRole) {
        return res.status(403).json({ 
          success: false,
          error: `Acceso denegado. Se requiere rol: ${requiredRole}`,
          currentRole: result.role
        });
      }

      // Adjuntamos información estructurada al request
      req.user = {
        email,
        role: result.role,
        isAdmin: result.isAdmin || false,
        userId: result.data?.id || null, 
        matricula: result.data?.matricula || null,
        userData: result.data || null
      };

      next();
    } catch (error) {
      console.error('Error en middleware de verificación de rol:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor al verificar rol',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

module.exports = {
  checkRole,
  isStudent: checkRole('Estudiante'),
  isTeacher: checkRole('Docente'),
  isDirector: checkRole('Director'),
  isSchoolServices: checkRole('Servicios Escolares'),
  isFinancialServices: checkRole('Servicios Financieros')
};