module.exports = (sequelize, DataTypes) => {
  const Periodo = sequelize.define('Periodo', {
    IdPeriodo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    NombrePeriodo: {
      type: DataTypes.ENUM('Enero-Abril', 'Mayo-Agosto', 'Septiembre-Diciembre'),
      allowNull: false
    },
    Anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PeriodoActivo: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'Periodo',
    timestamps: false
  });

  Periodo.associate = (models) => {
    Periodo.hasMany(models.Grupo, {
      foreignKey: 'IdPeriodo',
      as: 'Grupos'
    });
    
    Periodo.hasMany(models.Clase, {
      foreignKey: 'IdPeriodo',
      as: 'Clases'
    });
    
    Periodo.hasMany(models.Pagos, {
      foreignKey: 'IdPeriodo',
      as: 'Pagos'
    });
    
    Periodo.belongsToMany(models.Docente, {
      through: models.ListaDocente,
      foreignKey: 'IdPeriodo',
      otherKey: 'IdDocente',
      as: 'Docentes'
    });
  };

  return Periodo;
};