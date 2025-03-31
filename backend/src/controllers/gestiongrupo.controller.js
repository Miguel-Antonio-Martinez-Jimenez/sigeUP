const db = require('../models');
const EmailService = require('../services/validar_email.service');

class GruposController {
  // Obtener un grupo específico por ID
  async verGrupo(req, res) {
    try {
      const { id } = req.params;
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido'
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        return res.status(403).json(user);
      }

      const grupo = await db.Grupo.findOne({
        where: { IdGrupo: id },
        include: [
          {
            model: db.ProgramaEducativo,
            as: 'ProgramaEducativo',
            attributes: ['IdProgramaEducativo', 'NombreCorto']
          },
          {
            model: db.Periodo,
            as: 'Periodo',
            attributes: ['IdPeriodo', 'NombrePeriodo', 'Anio']
          }
        ]
      });

      if (!grupo) {
        return res.status(404).json({
          success: false,
          error: 'Grupo no encontrado'
        });
      }

      // Restricción para directores: solo pueden ver grupos de su programa educativo
      if (user.role === 'Director') {
        const director = await db.Director.findOne({
          where: { CorreoDirector: email },
          include: [{
            model: db.ProgramaEducativo,
            as: 'ProgramasEducativos',
            attributes: ['IdProgramaEducativo']
          }]
        });

        const programasDirector = director.ProgramasEducativos.map(p => p.IdProgramaEducativo);
        if (!programasDirector.includes(grupo.IdProgramaEducativo)) {
          return res.status(403).json({
            success: false,
            error: 'No tiene permisos para ver este grupo'
          });
        }
      }

      res.json({
        success: true,
        data: grupo
      });

    } catch (error) {
      console.error('Error en verGrupo:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener el grupo'
      });
    }
  }

  // Listar todos los grupos con restricciones por rol
  async listarGrupo(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido'
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        return res.status(403).json(user);
      }

      let whereCondition = {};
      let include = [
        {
          model: db.ProgramaEducativo,
          as: 'ProgramaEducativo',
          attributes: ['IdProgramaEducativo', 'NombreCorto']
        },
        {
          model: db.Periodo,
          as: 'Periodo',
          attributes: ['IdPeriodo', 'NombrePeriodo', 'Anio']
        }
      ];

      // Restricciones para directores: solo ven grupos de su programa educativo
      if (user.role === 'Director') {
        const director = await db.Director.findOne({
          where: { CorreoDirector: email },
          include: [{
            model: db.ProgramaEducativo,
            as: 'ProgramasEducativos',
            attributes: ['IdProgramaEducativo']
          }]
        });

        const programasDirector = director.ProgramasEducativos.map(p => p.IdProgramaEducativo);
        whereCondition.IdProgramaEducativo = programasDirector;
      }

      const grupos = await db.Grupo.findAll({
        where: whereCondition,
        include: include,
        order: [['Nombre', 'ASC']]
      });

      res.json({
        success: true,
        data: grupos
      });

    } catch (error) {
      console.error('Error en listarGrupo:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al listar grupos'
      });
    }
  }

  // Crear un nuevo grupo (solo Servicios Escolares)
  async crearGrupo(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, ...grupoData } = req.body;

      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido'
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        await transaction.rollback();
        return res.status(403).json(user);
      }

      // Solo Servicios Escolares puede crear grupos
      if (user.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para crear grupos'
        });
      }

      // Validar datos requeridos
      if (!grupoData.Nombre || !grupoData.IdProgramaEducativo || !grupoData.IdPeriodo) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Nombre, IdProgramaEducativo e IdPeriodo son requeridos'
        });
      }

      // Verificar que el programa educativo existe
      const programaExists = await db.ProgramaEducativo.findOne({
        where: { IdProgramaEducativo: grupoData.IdProgramaEducativo },
        transaction
      });

      if (!programaExists) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Programa educativo no encontrado'
        });
      }

      // Verificar que el periodo existe
      const periodoExists = await db.Periodo.findOne({
        where: { IdPeriodo: grupoData.IdPeriodo },
        transaction
      });

      if (!periodoExists) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Periodo no encontrado'
        });
      }

      // Crear el grupo
      const nuevoGrupo = await db.Grupo.create(grupoData, { transaction });

      await transaction.commit();
      res.status(201).json({
        success: true,
        message: 'Grupo creado exitosamente',
        data: nuevoGrupo
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en crearGrupo:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al crear grupo'
      });
    }
  }

  // Editar un grupo existente
  async editarGrupo(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { email, ...updateData } = req.body;

      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'Email es requerido'
        });
      }

      const user = await EmailService.identifyEmailRole(email);
      if (!user.success) {
        await transaction.rollback();
        return res.status(403).json(user);
      }

      // Obtener el grupo existente
      const grupo = await db.Grupo.findOne({
        where: { IdGrupo: id },
        transaction
      });

      if (!grupo) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Grupo no encontrado'
        });
      }

      // Restricciones para directores
      if (user.role === 'Director') {
        const director = await db.Director.findOne({
          where: { CorreoDirector: email },
          include: [{
            model: db.ProgramaEducativo,
            as: 'ProgramasEducativos',
            attributes: ['IdProgramaEducativo']
          }],
          transaction
        });

        const programasDirector = director.ProgramasEducativos.map(p => p.IdProgramaEducativo);
        
        // Verificar que el grupo pertenece a uno de sus programas
        if (!programasDirector.includes(grupo.IdProgramaEducativo)) {
          await transaction.rollback();
          return res.status(403).json({
            success: false,
            error: 'No tiene permisos para editar este grupo'
          });
        }

        // Directores no pueden cambiar el programa educativo del grupo
        if (updateData.IdProgramaEducativo && updateData.IdProgramaEducativo !== grupo.IdProgramaEducativo) {
          await transaction.rollback();
          return res.status(403).json({
            success: false,
            error: 'No puede cambiar el programa educativo del grupo'
          });
        }
      } 
      // Solo Servicios Escolares y Directores pueden editar grupos
      else if (user.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para editar grupos'
        });
      }

      // Validar que el programa educativo existe si se está actualizando
      if (updateData.IdProgramaEducativo) {
        const programaExists = await db.ProgramaEducativo.findOne({
          where: { IdProgramaEducativo: updateData.IdProgramaEducativo },
          transaction
        });

        if (!programaExists) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Programa educativo no encontrado'
          });
        }
      }

      // Validar que el periodo existe si se está actualizando
      if (updateData.IdPeriodo) {
        const periodoExists = await db.Periodo.findOne({
          where: { IdPeriodo: updateData.IdPeriodo },
          transaction
        });

        if (!periodoExists) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            error: 'Periodo no encontrado'
          });
        }
      }

      // Actualizar el grupo
      await db.Grupo.update(updateData, {
        where: { IdGrupo: id },
        transaction
      });

      const grupoActualizado = await db.Grupo.findOne({
        where: { IdGrupo: id },
        transaction
      });

      await transaction.commit();
      res.json({
        success: true,
        message: 'Grupo actualizado exitosamente',
        data: grupoActualizado
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en editarGrupo:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar grupo'
      });
    }
  }
}

module.exports = new GruposController();