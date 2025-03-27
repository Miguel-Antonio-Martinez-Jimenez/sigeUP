// backend/src/controller/auth.controller.js

const passport = require('passport');
const AuthService = require('../services/auth.service');

class AuthController {
  static googleAuth(req, res, next) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })(req, res, next);
  }

  static googleAuthCallback(req, res, next) {
    passport.authenticate('google', {
      failureRedirect: '/login',
      session: false
    }, (err, user) => {
      if (err) {
        return res.status(401).json({ 
          success: false,
          error: err.message 
        });
      }

      // Aquí podrías generar un JWT si quieres usar tokens
      res.json({
        success: true,
        user
      });
    })(req, res, next);
  }

  static checkRole(requiredRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      if (requiredRoles.includes(req.user.role)) {
        return next();
      }

      res.status(403).json({ 
        error: 'No tienes permiso para acceder a este recurso' 
      });
    };
  }
}

module.exports = AuthController;