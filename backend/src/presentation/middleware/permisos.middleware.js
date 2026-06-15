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
 * Listados de catálogo / complemento de UI (países, tipos, política de notas, etc.).
 *
 * Permiso `sistema.catalogo.referencia` (seed 54, id **105**) + LISTAR.
 * Infraestructura: AuthRepository lo concede a cualquier usuario con `rol_id`
 * (no se asigna en roles_permisos ni en la grilla Seguridad).
 *
 * Usar en GET que alimentan combos, contexto de pantalla o vista previa,
 * aunque la pantalla de administración del recurso exija otro permiso de módulo.
 *
 * @see docs/referencia/matriz-permisos-sistema.md § Catálogos de referencia
 */
export const listarCatalogoReferencia = [
  authenticate,
  verificarPermiso('sistema.catalogo.referencia', 'LISTAR'),
];

/** Alias semántico: lectura de datos de complemento dentro de otra pantalla (ej. cuaderno). */
export const complementoPaginaLectura = listarCatalogoReferencia;
