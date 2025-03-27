module.exports = (sequelize, DataTypes) => {
  const Tramite = sequelize.define('Tramite', {
    IdTramite: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    Descripcion: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Costo: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    tableName: 'Tramite',
    timestamps: false
  });

  Tramite.associate = (models) => {
    Tramite.hasMany(models.Pagos, {
      foreignKey: 'IdTramite',
      as: 'Pagos'
    });
  };

  return Tramite;
};