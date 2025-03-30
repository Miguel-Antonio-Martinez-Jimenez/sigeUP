module.exports = (sequelize, DataTypes) => {
  const DatosProfesor = sequelize.define('DatosProfesor', {
    Grado: {
      type: DataTypes.ENUM('Licenciatura', 'Maestria', 'Doctorado'),
      allowNull: false
    },
    Cedula: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'DatosProfesor',
    timestamps: false
  });

  DatosProfesor.associate = (models) => {
    DatosProfesor.belongsTo(models.Docente, {
      foreignKey: 'IdDocente',
      as: 'Docente'
    });
  };

  return DatosProfesor;
};