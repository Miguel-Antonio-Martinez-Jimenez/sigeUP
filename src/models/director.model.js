module.exports = (sequelize, DataTypes) => {
  const Director = sequelize.define('Director', {
    IdDirector: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    NombreDirector: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    CorreoDirector: {
      type: DataTypes.STRING(145),
      allowNull: false
    }
  }, {
    tableName: 'Director',
    timestamps: false
  });

  Director.associate = (models) => {
    Director.hasMany(models.ProgramaEducativo, {
      foreignKey: 'IdDirector',
      as: 'ProgramasEducativos'
    });
  };

  return Director;
};