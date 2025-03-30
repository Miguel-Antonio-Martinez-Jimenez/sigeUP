const db = require('../models');
const EmailService = require('../services/validar_email.service');

const PlanesEstudioController = {
// Ver un plan específico
verPlan: async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.query;
  
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'El email es requerido'
        });
      }
  
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        return res.status(403).json(usuario);
      }
  
      // Configurar el where según el rol
      let whereClause = { IdPlan: id };
      
      if (usuario.role === 'Director' && usuario.data.programaEducativo) {
        const programa = await db.ProgramaEducativo.findOne({
          where: { NombreCorto: usuario.data.programaEducativo }
        });
        
        if (!programa) {
          return res.status(404).json({
            success: false,
            error: 'Programa educativo no encontrado'
          });
        }
        
        whereClause.IdProgramaEducativo = programa.IdProgramaEducativo;
      }
  
      const plan = await db.PlanEstudios.findOne({
        where: whereClause,
        include: [{
          model: db.ProgramaEducativo,
          as: 'ProgramaEducativo',
          attributes: ['IdProgramaEducativo', 'NombreCorto', 'NombreProgramaEducativo']
        }]
      });
  
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: usuario.role === 'Director' 
            ? 'Plan no encontrado o no pertenece a su programa educativo' 
            : 'Plan no encontrado'
        });
      }
  
      res.json({
        success: true,
        plan
      });
  
    } catch (error) {
      console.error('Error en verPlan:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el plan de estudios'
      });
    }
  },

  // Listar planes según rol
  listarPlanes: async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido' 
        });
      }

      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        return res.status(403).json(usuario);
      }

      let whereClause = {};
      
      // Si es Director, filtrar por su programa educativo
      if (usuario.role === 'Director' && usuario.data.programaEducativo) {
        const programa = await db.ProgramaEducativo.findOne({
          where: { NombreCorto: usuario.data.programaEducativo }
        });
        
        if (!programa) {
          return res.status(404).json({
            success: false,
            error: 'Programa educativo no encontrado para este director'
          });
        }
        
        whereClause.IdProgramaEducativo = programa.IdProgramaEducativo;
      } 
      // Servicios Escolares no necesita filtro (ve todos)

      const planes = await db.PlanEstudios.findAll({
        where: whereClause,
        include: [{
          model: db.ProgramaEducativo,
          as: 'ProgramaEducativo',
          attributes: ['IdProgramaEducativo', 'NombreCorto']
        }],
        order: [['Anio', 'DESC']]
      });

      res.json({
        success: true,
        planes
      });

    } catch (error) {
      console.error('Error en listarPlanes:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener planes de estudio'
      });
    }
  },

  // Crear plan (SOLO Servicios Escolares)
  crearPlan: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, ...planData } = req.body;

      if (!email) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'El email es requerido'
        });
      }

      const usuario = await EmailService.identifyEmailRole(email);
      
      // Solo Servicios Escolares pueden crear
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares pueden crear planes'
        });
      }

      // Validar que el programa educativo exista
      if (planData.IdProgramaEducativo) {
        const programa = await db.ProgramaEducativo.findByPk(planData.IdProgramaEducativo, { transaction });
        if (!programa) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            error: 'Programa educativo no encontrado'
          });
        }
      }

      const nuevoPlan = await db.PlanEstudios.create(planData, { transaction });
      await transaction.commit();

      // Obtener el plan con relaciones
      const planCompleto = await db.PlanEstudios.findByPk(nuevoPlan.IdPlan, {
        include: [{
          model: db.ProgramaEducativo,
          as: 'ProgramaEducativo',
          attributes: ['IdProgramaEducativo', 'NombreCorto']
        }]
      });

      res.status(201).json({
        success: true,
        plan: planCompleto
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en crearPlan:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear plan de estudios'
      });
    }
  },

  // Editar plan (Director: su programa, sin cambiar programa | Servicios Escolares: todo)
  editarPlan: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { email, ...planData } = req.body;

      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        await transaction.rollback();
        return res.status(403).json(usuario);
      }

      const plan = await db.PlanEstudios.findByPk(id, { 
        include: [{
          model: db.ProgramaEducativo,
          as: 'ProgramaEducativo'
        }],
        transaction 
      });

      if (!plan) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: 'Plan no encontrado' });
      }

      // Validar permisos
      if (usuario.role === 'Director') {
        // 1. Verificar que el plan pertenezca a su programa
        if (plan.ProgramaEducativo.NombreCorto !== usuario.data.programaEducativo) {
          await transaction.rollback();
          return res.status(403).json({ 
            success: false, 
            error: 'Solo puede editar planes de su programa' 
          });
        }
        
        // 2. Si intenta cambiar el programa educativo, bloquear
        if (planData.IdProgramaEducativo && planData.IdProgramaEducativo !== plan.IdProgramaEducativo) {
          await transaction.rollback();
          return res.status(403).json({ 
            success: false, 
            error: 'No puede modificar el programa educativo asociado' 
          });
        }
      } 
      // Servicios Escolares no tiene restricciones

      // Verificar que el nuevo programa educativo exista (si se está cambiando)
      if (planData.IdProgramaEducativo && planData.IdProgramaEducativo !== plan.IdProgramaEducativo) {
        const nuevoPrograma = await db.ProgramaEducativo.findByPk(planData.IdProgramaEducativo, { transaction });
        if (!nuevoPrograma) {
          await transaction.rollback();
          return res.status(404).json({ 
            success: false, 
            error: 'Programa educativo no encontrado' 
          });
        }
      }

      // Actualizar el plan
      await db.PlanEstudios.update(planData, { 
        where: { IdPlan: id }, 
        transaction 
      });

      await transaction.commit();
      
      // Obtener el plan actualizado
      const planActualizado = await db.PlanEstudios.findByPk(id, {
        include: [{
          model: db.ProgramaEducativo,
          as: 'ProgramaEducativo',
          attributes: ['IdProgramaEducativo', 'NombreCorto']
        }]
      });

      res.json({ 
        success: true, 
        message: 'Plan actualizado',
        plan: planActualizado
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en editarPlan:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al editar plan',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = PlanesEstudioController;