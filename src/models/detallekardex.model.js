module.exports = (sequelize, DataTypes) => {
  const DetalleKardex = sequelize.define('DetalleKardex', {
    Unidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Calificacion: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    tableName: 'DetalleKardex',
    timestamps: false
  });

  DetalleKardex.associate = (models) => {
    DetalleKardex.belongsTo(models.Kardex, {
      foreignKey: 'IdKardex',
      as: 'Kardex'
    });
  };

  return DetalleKardex;
};