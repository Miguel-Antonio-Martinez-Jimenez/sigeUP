const db = require('../models');
const { Op } = require('sequelize');
const EmailService = require('../services/validar_email.service');

const CalificacionesController = {
  obtenerCalificaciones: async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido' 
        });
      }

      // Validar el email y obtener el rol del usuario
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        return res.status(403).json(usuario);
      }

      // Verificar roles permitidos (solo Docente y Servicios Escolares)
      if (!['Docente', 'Servicios Escolares', 'Estudiante'].includes(usuario.role)) {
        return res.status(403).json({
          success: false,
          error: 'Acceso no autorizado',
          message: 'Solo docentes, servicios escolares y estudiantes pueden acceder a las calificaciones'
        });
      }

      // Configuración base de la consulta
      let whereClause = {};
      const include = [
        {
          model: db.Clase,
          as: 'Clase',
          include: [
            {
              model: db.Curso,
              as: 'Curso',
              include: [{
                model: db.Materia,
                as: 'Materia',
                attributes: ['Nombre']
              }]
            },
            {
              model: db.Docente,
              as: 'Docente',
              include: [{
                model: db.DatosPersonales,
                as: 'DatosPersonales',
                attributes: ['Nombre', 'ApellidoPaterno', 'CorreoPersonal']
              }]
            },
            {
              model: db.Grupo,
              as: 'Grupo',
              include: [{
                model: db.ProgramaEducativo,
                as: 'ProgramaEducativo',
                attributes: ['NombreCorto']
              }]
            }
          ]
        },
        {
          model: db.Alumno,
          as: 'Alumno',
          include: [
            {
              model: db.DatosPersonales,
              as: 'DatosPersonales',
              attributes: ['CorreoPersonal']
            },
            {
              model: db.ProgramaEducativo,
              as: 'ProgramaEducativo',
              attributes: ['NombreCorto']
            }
          ]
        },
        {
          model: db.DetalleKardex,
          as: 'Detalles',
          order: [['Unidad', 'ASC']],
          attributes: ['Unidad', 'Calificacion']
        }
      ];

      // Aplicar filtros según el rol del usuario
      switch(usuario.role) {
        case 'Estudiante':
          if (!usuario.data?.matricula) {
            return res.status(400).json({
              success: false,
              error: 'Matrícula no encontrada en los datos del estudiante'
            });
          }
          whereClause.Matricula = usuario.data.matricula;
          break;
          
        case 'Docente':
          // Extraer nombre y apellido del email (ej: "manuel.flores" -> ["manuel", "flores"])
          const [nombre, apellido] = email.split('@')[0].split('.');
          
          // Filtrar por nombre y apellido del docente en DatosPersonales
          include[0].include[1].include[0].where = {
            [Op.and]: [
              { Nombre: { [Op.like]: `${nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase()}%` } },
              { ApellidoPaterno: apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase() }
            ]
          };
          include[0].include[1].include[0].required = true;
          include[0].include[1].required = true;
          break;
          
        case 'Servicios Escolares':
          // Todos los registros sin filtro
          break;
      }

      // Seleccionamos solo los campos necesarios
      const attributes = [
        'IdKardex', 
        'Matricula', 
        'IdClase', 
        'CalificacionFinal', 
        'Acreditado', 
        'TipoAcreditacion'
      ];

      // Ejecutar la consulta
      const calificaciones = await db.Kardex.findAll({
        where: whereClause,
        include: include,
        attributes,
        order: [['IdKardex', 'DESC']]
      });

      // Formateamos la respuesta
      const calificacionesFormateadas = calificaciones.map(kardex => ({
        Matricula: kardex.Matricula,
        CorreoAlumno: kardex.Alumno?.DatosPersonales?.CorreoPersonal,
        Materia: kardex.Clase?.Curso?.Materia?.Nombre,
        CalificacionFinal: kardex.CalificacionFinal,
        Acreditado: kardex.Acreditado,
        TipoAcreditacion: kardex.TipoAcreditacion,
        ProgramaEducativo: kardex.Alumno?.ProgramaEducativo?.NombreCorto,
        ...(usuario.role === 'Docente' && {
          NombreDocente: kardex.Clase?.Docente?.DatosPersonales?.Nombre,
          CorreoDocente: email
        }),
        Detalles: kardex.Detalles
      }));

      res.json({
        success: true,
        count: calificacionesFormateadas.length,
        calificaciones: calificacionesFormateadas
      });

    } catch (error) {
      console.error('Error en obtenerCalificaciones:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener calificaciones',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  crearCalificacion: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { email, detalles = [], ...calificacionData } = req.body;
      
      // Validaciones básicas
      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido' 
        });
      }
  
      // Obtener información del usuario
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        await transaction.rollback();
        return res.status(403).json(usuario);
      }
  
      // Verificar permisos (solo Docente o Servicios Escolares)
      if (!['Docente', 'Servicios Escolares'].includes(usuario.role)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'No autorizado',
          message: 'Solo docentes y servicios escolares pueden crear calificaciones'
        });
      }
  
      // Validar que la clase exista
      const clase = await db.Clase.findByPk(calificacionData.IdClase, { 
        include: [{
          model: db.Docente,
          as: 'Docente',
          include: [{
            model: db.DatosPersonales,
            as: 'DatosPersonales'
          }]
        }],
        transaction 
      });
      
      if (!clase) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Clase no encontrada'
        });
      }
  
      // Si es docente, verificar que sea el asignado a la clase
      if (usuario.role === 'Docente') {
        const [nombre, apellido] = email.split('@')[0].split('.');
        const nombreFormateado = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
        const apellidoFormateado = apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();
        
        if (
          !clase.Docente?.DatosPersonales || 
          !clase.Docente.DatosPersonales.Nombre.startsWith(nombreFormateado) || 
          clase.Docente.DatosPersonales.ApellidoPaterno !== apellidoFormateado
        ) {
          await transaction.rollback();
          return res.status(403).json({
            success: false,
            error: 'No autorizado',
            message: 'Solo el docente asignado puede crear calificaciones para esta clase'
          });
        }
      }
  
      // Validar que el alumno exista
      const alumno = await db.Alumno.findByPk(calificacionData.Matricula, { transaction });
      if (!alumno) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Alumno no encontrado'
        });
      }
  
      // Generar un ID único para el Kardex
      const ultimoKardex = await db.Kardex.findOne({
        order: [['IdKardex', 'DESC']],
        transaction
      });
      const nuevoIdKardex = ultimoKardex ? ultimoKardex.IdKardex + 1 : 1;
  
      // Crear la calificación principal con el ID generado
      const nuevaCalificacion = await db.Kardex.create({
        ...calificacionData,
        IdKardex: nuevoIdKardex
      }, { transaction });
  
      // Crear detalles si existen
      if (detalles.length > 0) {
        const detallesParaCrear = detalles.map(detalle => ({
          Unidad: detalle.Unidad,
          Calificacion: detalle.Calificacion,
          IdKardex: nuevaCalificacion.IdKardex
        }));
        
        await db.DetalleKardex.bulkCreate(detallesParaCrear, { transaction });
      }
  
      await transaction.commit();
  
      // Obtener el registro completo recién creado
      const calificacionCompleta = await db.Kardex.findByPk(nuevaCalificacion.IdKardex, {
        include: [
          { 
            model: db.DetalleKardex, 
            as: 'Detalles',
            attributes: ['Unidad', 'Calificacion']
          },
          { 
            model: db.Clase, 
            as: 'Clase',
            include: [
              { 
                model: db.Curso, 
                as: 'Curso',
                include: [{
                  model: db.Materia,
                  as: 'Materia',
                  attributes: ['Nombre']
                }]
              },
              { 
                model: db.Docente, 
                as: 'Docente',
                include: [{
                  model: db.DatosPersonales,
                  as: 'DatosPersonales',
                  attributes: ['Nombre', 'ApellidoPaterno']
                }]
              }
            ]
          },
          { 
            model: db.Alumno, 
            as: 'Alumno',
            include: [
              { 
                model: db.DatosPersonales, 
                as: 'DatosPersonales',
                attributes: ['CorreoPersonal']
              },
              { 
                model: db.ProgramaEducativo, 
                as: 'ProgramaEducativo',
                attributes: ['NombreCorto']
              }
            ]
          }
        ],
        attributes: ['IdKardex', 'Matricula', 'IdClase', 'CalificacionFinal', 'Acreditado', 'TipoAcreditacion']
      });
  
      // Formatear la respuesta
      const respuesta = {
        Matricula: calificacionCompleta.Matricula,
        CorreoAlumno: calificacionCompleta.Alumno?.DatosPersonales?.CorreoPersonal,
        Materia: calificacionCompleta.Clase?.Curso?.Materia?.Nombre,
        CalificacionFinal: calificacionCompleta.CalificacionFinal,
        Acreditado: calificacionCompleta.Acreditado,
        TipoAcreditacion: calificacionCompleta.TipoAcreditacion,
        ProgramaEducativo: calificacionCompleta.Alumno?.ProgramaEducativo?.NombreCorto,
        NombreDocente: calificacionCompleta.Clase?.Docente?.DatosPersonales?.Nombre,
        Detalles: calificacionCompleta.Detalles
      };
  
      res.status(201).json({
        success: true,
        message: 'Calificación creada exitosamente',
        calificacion: respuesta
      });
  
    } catch (error) {
      await transaction.rollback();
      console.error('Error en crearCalificacion:', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      
      res.status(500).json({ 
        success: false,
        error: 'Error al crear calificación',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  editarCalificacion: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { email } = req.body;
      const { idKardex } = req.params;
      const { detalles = [], ...calificacionData } = req.body;

      // Validaciones básicas
      if (!email) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          error: 'El email es requerido' 
        });
      }

      // Obtener información del usuario
      const usuario = await EmailService.identifyEmailRole(email);
      if (!usuario.success) {
        await transaction.rollback();
        return res.status(403).json(usuario);
      }

      // Verificar permisos (solo Docente o Servicios Escolares)
      if (!['Docente', 'Servicios Escolares'].includes(usuario.role)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: 'No autorizado',
          message: 'Solo docentes y servicios escolares pueden editar calificaciones'
        });
      }

      // Buscar la calificación existente
      const calificacionExistente = await db.Kardex.findOne({
        where: { IdKardex: idKardex },
        include: [
          {
            model: db.Clase,
            as: 'Clase',
            include: [{
              model: db.Docente,
              as: 'Docente',
              include: [{
                model: db.DatosPersonales,
                as: 'DatosPersonales'
              }]
            }]
          }
        ],
        transaction
      });

      if (!calificacionExistente) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Calificación no encontrada'
        });
      }

      // Si es docente, verificar que sea el asignado a la clase
      if (usuario.role === 'Docente') {
        const [nombre, apellido] = email.split('@')[0].split('.');
        const nombreFormateado = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
        const apellidoFormateado = apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();
        
        if (
          !calificacionExistente.Clase?.Docente?.DatosPersonales || 
          !calificacionExistente.Clase.Docente.DatosPersonales.Nombre.startsWith(nombreFormateado) || 
          calificacionExistente.Clase.Docente.DatosPersonales.ApellidoPaterno !== apellidoFormateado
        ) {
          await transaction.rollback();
          return res.status(403).json({
            success: false,
            error: 'No autorizado',
            message: 'Solo el docente asignado puede editar calificaciones para esta clase'
          });
        }
      }

      // Actualizar la calificación principal
      await db.Kardex.update(calificacionData, {
        where: { IdKardex: idKardex },
        transaction
      });

      // Eliminar detalles existentes y crear los nuevos si se proporcionan
      if (detalles.length > 0) {
        await db.DetalleKardex.destroy({
          where: { IdKardex: idKardex },
          transaction
        });

        const detallesParaCrear = detalles.map(detalle => ({
          Unidad: detalle.Unidad,
          Calificacion: detalle.Calificacion,
          IdKardex: idKardex
        }));
        
        await db.DetalleKardex.bulkCreate(detallesParaCrear, { transaction });
      }

      await transaction.commit();

      // Obtener el registro completo actualizado
      const calificacionActualizada = await db.Kardex.findByPk(idKardex, {
        include: [
          { 
            model: db.DetalleKardex, 
            as: 'Detalles',
            attributes: ['Unidad', 'Calificacion'],
            order: [['Unidad', 'ASC']]
          },
          { 
            model: db.Clase, 
            as: 'Clase',
            include: [
              { 
                model: db.Curso, 
                as: 'Curso',
                include: [{
                  model: db.Materia,
                  as: 'Materia',
                  attributes: ['Nombre']
                }]
              },
              { 
                model: db.Docente, 
                as: 'Docente',
                include: [{
                  model: db.DatosPersonales,
                  as: 'DatosPersonales',
                  attributes: ['Nombre', 'ApellidoPaterno']
                }]
              }
            ]
          },
          { 
            model: db.Alumno, 
            as: 'Alumno',
            include: [
              { 
                model: db.DatosPersonales, 
                as: 'DatosPersonales',
                attributes: ['CorreoPersonal']
              },
              { 
                model: db.ProgramaEducativo, 
                as: 'ProgramaEducativo',
                attributes: ['NombreCorto']
              }
            ]
          }
        ],
        attributes: ['IdKardex', 'Matricula', 'IdClase', 'CalificacionFinal', 'Acreditado', 'TipoAcreditacion']
      });

      // Formatear la respuesta
      const respuesta = {
        IdKardex: calificacionActualizada.IdKardex,
        Matricula: calificacionActualizada.Matricula,
        CorreoAlumno: calificacionActualizada.Alumno?.DatosPersonales?.CorreoPersonal,
        Materia: calificacionActualizada.Clase?.Curso?.Materia?.Nombre,
        CalificacionFinal: calificacionActualizada.CalificacionFinal,
        Acreditado: calificacionActualizada.Acreditado,
        TipoAcreditacion: calificacionActualizada.TipoAcreditacion,
        ProgramaEducativo: calificacionActualizada.Alumno?.ProgramaEducativo?.NombreCorto,
        NombreDocente: calificacionActualizada.Clase?.Docente?.DatosPersonales?.Nombre,
        Detalles: calificacionActualizada.Detalles
      };

      res.json({
        success: true,
        message: 'Calificación actualizada exitosamente',
        calificacion: respuesta
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error en editarCalificacion:', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body,
        params: req.params
      });
      
      res.status(500).json({ 
        success: false,
        error: 'Error al editar calificación',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = CalificacionesController;