module.exports = (sequelize, DataTypes) => {
  const ListaDocente = sequelize.define('ListaDocente', {}, {
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