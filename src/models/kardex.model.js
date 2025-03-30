module.exports = (sequelize, DataTypes) => {
  const Kardex = sequelize.define('Kardex', {
    IdKardex: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    CalificacionFinal: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    Acreditado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    TipoAcreditacion: {
      type: DataTypes.ENUM('Curso Normal', 'Recursamiento', 'Evaluación Especial', 'Equivalencia'),
      allowNull: false
    }
  }, {
    tableName: 'Kardex',
    timestamps: false
  });

  Kardex.associate = (models) => {
    Kardex.belongsTo(models.Alumno, {
      foreignKey: 'Matricula',
      as: 'Alumno'
    });
    
    Kardex.belongsTo(models.Clase, {
      foreignKey: 'IdClase',
      as: 'Clase'
    });
    
    Kardex.hasMany(models.DetalleKardex, {
      foreignKey: 'IdKardex',
      as: 'Detalles'
    });
  };

  return Kardex;
};