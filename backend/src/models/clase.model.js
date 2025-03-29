module.exports = (sequelize, DataTypes) => {
  const Clase = sequelize.define('Clase', {
    IdClase: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    tableName: 'Clase',
    timestamps: false
  });

  Clase.associate = (models) => {
    Clase.belongsTo(models.Grupo, {
      foreignKey: 'IdGrupo',
      as: 'Grupo'
    });
    
    Clase.belongsTo(models.Curso, {
      foreignKey: 'IdCurso',
      as: 'Curso'
    });
    
    Clase.belongsTo(models.Docente, {
      foreignKey: 'IdDocente',
      as: 'Docente'
    });
    
    Clase.belongsTo(models.Periodo, {
      foreignKey: 'IdPeriodo',
      as: 'Periodo'
    });
    
    Clase.hasMany(models.Kardex, {
      foreignKey: 'IdClase',
      as: 'Kardex'
    });
  };

  return Clase;
};