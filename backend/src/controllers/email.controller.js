const EmailService = require('../services/validar_email.service');

const EmailController = {
  validarEmail: async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido' 
        });
      }

      const resultado = await EmailService.identifyEmailRole(email);

      // Respuesta específica para docentes no encontrados
      if (resultado.role === 'Docente' && !resultado.success) {
        return res.status(404).json({
          success: false,
          email,
          nombre: resultado.nombre,
          apellido: resultado.apellido,
          message: resultado.message
        });
      }

      // Respuesta para otros casos
      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      return res.json(resultado);

    } catch (error) {
      console.error('Error en el controlador:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar la solicitud'
      });
    }
  }
};

module.exports = EmailController;