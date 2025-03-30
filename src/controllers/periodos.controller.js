const db = require('../models');
const EmailService = require('../services/validar_email.service');
const { Op } = require('sequelize');

const PeriodosController = {
  // Crear nuevo período (SOLO Servicios Escolares)
  crearPeriodo: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, ...periodoData } = req.body;

      // Validar email y rol
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares pueden crear periodos'
        });
      }

      // Validar datos del período
      if (!periodoData.NombrePeriodo || !periodoData.Anio) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'NombrePeriodo y Anio son requeridos'
        });
      }

      // Crear el período
      const nuevoPeriodo = await db.Periodo.create(periodoData, { transaction });
      await transaction.commit();

      res.status(201).json({
        success: true,
        periodo: nuevoPeriodo
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en crearPeriodo:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al crear periodo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener todos los períodos (SOLO Servicios Escolares)
  obtenerPeriodos: async (req, res) => {
    try {
      const { email } = req.query;

      // Validar email y rol
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares pueden ver periodos'
        });
      }

      // Obtener todos los periodos ordenados por año descendente
      const periodos = await db.Periodo.findAll({
        order: [['Anio', 'DESC'], ['NombrePeriodo', 'ASC']]
      });

      res.json({
        success: true,
        count: periodos.length,
        periodos
      });

    } catch (error) {
      console.error('Error en obtenerPeriodos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener periodos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener un período específico (SOLO Servicios Escolares)
  obtenerPeriodoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.query;

      // Validar email y rol
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares pueden ver periodos'
        });
      }

      const periodo = await db.Periodo.findByPk(id);

      if (!periodo) {
        return res.status(404).json({
          success: false,
          error: 'Periodo no encontrado'
        });
      }

      res.json({
        success: true,
        periodo
      });

    } catch (error) {
      console.error('Error en obtenerPeriodoPorId:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener periodo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Actualizar un período (SOLO Servicios Escolares)
  actualizarPeriodo: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { email, ...periodoData } = req.body;

      // Validar email y rol
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares pueden actualizar periodos'
        });
      }

      // Verificar que el período existe
      const periodo = await db.Periodo.findByPk(id, { transaction });
      if (!periodo) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Periodo no encontrado'
        });
      }

      // Actualizar el período
      await db.Periodo.update(periodoData, {
        where: { IdPeriodo: id },
        transaction
      });

      await transaction.commit();

      // Obtener el período actualizado
      const periodoActualizado = await db.Periodo.findByPk(id);

      res.json({
        success: true,
        periodo: periodoActualizado
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en actualizarPeriodo:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al actualizar periodo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Eliminar un período (SOLO Servicios Escolares)
  eliminarPeriodo: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { email } = req.body;

      // Validar email y rol
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares pueden eliminar periodos'
        });
      }

      // Verificar que el período existe
      const periodo = await db.Periodo.findByPk(id, { transaction });
      if (!periodo) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Periodo no encontrado'
        });
      }

      // Verificar si el período está en uso
      const enUso = await db.Clase.findOne({ 
        where: { IdPeriodo: id },
        transaction
      });

      if (enUso) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar el periodo porque está en uso'
        });
      }

      // Eliminar el período
      await db.Periodo.destroy({
        where: { IdPeriodo: id },
        transaction
      });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Periodo eliminado correctamente'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en eliminarPeriodo:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al eliminar periodo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Marcar/desmarcar período como activo (SOLO Servicios Escolares)
  togglePeriodoActivo: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { email } = req.body;

      // Validar email y rol
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success || usuario.role !== 'Servicios Escolares') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'Solo Servicios Escolares pueden modificar periodos'
        });
      }

      // Obtener el período
      const periodo = await db.Periodo.findByPk(id, { transaction });
      if (!periodo) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Periodo no encontrado'
        });
      }

      // Si vamos a activar este período, desactivar todos los demás primero
      if (!periodo.PeriodoActivo) {
        await db.Periodo.update(
          { PeriodoActivo: false },
          { where: { PeriodoActivo: true }, transaction }
        );
      }

      // Cambiar el estado
      const nuevoEstado = !periodo.PeriodoActivo;
      await db.Periodo.update(
        { PeriodoActivo: nuevoEstado },
        { where: { IdPeriodo: id }, transaction }
      );

      await transaction.commit();

      res.json({
        success: true,
        message: `Periodo ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
        periodoActivo: nuevoEstado
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en togglePeriodoActivo:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al cambiar estado del periodo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = PeriodosController;