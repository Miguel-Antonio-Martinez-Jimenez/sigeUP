<div align="center">

# sigeUP - Backend
</div>
<br/>

## 📦 Dependencias del Proyecto
- *express* ^4.18.2 - Framework web para Node.js
- *sequelize* ^6.35.1 - ORM para bases de datos SQL
- *mysql2* ^3.6.2 - Cliente MySQL para Node.js
- *dotenv* ^16.4.7 - Manejo de variables de entorno
- *body-parser* ^1.20.2 - Analiza cuerpos de solicitudes HTTP
- *cors* ^2.8.5 - Habilita CORS para la API
- *express-session* ^1.18.1 - Manejo de sesiones
- *nodemon* ^3.0.2 - Reinicio automático del servidor en desarrollo

## 🚀 Guía de Instalación.
1. Clona el repositorio del proyecto desde GitHub o descarga el archivo ZIP.
    bash
    git clone https://github.com/tu-usuario/sistema-escolar-backend.git
2. Accede a la carpeta del proyecto que has clonado.
3. Asegúrate de tener Node.js instalado.
4. Navega a la carpeta del proyecto (donde se encuentra el archivo package.json) y sigue los pasos de Instalación de Dependencias.

## 🛠 Instalación de Dependencias
###  Instalación automática
    npm install
Instala todas las dependencias listadas en `package.json`
 ### Instalación manual completa
- #### Dependencias principales
    bash
    npm install express@^4.18.2 sequelize@^6.35.1 mysql2@^3.6.2 dotenv@^16.4.7 
- #### Middlewares esenciales
    bash
    npm install body-parser@^1.20.2 cors@^2.8.5 express-session@^1.18.1
- #### Seguridad avanzada
    bash
    npm install helmet bcryptjs express-rate-limit
- #### Autenticación JWT
    bash
    npm install jsonwebtoken passport passport-jwt
- #### Logging y documentación
    bash
    npm install winston morgan swagger-jsdoc swagger-ui-express
- #### Dependencias de desarrollo
    bash
    npm install --save-dev nodemon@^3.0.2 jest supertest

## 📂 Estructura del Proyecto
    backend/
    ├── config/
    │   └── db.config.js          # Configuración de la base de datos
    ├── controllers/
    │   ├── calificaciones.controller.js  # Lógica de calificaciones
    │   ├── email.controller.js           # Validación de emails
    │   ├── permisos.controller.js        # Gestión de permisos
    │   └── planesEstudio.controller.js   # CRUD de planes de estudio
    ├── middleware/
    │   └── autorizacion.middleware   # Middleware de roles
    ├── models/
    │   ├── alumno.model.js       # Modelo de Alumno
    │   ├── bachillerato.model.js # Modelo de Bachillerato
    │   ├── clase.model.js        # Modelo de Clase
    │   └── ... (otros modelos)   # Más entidades
    ├── routes/
    │   ├── calificaciones.routes.js  # Rutas de calificaciones
    │   ├── email.routes.js           # Rutas de email
    │   ├── permisos.routes.js        # Rutas de permisos
    │   └── planesEstudio.routes.js   # Rutas de planes de estudio
    ├── services/
    │   └── validar_email.service.js  # Lógica de validación de roles
    ├── .env                          # Variables de entorno
    ├── server.js                     # Punto de entrada
    └── package.json                  # Dependencias y scripts

## 📊 Configuración Inicial.
1. Instalar los requisitos del proyecto.
2. Asegúrate de tener MySQL corriendo y crea la base de datos utilizando:
     bash
     CREATE DATABASE sigeup;
- al ejecutar el sistema se crearan las tablas automaticamente...
3. Configurar el archivo .env para poder realizar la conexión.


## Configuración del Entorno (.env)
Antes de ejecutar el proyecto, es necesario configurar las variables de entorno. Crea un archivo backend/.env en la raíz del proyecto y copia la siguiente configuración:

    # Configuración de la Base De Datos (MySQL)
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=sigeup
    
    # Puerto del Servidor
    PORT=3500
    
    # Google OAuth 2.0
    GOOGLE_CLIENT_ID=1091110810253-s6iib06ap829erqt6jsqt3j0qhirimut.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=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
    GOOGLE_REDIRECT_URI=http://localhost:3500/auth/google/callback
    
    # Configuración del Frontend
    FRONTEND_URL=http://localhost:3000
    
    # Configuración de la Sesión
    SESSION_SECRET=sigeupsecret
    
    # Entorno de Ejecución
    NODE_ENV=development
    # Modo de ejecución de la aplicación (development para desarrollo, production para producción)

## Conexión con la Base de Datos.
La conexión a la base de datos se establece en el archivo de configuración backend/src/config/db.config.js. Aquí está un ejemplo de cómo podría lucir:

    require('dotenv').config();

    module.exports = {
      HOST: process.env.DB_HOST,
      USER: process.env.DB_USER,
      PASSWORD: process.env.DB_PASSWORD,
      DB: process.env.DB_NAME,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: false,
        freezeTableName: true
      }
    };

## 🌟 Estado del Proyecto
*Estado Actual:* En Desarrollo.
> [!Note]
> Este proyecto se encuentra en estado *En Desarrollo*, lo que significa que todas las funcionalidades planeadas han sido implementadas y probadas satisfactoriamente. El código está disponible para su uso y estudio, y se aceptan contribuciones para mejoras o nuevas características.

## 🤝 Contribuciónes
> [!Tip]
> Si deseas contribuir al proyecto, reportar errores o proponer mejoras, te invitamos a abrir un pull request o issue en el repositorio. También puedes contactarme directamente para compartir tus ideas o sugerencias a través de mi correo electrónico miguelantoniomartinezjimenez00@gmail.com. ¡Toda colaboración es bienvenida!

## 🖋 Autores
[MiguelMartinez30 - @DevDarkSonic](https://github.com/Miguel-Antonio-Martinez-Jimenez)

## 📜 Licencia
Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.