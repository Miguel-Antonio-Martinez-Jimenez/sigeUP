module.exports = (sequelize, DataTypes) => {
  const PlanEstudios = sequelize.define('PlanEstudios', {
    IdPlan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    Version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Vigencia: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'PlanEstudios',
    timestamps: false
  });

  PlanEstudios.associate = (models) => {
    PlanEstudios.belongsTo(models.ProgramaEducativo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'ProgramaEducativo'
    });
    
    PlanEstudios.hasMany(models.Materia, {
      foreignKey: 'IdPlan',
      as: 'Materias'
    });
  };

  return PlanEstudios;
};