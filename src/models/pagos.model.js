module.exports = (sequelize, DataTypes) => {
  const Pagos = sequelize.define('Pagos', {
    IdRecibo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    NumeroTransaccion: {
      type: DataTypes.STRING(200),
      allowNull: false
    }
  }, {
    tableName: 'Pagos',
    timestamps: false,
    comment: '		'
  });

  Pagos.associate = (models) => {
    Pagos.belongsTo(models.Alumno, {
      foreignKey: 'Matricula',
      as: 'Alumno'
    });
    
    Pagos.belongsTo(models.Periodo, {
      foreignKey: 'IdPeriodo',
      as: 'Periodo'
    });
    
    Pagos.belongsTo(models.Tramite, {
      foreignKey: 'IdTramite',
      as: 'Tramite'
    });
  };

  return Pagos;
};