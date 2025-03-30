module.exports = (sequelize, DataTypes) => {
  const ProgramaEducativo = sequelize.define('ProgramaEducativo', {
    IdProgramaEducativo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    NombreCorto: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    NombreProgramaEducativo: {
      type: DataTypes.STRING(115),
      allowNull: false
    },
    Vigencia: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'ProgramaEducativo',
    timestamps: false
  });

  ProgramaEducativo.associate = (models) => {
    ProgramaEducativo.belongsTo(models.Director, {
      foreignKey: 'IdDirector',
      as: 'Director'
    });
    
    ProgramaEducativo.hasMany(models.PlanEstudios, {
      foreignKey: 'IdProgramaEducativo',
      as: 'PlanesEstudio'
    });
    
    ProgramaEducativo.hasMany(models.Alumno, {
      foreignKey: 'IdProgramaEducativo',
      as: 'Alumnos'
    });
    
    ProgramaEducativo.hasMany(models.Grupo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'Grupos'
    });
    
    ProgramaEducativo.belongsToMany(models.Docente, {
      through: models.ListaDocente,
      foreignKey: 'IdProgramaEducativo',
      otherKey: 'IdDocente',
      as: 'Docentes'
    });
  };

  return ProgramaEducativo;
};