const ServiciosFinancierosController = {
    getDashboard: (req, res) => {
      try {
        const { user } = req;
        
        const response = {
          success: true,
          role: user.role,
          view: 'Dashboard de Servicios Financieros',
          description: 'Vista administrativa para gestión financiera',
          sections: [
            'Registro de pagos',
            'Control de adeudos',
            'Gestión de becas',
            'Reportes financieros'
          ],
          quickActions: [
            'Registrar pago manual',
            'Generar recibo oficial',
            'Consultar estado de cuenta'
          ]
        };
  
        return res.json(response);
  
      } catch (error) {
        console.error('Error en ServiciosFinancierosController:', error);
        return res.status(500).json({ 
          success: false,
          error: 'Error interno al cargar el dashboard'
        });
      }
    }
  };
  
  module.exports = ServiciosFinancierosController;