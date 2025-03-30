// src/models/relaciones.js
module.exports = function establecerRelaciones(db) {
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
  } = db;

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
  
  Alumno.hasOne(Contacto, {
    foreignKey: 'Matricula',
    as: 'Contacto'
  });
  
  Alumno.hasMany(Kardex, {
    foreignKey: 'Matricula',
    as: 'Kardex'
  });
  
  Alumno.hasMany(Pagos, {
    foreignKey: 'Matricula',
    as: 'Pagos'
  });

  // Relaciones de Bachillerato
  Bachillerato.hasMany(Alumno, {
    foreignKey: 'IdBachilleratoProcedencia',
    as: 'Alumnos'
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
  
  Clase.hasMany(Kardex, {
    foreignKey: 'IdClase',
    as: 'Kardex'
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
  
  Curso.hasMany(Clase, {
    foreignKey: 'IdCurso',
    as: 'Clases'
  });

  // Relaciones de DatosPersonales
  DatosPersonales.hasOne(Alumno, {
    foreignKey: 'IdDatosPersonales',
    as: 'Alumno'
  });
  
  DatosPersonales.hasOne(Docente, {
    foreignKey: 'IdDatosPersonales',
    as: 'Docente'
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

  // Relaciones de Director
  Director.hasMany(ProgramaEducativo, {
    foreignKey: 'IdDirector',
    as: 'ProgramasEducativos'
  });

  // Relaciones de Discapacidad
  Discapacidad.hasMany(Alumno, {
    foreignKey: 'IdDiscapacidad',
    as: 'Alumnos'
  });

  // Relaciones de Docente
  Docente.belongsTo(DatosPersonales, {
    foreignKey: 'IdDatosPersonales',
    as: 'DatosPersonales'
  });
  
  Docente.hasOne(DatosProfesor, {
    foreignKey: 'IdDocente',
    as: 'DatosProfesionales'
  });
  
  Docente.hasMany(Clase, {
    foreignKey: 'IdDocente',
    as: 'Clases'
  });
  
  Docente.belongsToMany(ProgramaEducativo, {
    through: ListaDocente,
    foreignKey: 'IdDocente',
    otherKey: 'IdProgramaEducativo',
    as: 'ProgramasEducativos'
  });
  
  Docente.belongsToMany(Periodo, {
    through: ListaDocente,
    foreignKey: 'IdDocente',
    otherKey: 'IdPeriodo',
    as: 'Periodos'
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
  
  Grupo.hasMany(Clase, {
    foreignKey: 'IdGrupo',
    as: 'Clases'
  });

  // Relaciones de GrupoIndigena
  GrupoIndigena.hasMany(Alumno, {
    foreignKey: 'IdGrupoIndigena',
    as: 'Alumnos'
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
  
  Kardex.hasMany(DetalleKardex, {
    foreignKey: 'IdKardex',
    as: 'Detalles'
  });

  // Relaciones de LenguaIndigena
  LenguaIndigena.hasMany(Alumno, {
    foreignKey: 'IdLenguaIndigena',
    as: 'Alumnos'
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
  
  Materia.hasMany(Curso, {
    foreignKey: 'IdMateria',
    as: 'Cursos'
  });

  // Relaciones de Pagos
  Pagos.belongsTo(Alumno, {
    foreignKey: 'Matricula',
    as: 'Alumno'
  });
  
  Pagos.belongsTo(Periodo, {
    foreignKey: 'IdPeriodo',
    as: 'Periodo'
  });
  
  Pagos.belongsTo(Tramite, {
    foreignKey: 'IdTramite',
    as: 'Tramite'
  });

  // Relaciones de Periodo
  Periodo.hasMany(Grupo, {
    foreignKey: 'IdPeriodo',
    as: 'Grupos'
  });
  
  Periodo.hasMany(Clase, {
    foreignKey: 'IdPeriodo',
    as: 'Clases'
  });
  
  Periodo.hasMany(Pagos, {
    foreignKey: 'IdPeriodo',
    as: 'Pagos'
  });
  
  Periodo.belongsToMany(Docente, {
    through: ListaDocente,
    foreignKey: 'IdPeriodo',
    otherKey: 'IdDocente',
    as: 'Docentes'
  });

  // Relaciones de PlanEstudios
  PlanEstudios.belongsTo(ProgramaEducativo, {
    foreignKey: 'IdProgramaEducativo',
    as: 'ProgramaEducativo'
  });
  
  PlanEstudios.hasMany(Materia, {
    foreignKey: 'IdPlan',
    as: 'Materias'
  });

  // Relaciones de ProgramaEducativo
  ProgramaEducativo.belongsTo(Director, {
    foreignKey: 'IdDirector',
    as: 'Director'
  });
  
  ProgramaEducativo.hasMany(PlanEstudios, {
    foreignKey: 'IdProgramaEducativo',
    as: 'PlanesEstudio'
  });
  
  ProgramaEducativo.hasMany(Alumno, {
    foreignKey: 'IdProgramaEducativo',
    as: 'Alumnos'
  });
  
  ProgramaEducativo.hasMany(Grupo, {
    foreignKey: 'IdProgramaEducativo',
    as: 'Grupos'
  });
  
  ProgramaEducativo.belongsToMany(Docente, {
    through: ListaDocente,
    foreignKey: 'IdProgramaEducativo',
    otherKey: 'IdDocente',
    as: 'Docentes'
  });

  // Relaciones de Tramite
  Tramite.hasMany(Pagos, {
    foreignKey: 'IdTramite',
    as: 'Pagos'
  });
};