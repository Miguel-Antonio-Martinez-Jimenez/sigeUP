module.exports = (sequelize, DataTypes) => {
  const Contacto = sequelize.define('Contacto', {
    Matricula: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    Nombre: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    Parentesco: {
      type: DataTypes.ENUM('Padre', 'Madre', 'Familiar', 'Conocido'),
      allowNull: false
    },
    Telefono: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Correo: {
      type: DataTypes.STRING(145),
      allowNull: true
    }
  }, {
    tableName: 'Contacto',
    timestamps: false
  });

  Contacto.associate = (models) => {
    Contacto.belongsTo(models.Alumno, {
      foreignKey: 'Matricula',
      as: 'Alumno'
    });
  };

  return Contacto;
};