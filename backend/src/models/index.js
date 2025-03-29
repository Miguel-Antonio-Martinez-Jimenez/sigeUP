const dbConfig = require('../config/db.config');
const Sequelize = require('sequelize');
const { EventEmitter } = require('events');

// Solucionar advertencia de MaxListenersExceeded
EventEmitter.defaultMaxListeners = 20;

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  logging: dbConfig.logging || false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  define: {
    timestamps: false,
    freezeTableName: true
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.Alumno = require('./alumno.model')(sequelize, Sequelize);
db.Bachillerato = require('./bachillerato.model')(sequelize, Sequelize);
db.Clase = require('./clase.model')(sequelize, Sequelize);
db.Contacto = require('./contacto.model')(sequelize, Sequelize);
db.Curso = require('./curso.model')(sequelize, Sequelize);
db.DatosPersonales = require('./datosPersonales.model')(sequelize, Sequelize);
db.DatosProfesor = require('./datosProfesor.model')(sequelize, Sequelize);
db.DetalleKardex = require('./detalleKardex.model')(sequelize, Sequelize);
db.Director = require('./director.model')(sequelize, Sequelize);
db.Discapacidad = require('./discapacidad.model')(sequelize, Sequelize);
db.Docente = require('./docente.model')(sequelize, Sequelize);
db.Grupo = require('./grupo.model')(sequelize, Sequelize);
db.GrupoIndigena = require('./grupoIndigena.model')(sequelize, Sequelize);
db.Kardex = require('./kardex.model')(sequelize, Sequelize);
db.LenguaIndigena = require('./lenguaIndigena.model')(sequelize, Sequelize);
db.ListaDocente = require('./listaDocente.model')(sequelize, Sequelize);
db.Materia = require('./materia.model')(sequelize, Sequelize);
db.Pagos = require('./pagos.model')(sequelize, Sequelize);
db.Periodo = require('./periodo.model')(sequelize, Sequelize);
db.PlanEstudios = require('./planEstudios.model')(sequelize, Sequelize);
db.ProgramaEducativo = require('./programaEducativo.model')(sequelize, Sequelize);
db.Tramite = require('./tramite.model')(sequelize, Sequelize);

// Establecer relaciones
require('./relaciones.model')(db);

// Verificar conexión a la base de datos
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
})();

module.exports = db;