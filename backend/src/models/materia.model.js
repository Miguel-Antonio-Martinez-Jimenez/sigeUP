module.exports = (sequelize, DataTypes) => {
  const Materia = sequelize.define('Materia', {
    IdMateria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Clave: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    Nombre: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    Creditos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    HorasPresenciales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Horas presenciales'
    },
    HorasTotales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Horas totales'
    },
    Unidades: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Numero de uniddades'
    },
    HorasTeoricas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Horas teoricas'
    },
    HorasPracticas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Horas practicas'
    },
    Cuatrimestre: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Materia',
    timestamps: false
  });

  Materia.associate = (models) => {
    Materia.belongsTo(models.PlanEstudios, {
      foreignKey: 'IdPlan',
      as: 'PlanEstudios'
    });
    
    Materia.hasMany(models.Curso, {
      foreignKey: 'IdMateria',
      as: 'Cursos'
    });
  };

  return Materia;
};