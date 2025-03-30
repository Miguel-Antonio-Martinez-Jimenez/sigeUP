module.exports = (sequelize, DataTypes) => {
  const Alumno = sequelize.define('Alumno', {
    Matricula: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    Estatus: {
      type: DataTypes.ENUM('Regular', 'Irregular', 'Baja Temporal', 'Baja Definitiva', 'Egresado', 'Titulado'),
      allowNull: false
    },
    AnioIngreso: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TipoIngreso: {
      type: DataTypes.ENUM('Normal', 'Equivalencia', 'Revalidación', 'Movilidad', 'Transferencia'),
      allowNull: false
    },
    AnioEgresoBachillerato: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PromedioBachillerato: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    tableName: 'Alumno',
    timestamps: false
  });

  Alumno.associate = (models) => {
    Alumno.belongsTo(models.ProgramaEducativo, {
      foreignKey: 'IdProgramaEducativo',
      as: 'ProgramaEducativo'
    });
    
    Alumno.belongsTo(models.DatosPersonales, {
      foreignKey: 'IdDatosPersonales',
      as: 'DatosPersonales'
    });
    
    Alumno.belongsTo(models.Bachillerato, {
      foreignKey: 'IdBachilleratoProcedencia',
      as: 'BachilleratoProcedencia'
    });
    
    Alumno.belongsTo(models.LenguaIndigena, {
      foreignKey: 'IdLenguaIndigena',
      as: 'LenguaIndigena'
    });
    
    Alumno.belongsTo(models.GrupoIndigena, {
      foreignKey: 'IdGrupoIndigena',
      as: 'GrupoIndigena'
    });
    
    Alumno.belongsTo(models.Discapacidad, {
      foreignKey: 'IdDiscapacidad',
      as: 'Discapacidad'
    });
    
    Alumno.hasOne(models.Contacto, {
      foreignKey: 'Matricula',
      as: 'Contacto'
    });
    
    Alumno.hasMany(models.Kardex, {
      foreignKey: 'Matricula',
      as: 'Kardex'
    });
    
    Alumno.hasMany(models.Pagos, {
      foreignKey: 'Matricula',
      as: 'Pagos'
    });
  };

  return Alumno;
};