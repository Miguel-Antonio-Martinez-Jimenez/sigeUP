module.exports = (sequelize, DataTypes) => {
  const LenguaIndigena = sequelize.define('LenguaIndigena', {
    IdLenguaIndigena: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    LenguaIndigena: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'LenguaIndigena',
    timestamps: false
  });

  LenguaIndigena.associate = (models) => {
    LenguaIndigena.hasMany(models.Alumno, {
      foreignKey: 'IdLenguaIndigena',
      as: 'Alumnos'
    });
  };

  return LenguaIndigena;
};