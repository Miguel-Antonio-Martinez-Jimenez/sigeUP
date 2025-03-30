const EmailService = require('../services/validar_email.service');

const EmailController = {
  validarEmail: async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido',
          message: 'Debe proporcionar un email para validar'
        });
      }

      console.log(`Iniciando validación para email: ${email}`); // Log de depuración
      
      const resultado = await EmailService.identifyEmailRole(email);
      
      console.log('Resultado de validación:', resultado); // Log de depuración

      if (!resultado.success) {
        const statusCode = resultado.error === 'Dominio no válido' ? 400 : 404;
        return res.status(statusCode).json(resultado);
      }

      return res.json(resultado);

    } catch (error) {
      console.error('Error detallado en el controlador:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });
      
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar la solicitud',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = EmailController;