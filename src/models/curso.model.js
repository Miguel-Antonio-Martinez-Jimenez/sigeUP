module.exports = (sequelize, DataTypes) => {
  const Curso = sequelize.define('Curso', {
    IdCurso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    tableName: 'Curso',
    timestamps: false
  });

  Curso.associate = (models) => {
    Curso.belongsTo(models.Materia, {
      foreignKey: 'IdMateria',
      as: 'Materia'
    });
    
    Curso.hasMany(models.Clase, {
      foreignKey: 'IdCurso',
      as: 'Clases'
    });
  };

  return Curso;
};