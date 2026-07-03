import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { ForbiddenError } from '../../domain/errors/AppError.js';
import { tryResolveDocenteIdForUsuario } from '../../application/utils/resolveDocenteIdForUsuario.js';

/**
 * Guard anti-IDOR para las lecturas por :id de la ficha del docente
 * (GET /docentes/:id y GET /docentes/:id/carga-gestion).
 *
 * El rol DOCENTE tiene el permiso DETALLE para ver SU propia ficha reutilizando
 * la pantalla de detalle (mismo patrón que estudianteSelfOnlyGuard). Este guard
 * impide que un docente autenticado consulte la ficha de OTRO docente:
 *  - Si el usuario ES docente (tryResolve devuelve su docenteId), solo puede
 *    acceder cuando :id coincide con su propio id; si no, 403.
 *  - Si el usuario NO es docente (tryResolve devuelve null), pasa sin restricción
 *    (comportamiento admin/staff normal).
 *
 * Debe colocarse DESPUÉS de authenticate + verificarPermiso (necesita req.usuario).
 * Resuelve los repositorios de forma perezosa desde el contenedor DI (mismo patrón
 * que authenticate), para no alterar la firma del router.
 */
export async function docenteSelfOnlyGuard(req, res, next) {
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

    if (Number(req.params.id) !== suDocenteId) {
      throw new ForbiddenError('No puedes ver los datos de otro docente.');
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
