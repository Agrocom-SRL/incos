import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { loginValidator, validateLoginRequest } from '../validators/auth/login.validator.js';

/**
 * @param {Object} params
 * @param {import('../controllers/auth/auth.controller.js').AuthController} params.authController
 */
export function buildAuthRouter({ authController }) {
  const router = express.Router();

  router.post(
    '/login',
    loginValidator,
    validateLoginRequest,
    (req, res, next) => authController.login(req, res, next)
  );
  router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));
  router.post('/logout', authenticate, (req, res, next) =>
    authController.logout(req, res, next)
  );

  return router;
}
