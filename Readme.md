<div align="center">

# sigeUP
</div>

## Dependencias del Proyecto
- [`cors`](https://www.npmjs.com/package/cors) `^2.8.5` - Middleware para habilitar CORS (Cross-Origin Resource Sharing).
- [`dotenv`](https://www.npmjs.com/package/dotenv) `^16.4.5` - Carga variables de entorno desde un archivo `.env`.
- [`express`](https://www.npmjs.com/package/express) `^4.21.0` - Framework web minimalista para Node.js.
- [`express-session`](https://www.npmjs.com/package/express-session) `^1.18.0` - Middleware para manejar sesiones en Express.
- [`mysql2`](https://www.npmjs.com/package/mysql2) `^3.14.0` - Cliente de MySQL compatible con Promises.
- [`passport`](https://www.npmjs.com/package/passport) `^0.7.0` - Middleware de autenticación para Node.js.
- [`passport-google-oauth20`](https://www.npmjs.com/package/passport-google-oauth20) `^2.0.0` - Estrategia de autenticación de Google para Passport.
- [`sequelize`](https://www.npmjs.com/package/sequelize) `^6.37.6` - ORM para bases de datos SQL en Node.js.
- [`nodemon`](https://www.npmjs.com/package/nodemon) `^3.1.9` - Reinicia automáticamente el servidor al detectar cambios en los archivos.

## Guía de Instalación.
1. Clonación del Repositorio: Clona el repositorio del proyecto desde GitHub o descarga el archivo ZIP.
2. Accede a la carpeta del proyecto que has clonado.
3. Asegúrate de tener Node.js instalado.
4. Navega a la carpeta del proyecto (donde se encuentra el archivo package.json) y ejecuta:
    ```bash
    npm install
- Este comando instalará todas las dependencias necesarias que se enumeran en el archivo package.json.

## Configuración Inicial.
1. Instalar los requisitos del proyecto.
2. **Crear Base de Datos**: Asegúrate de tener MySQL corriendo y crea la base de datos utilizando:

     ```bash
     CREATE DATABASE sigeup;
  - al ejecutar el sistema se crearan las tablas automaticamente...
3. Configurar el archivo `.env` para poder realizar la conexión.

## Configuración del Entorno (`.env`)

Antes de ejecutar el proyecto, es necesario configurar las variables de entorno. Crea un archivo `backend/.env` en la raíz del proyecto y copia la siguiente configuración:

    # Puerto del Servidor
    PORT=3500
    
    # Configuración de la Base De Datos (MySQL)
    DB_HOST=TU_HOST
    DB_USER=Tu_USUARIO
    DB_PASSWORD=TU_CONTRASEÑA
    DB_NAME=sigeup
    
    # Google OAuth 2.0
    GOOGLE_CLIENT_ID=1091110810253-s6iib06ap829erqt6jsqt3j0qhirimut.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=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
    GOOGLE_REDIRECT_URI=http://localhost:3500/auth/google/callback
    
    # Session Secret
    SESSION_SECRET=sigeupsecret
  - al ejecutar el sistema se crearan las tablas automaticamente...

## Conexión con la Base de Datos.
La conexión a la base de datos se establece en el archivo de configuración `backend/src/config/db.config.js`. Aquí está un ejemplo de cómo podría lucir:

    const Sequelize = require('sequelize');
    const dotenv = require('dotenv');
    
    dotenv.config();
    
    const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
    });

    module.exports = sequelize;

## Estado del Proyecto
**Estado Actual:** `En Desarrollo.`
> [!Note]
> Este proyecto se encuentra en estado **En Desarrollo**, lo que significa que todas las funcionalidades planeadas han sido implementadas y probadas satisfactoriamente. El código está disponible para su uso y estudio, y se aceptan contribuciones para mejoras o nuevas características.
<!--### Posibles Estados del Proyecto
- **Inicios:** El proyecto está en sus etapas iniciales de planificación y desarrollo. Apenas se están definiendo los requisitos y comenzando la implementación básica.
- **En Desarrollo:** El proyecto está en plena fase de desarrollo, con funcionalidades siendo añadidas y pruebas en curso. Puede contener errores o estar sujeto a cambios importantes.
- **Finalizado:** El proyecto ha alcanzado sus objetivos iniciales, con todas las funcionalidades implementadas y probadas. Puede recibir mantenimiento o mejoras menores.
- **Mantenimiento:** El proyecto está completo, pero sigue recibiendo actualizaciones menores, corrección de errores o mejoras en la documentación y el rendimiento.
- **Abandonado:** El desarrollo ha sido detenido y no se planean futuras actualizaciones ni mantenimiento. -->

## Contribuciónes
> [!Tip]
> Si deseas contribuir al proyecto, reportar errores o proponer mejoras, te invitamos a abrir un pull request o issue en el repositorio. También puedes contactarme directamente para compartir tus ideas o sugerencias a través de mi correo electrónico miguelantoniomartinezjimenez00@gmail.com. ¡Toda colaboración es bienvenida!

## Autores
[MiguelMartinez30 - @DevDarkSonic](https://github.com/Miguel-Antonio-Martinez-Jimenez)

## Licencia
Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
