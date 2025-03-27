// backend/src/models/relaciones.model.js
module.exports = function establecerRelaciones(sequelize) {
    const {
      Alumno,
      Bachillerato,
      Clase,
      Contacto,
      Curso,
      DatosPersonales,
      DatosProfesor,
      DetalleKardex,
      Director,
      Discapacidad,
      Docente,
      Grupo,
      GrupoIndigena,
      Kardex,
      LenguaIndigena,
      ListaDocente,
      Materia,
      Pagos,
      Periodo,
      PlanEstudios,
      ProgramaEducativo,
      Tramite
    } = sequelize.models;
  
    // Relaciones de Alumno
    Alumno.belongsTo(ProgramaEducativo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'ProgramaEducativo'
    });
    Alumno.belongsTo(DatosPersonales, {
      foreignKey: 'IdDatosPersonales',
      as: 'DatosPersonales'
    });
    Alumno.belongsTo(Bachillerato, {
      foreignKey: 'IdBachilleratoProcedencia',
      as: 'BachilleratoProcedencia'
    });
    Alumno.belongsTo(LenguaIndigena, {
      foreignKey: 'IdLenguaIndigena',
      as: 'LenguaIndigena'
    });
    Alumno.belongsTo(GrupoIndigena, {
      foreignKey: 'IdGrupoIndigena',
      as: 'GrupoIndigena'
    });
    Alumno.belongsTo(Discapacidad, {
      foreignKey: 'IdDiscapacidad',
      as: 'Discapacidad'
    });
  
    // Relaciones de Clase
    Clase.belongsTo(Grupo, {
      foreignKey: 'IdGrupo',
      as: 'Grupo'
    });
    Clase.belongsTo(Curso, {
      foreignKey: 'IdCurso',
      as: 'Curso'
    });
    Clase.belongsTo(Docente, {
      foreignKey: 'IdDocente',
      as: 'Docente'
    });
    Clase.belongsTo(Periodo, {
      foreignKey: 'IdPeriodo',
      as: 'Periodo'
    });
  
    // Relaciones de Contacto
    Contacto.belongsTo(Alumno, {
      foreignKey: 'Matricula',
      as: 'Alumno'
    });
  
    // Relaciones de Curso
    Curso.belongsTo(Materia, {
      foreignKey: 'IdMateria',
      as: 'Materia'
    });
  
    // Relaciones de DatosProfesor
    DatosProfesor.belongsTo(Docente, {
      foreignKey: 'IdDocente',
      as: 'Docente'
    });
  
    // Relaciones de DetalleKardex
    DetalleKardex.belongsTo(Kardex, {
      foreignKey: 'IdKardex',
      as: 'Kardex'
    });
  
    // Relaciones de Docente
    Docente.belongsTo(DatosPersonales, {
      foreignKey: 'IdDatosPersonales',
      as: 'DatosPersonales'
    });
  
    // Relaciones de Grupo
    Grupo.belongsTo(ProgramaEducativo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'ProgramaEducativo'
    });
    Grupo.belongsTo(Periodo, {
      foreignKey: 'IdPeriodo',
      as: 'Periodo'
    });
  
    // Relaciones de Kardex
    Kardex.belongsTo(Alumno, {
      foreignKey: 'Matricula',
      as: 'Alumno'
    });
    Kardex.belongsTo(Clase, {
      foreignKey: 'IdClase',
      as: 'Clase'
    });
  
    // Relaciones de ListaDocente
    ListaDocente.belongsTo(ProgramaEducativo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'ProgramaEducativo'
    });
    ListaDocente.belongsTo(Docente, {
      foreignKey: 'IdDocente',
      as: 'Docente'
    });
    ListaDocente.belongsTo(Periodo, {
      foreignKey: 'IdPeriodo',
      as: 'Periodo'
    });
  
    // Relaciones de Materia
    Materia.belongsTo(PlanEstudios, {
      foreignKey: 'IdPlan',
      as: 'PlanEstudios'
    });
  
    // Relaciones de Pagos
    Pagos.belongsTo(Alumno, {
      foreignKey: 'Matricula',
      as: 'Alumno'
    });
    Pagos.belongsTo(Tramite, {
      foreignKey: 'IdTramite',
      as: 'Tramite'
    });
  
    // Relaciones de PlanEstudios
    PlanEstudios.belongsTo(ProgramaEducativo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'ProgramaEducativo'
    });
  
    // Relaciones de ProgramaEducativo
    ProgramaEducativo.belongsTo(Director, {
      foreignKey: 'IdDirector',
      as: 'Director'
    });
  };