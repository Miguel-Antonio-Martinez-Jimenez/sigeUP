// backend/server.js

require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const sequelize = require('./src/config/db.config');
const establecerRelaciones = require('./src/models/relaciones.model');
// Cargar Modelos
const Alumno = require('./src/models/alumno.model')(sequelize, sequelize.Sequelize.DataTypes);
const Bachillerato = require('./src/models/bachillerato.model')(sequelize, sequelize.Sequelize.DataTypes);
const Clase = require('./src/models/clase.model')(sequelize, sequelize.Sequelize.DataTypes);
const Contacto = require('./src/models/contacto.model')(sequelize, sequelize.Sequelize.DataTypes);
const Curso = require('./src/models/curso.model')(sequelize, sequelize.Sequelize.DataTypes);
const DatosPersonales = require('./src/models/datospersonales.model')(sequelize, sequelize.Sequelize.DataTypes);
const DatosProfesor = require('./src/models/datosprofesor.model')(sequelize, sequelize.Sequelize.DataTypes);
const DetalleKardex = require('./src/models/detallekardex.model')(sequelize, sequelize.Sequelize.DataTypes);
const Director = require('./src/models/director.model')(sequelize, sequelize.Sequelize.DataTypes);
const Discapacidad = require('./src/models/discapacidad.model')(sequelize, sequelize.Sequelize.DataTypes);
const Docente = require('./src/models/docente.model')(sequelize, sequelize.Sequelize.DataTypes);
const Grupo = require('./src/models/grupo.model')(sequelize, sequelize.Sequelize.DataTypes);
const GrupoIndigena = require('./src/models/grupoindigena.model')(sequelize, sequelize.Sequelize.DataTypes);
const Kardex = require('./src/models/kardex.model')(sequelize, sequelize.Sequelize.DataTypes);
const LenguaIndigena = require('./src/models/lenguaindigena.model')(sequelize, sequelize.Sequelize.DataTypes);
const ListaDocente = require('./src/models/listadocente.model')(sequelize, sequelize.Sequelize.DataTypes);
const Materia = require('./src/models/materia.model')(sequelize, sequelize.Sequelize.DataTypes);
const Pagos = require('./src/models/pagos.model')(sequelize, sequelize.Sequelize.DataTypes);
const Periodo = require('./src/models/periodo.model')(sequelize, sequelize.Sequelize.DataTypes);
const PlanEstudios = require('./src/models/planestudios.model')(sequelize, sequelize.Sequelize.DataTypes);
const ProgramaEducativo = require('./src/models/programaeducativo.model')(sequelize, sequelize.Sequelize.DataTypes);
const Tramite = require('./src/models/tramite.model')(sequelize, sequelize.Sequelize.DataTypes);

sequelize.models = {
    Alumno,
    Bachillerato,
    Clase,
    Contacto,
    Curso,
    DatosPersonales,
    DatosProfesor,
    DetalleKardex,
    Director,
    Discapacidad,
    Docente,
    Grupo,
    GrupoIndigena,
    Kardex,
    LenguaIndigena,
    ListaDocente,
    Materia,
    Pagos,
    Periodo,
    PlanEstudios,
    ProgramaEducativo,
    Tramite
};

const app = express();

// Configuracion de middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuracion de sesion
app.use(
    session({
      secret: process.env.SESSION_SECRET || 'sigeupsecret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    })
);

// Inicializar la base de datos
const initializeDB = async () => {
    try {
      await sequelize.authenticate();
      console.log('Conexión a DB establecida');
      
      // Establecer relaciones
      establecerRelaciones(sequelize);
      
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Tablas creadas/actualizadas correctamente.');
    } catch (error) {
      console.error('❌ Error al crear tablas:', error);
      process.exit(1);
    }
};

// Configuración de rutas
app.use('/auth', require('./src/routes/auth.routes'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
      message: 'API del Sistema de Gestión Educativa',
      dbStatus: 'Tablas sincronizadas con relaciones'
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3500;
const startServer = async () => {
  await initializeDB();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
});