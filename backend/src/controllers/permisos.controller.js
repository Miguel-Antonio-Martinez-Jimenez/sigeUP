const EmailService = require('../services/validar_email.service');

const PermisosController = {
  obtenerPermisos: async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido' 
        });
      }

      const resultado = await EmailService.identifyEmailRole(email);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      // Estructura de respuesta con permisos
      const response = {
        role: resultado.role,
        permissions: resultado.permissions,
        userData: resultado.data
      };

      return res.json(response);

    } catch (error) {
      console.error('Error en el controlador de permisos:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
};

module.exports = PermisosController;