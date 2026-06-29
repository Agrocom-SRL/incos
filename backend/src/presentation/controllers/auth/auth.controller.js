/**
 * Controller HTTP: autenticación (login, me, logout).
 */
export class AuthController {
  /**
   * @param {Object} deps
   * @param {import('../../../application/use-cases/auth/LoginUseCase.js').LoginUseCase} deps.loginUseCase
   * @param {import('../../../application/use-cases/auth/LogoutUseCase.js').LogoutUseCase} deps.logoutUseCase
   * @param {import('../../../application/use-cases/auth/MeUseCase.js').MeUseCase} deps.meUseCase
   * @param {import('../../../application/use-cases/auth/CambiarMiPasswordUseCase.js').CambiarMiPasswordUseCase} deps.cambiarMiPasswordUseCase
   * @param {import('../../../infrastructure/services/ResponseFormatter.js').ResponseFormatter} deps.responseFormatter
   */
  constructor({ loginUseCase, logoutUseCase, meUseCase, cambiarMiPasswordUseCase, responseFormatter }) {
    this.loginUseCase = loginUseCase;
    this.logoutUseCase = logoutUseCase;
    this.meUseCase = meUseCase;
    this.cambiarMiPasswordUseCase = cambiarMiPasswordUseCase;
    this.responseFormatter = responseFormatter;
  }

  login = async (req, res, next) => {
    try {
      let ip = req.ip;
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        ip = String(forwarded).split(',')[0].trim();
      }
      const ua = req.headers['user-agent'] || '';
      const dispositivo = /mobile|android|iphone/i.test(ua) ? 'MOVIL' : 'DESKTOP';

      const resultado = await this.loginUseCase.execute({
        username: req.body.username,
        password: req.body.password,
        ip,
        dispositivo,
      });

      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 200, message: 'Inicio de sesión correcto' },
        req
      );
    } catch (err) {
      next(err);
    }
  };

  me = async (req, res, next) => {
    try {
      const resultado = await this.meUseCase.execute(req.usuario.id, req.sesionData);
      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 200, message: 'Perfil obtenido correctamente' },
        req
      );
    } catch (err) {
      next(err);
    }
  };

  cambiarMiPassword = async (req, res, next) => {
    try {
      const resultado = await this.cambiarMiPasswordUseCase.execute({
        usuarioId: req.usuario.id,
        username: req.usuario.username,
        passwordActual: req.body.password_actual,
        passwordNuevo: req.body.password_nuevo,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 200, message: resultado.message },
        req
      );
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      const resultado = await this.logoutUseCase.execute(req.token);
      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 200, message: resultado.message },
        req
      );
    } catch (err) {
      next(err);
    }
  };
}
