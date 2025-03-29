module.exports = (sequelize, DataTypes) => {
  const Discapacidad = sequelize.define('Discapacidad', {
    IdDiscapacidad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Discapacidad: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'Discapacidad',
    timestamps: false
  });

  Discapacidad.associate = (models) => {
    Discapacidad.hasMany(models.Alumno, {
      foreignKey: 'IdDiscapacidad',
      as: 'Alumnos'
    });
  };

  return Discapacidad;
};