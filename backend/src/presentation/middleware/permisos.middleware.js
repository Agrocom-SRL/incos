import container from '../../infrastructure/container/index.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';

/**
 * Autorización por permiso de dominio. Requiere authenticate() antes.
 *
 * @example
 * router.get('/', authenticate, verificarPermiso('matricula.admision.ver', 'VER'), controller)
 */
export function verificarPermiso(codigoPermiso, accion) {
  return async (req, res, next) => {
    try {
      const authRepository = container.resolve(REPOSITORIOS_TOKENS.authRepository);
      const tiene = await authRepository.tienePermiso(
        req.usuario.id,
        codigoPermiso,
        accion
      );

      if (!tiene) {
        return res.status(403).json({
          error: 'Acceso denegado',
          codigo: codigoPermiso,
          accion,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
