module.exports = (sequelize, DataTypes) => {
  const ListaDocente = sequelize.define('ListaDocente', {
    IdDocente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    IdProgramaEducativo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    IdPeriodo: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'ListaDocente',
    timestamps: false
  });

  ListaDocente.associate = (models) => {
    ListaDocente.belongsTo(models.ProgramaEducativo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'ProgramaEducativo'
    });
    
    ListaDocente.belongsTo(models.Docente, {
      foreignKey: 'IdDocente',
      as: 'Docente'
    });
    
    ListaDocente.belongsTo(models.Periodo, {
      foreignKey: 'IdPeriodo',
      as: 'Periodo'
    });
  };

  return ListaDocente;
};