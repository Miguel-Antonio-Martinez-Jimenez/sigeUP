require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const db = require('./src/models/index');

// Importación de rutas
const emailRoutes = require('./src/routes/email.routes');
const permisosRoutes = require('./src/routes/permisos.routes');
const calificacionesRoutes = require('./src/routes/calificaciones.routes');
const planesEstudioRoutes = require('./src/routes/planesEstudio.routes');

const app = express();

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_secreto_super_seguro_123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/email', emailRoutes);
app.use('/api', permisosRoutes);
app.use('/calificaciones', calificacionesRoutes);
app.use('/planes-estudio', planesEstudioRoutes);

// Ruta de prueba
app.get('/prueba-sesion', (req, res) => {
  if (!req.session.visitas) {
    req.session.visitas = 1;
  } else {
    req.session.visitas++;
  }
  res.json({
    mensaje: 'Sesión funcionando correctamente',
    visitas: req.session.visitas
  });
});

// Sincronización de BD y inicio del servidor
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Base de datos sincronizada');
    const PORT = process.env.PORT || 3500;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al sincronizar la base de datos:', err);
    process.exit(1);
  });

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    mensaje: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;