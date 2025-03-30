module.exports = (sequelize, DataTypes) => {
  const GrupoIndigena = sequelize.define('GrupoIndigena', {
    IdGrupoIndigena: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GrupoIndigena: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    tableName: 'GrupoIndigena',
    timestamps: false
  });

  GrupoIndigena.associate = (models) => {
    GrupoIndigena.hasMany(models.Alumno, {
      foreignKey: 'IdGrupoIndigena',
      as: 'Alumnos'
    });
  };

  return GrupoIndigena;
};