import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { ForbiddenError } from '../../domain/errors/AppError.js';
import { tryResolveDocenteIdForUsuario } from '../../application/utils/resolveDocenteIdForUsuario.js';

/**
 * Fábrica del guard anti-IDOR para lecturas por id de docente en la ruta.
 *
 * El rol DOCENTE tiene permisos de lectura para ver SUS propios datos
 * reutilizando pantallas de staff (ficha, carga, grilla de conflictos). Este
 * guard impide que un docente autenticado consulte datos de OTRO docente:
 *  - Si el usuario ES docente (tryResolve devuelve su docenteId), solo puede
 *    acceder cuando el parámetro de ruta coincide con su propio id; si no, 403.
 *  - Si el usuario NO es docente (tryResolve devuelve null), pasa sin restricción
 *    (comportamiento admin/staff normal).
 *
 * Debe colocarse DESPUÉS de authenticate + verificarPermiso (necesita req.usuario).
 * Resuelve los repositorios de forma perezosa desde el contenedor DI (mismo patrón
 * que authenticate), para no alterar la firma del router.
 *
 * @param {string} [paramName='id'] - Nombre del parámetro de ruta con el id del docente
 * @returns {import('express').RequestHandler}
 */
export function buildDocenteSelfOnlyGuard(paramName = 'id') {
  return async function docenteSelfOnly(req, res, next) {
    try {
      const container = getAppContainer();
      const teacherRepository = container.resolve(REPOSITORIOS_TOKENS.teacherRepository);
      const userRepository = container.resolve(REPOSITORIOS_TOKENS.userRepository);

      const suDocenteId = await tryResolveDocenteIdForUsuario({
        teacherRepository,
        userRepository,
        usuarioId: req.usuario.id,
      });

      // No es docente: comportamiento admin/staff normal (sin restricción).
      if (suDocenteId == null) {
        return next();
      }

      if (Number(req.params[paramName]) !== suDocenteId) {
        throw new ForbiddenError('No puedes ver los datos de otro docente.');
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Guard anti-IDOR por defecto (parámetro de ruta `:id`), usado en la ficha del
 * docente (GET /docentes/:id y GET /docentes/:id/carga-gestion).
 */
export const docenteSelfOnlyGuard = buildDocenteSelfOnlyGuard('id');
