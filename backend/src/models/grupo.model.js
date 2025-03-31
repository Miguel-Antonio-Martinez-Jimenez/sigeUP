module.exports = (sequelize, DataTypes) => {
  const Grupo = sequelize.define('Grupo', {
    IdGrupo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    Nombre: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'Grupo',
    timestamps: false
  });

  Grupo.associate = (models) => {
    Grupo.belongsTo(models.ProgramaEducativo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'ProgramaEducativo'
    });
    
    Grupo.belongsTo(models.Periodo, {
      foreignKey: 'IdPeriodo',
      as: 'Periodo'
    });
    
    Grupo.hasMany(models.Clase, {
      foreignKey: 'IdGrupo',
      as: 'Clases'
    });
  };

  return Grupo;
};