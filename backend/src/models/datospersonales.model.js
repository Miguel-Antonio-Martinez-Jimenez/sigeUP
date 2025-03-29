module.exports = (sequelize, DataTypes) => {
  const DatosPersonales = sequelize.define('DatosPersonales', {
    IdDatosPersonales: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    ApellidoPaterno: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    ApellidoMaterno: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    CURP: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    Genero: {
      type: DataTypes.ENUM('Femenino', 'Masculino', 'No Especificado'),
      allowNull: false
    },
    Nacionalidad: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    Telefono: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CorreoPersonal: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    Direccion: {
      type: DataTypes.STRING(145),
      allowNull: false
    },
    FechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: false
    },
    NumeroSeguroSocial: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ServicioMedico: {
      type: DataTypes.ENUM('IMSS', 'ISSSTE', 'Particular', 'Otro'),
      allowNull: false
    },
    EstadoCivil: {
      type: DataTypes.ENUM('Soltera/o', 'Casada/o'),
      allowNull: false
    }
  }, {
    tableName: 'DatosPersonales',
    timestamps: false
  });

  DatosPersonales.associate = (models) => {
    DatosPersonales.hasOne(models.Alumno, {
      foreignKey: 'IdDatosPersonales',
      as: 'Alumno'
    });
    
    DatosPersonales.hasOne(models.Docente, {
      foreignKey: 'IdDatosPersonales',
      as: 'Docente'
    });
  };

  return DatosPersonales;
};