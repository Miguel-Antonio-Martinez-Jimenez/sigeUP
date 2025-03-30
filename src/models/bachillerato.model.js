module.exports = (sequelize, DataTypes) => {
  const Bachillerato = sequelize.define('Bachillerato', {
    IdBachillerato: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    Nombre: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    Ciudad: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    Estado: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'Bachillerato',
    timestamps: false
  });

  Bachillerato.associate = (models) => {
    Bachillerato.hasMany(models.Alumno, {
      foreignKey: 'IdBachilleratoProcedencia',
      as: 'Alumnos'
    });
  };

  return Bachillerato;
};