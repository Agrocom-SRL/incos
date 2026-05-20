import { authenticate } from './auth.middleware.js';
import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';

/**
 * Autorización por permiso de dominio. Requiere authenticate() antes.
 *
 * @example
 * router.get('/', authenticate, verificarPermiso('matricula.admision.ver', 'LISTAR'), controller)
 */
export function verificarPermiso(codigoPermiso, accion) {
  return async (req, res, next) => {
    try {
      const authRepository = getAppContainer().resolve(REPOSITORIOS_TOKENS.authRepository);
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

/**
 * OR lógico: autoriza si el usuario cumple al menos un par [codigoPermiso, accion].
 * Requiere authenticate() antes.
 *
 * @param {Array<[string, string]>} pares
 */
export function verificarPermisoCualquiera(pares) {
  return async (req, res, next) => {
    try {
      const authRepository = getAppContainer().resolve(REPOSITORIOS_TOKENS.authRepository);
      const resultados = await Promise.all(
        pares.map(([codigoPermiso, accion]) =>
          authRepository.tienePermiso(req.usuario.id, codigoPermiso, accion)
        )
      );
      if (resultados.some(Boolean)) {
        return next();
      }
      return res.status(403).json({
        error: 'Acceso denegado',
        detalle: 'Se requiere al menos uno de los permisos autorizados para esta ruta',
      });
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Listados de catálogo de referencia (país, ubicación, tipos, métodos de pago, etc.).
 * Permiso `sistema.catalogo.referencia` (id 101) + LISTAR — infraestructura; AuthRepository lo concede a cualquier usuario con rol (no se asigna en roles_permisos ni en la grilla Seguridad).
 */
export const listarCatalogoReferencia = [
  authenticate,
  verificarPermiso('sistema.catalogo.referencia', 'LISTAR'),
];
