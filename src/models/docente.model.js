module.exports = (sequelize, DataTypes) => {
  const Docente = sequelize.define('Docente', {
    IdDocente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GradoAcademico: {
      type: DataTypes.ENUM('Licenciatura', 'Maestria', 'Doctorado'),
      allowNull: false
    }
  }, {
    tableName: 'Docente',
    timestamps: false
  });

  Docente.associate = (models) => {
    Docente.belongsTo(models.DatosPersonales, {
      foreignKey: 'IdDatosPersonales',
      as: 'DatosPersonales'
    });
    
    Docente.hasOne(models.DatosProfesor, {
      foreignKey: 'IdDocente',
      as: 'DatosProfesionales'
    });
    
    Docente.hasMany(models.Clase, {
      foreignKey: 'IdDocente',
      as: 'Clases'
    });
    
    Docente.belongsToMany(models.ProgramaEducativo, {
      through: models.ListaDocente,
      foreignKey: 'IdDocente',
      otherKey: 'IdProgramaEducativo',
      as: 'ProgramasEducativos'
    });
    
    Docente.belongsToMany(models.Periodo, {
      through: models.ListaDocente,
      foreignKey: 'IdDocente',
      otherKey: 'IdPeriodo',
      as: 'Periodos'
    });
  };

  return Docente;
};