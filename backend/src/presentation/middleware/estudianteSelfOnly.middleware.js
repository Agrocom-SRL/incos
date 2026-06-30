import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { ForbiddenError } from '../../domain/errors/AppError.js';
import { tryResolveEstudianteIdForUsuario } from '../../application/utils/resolveEstudianteIdForUsuario.js';

/**
 * Guard anti-IDOR para GET /estudiantes/:id.
 *
 * El rol ESTUDIANTE tiene el permiso DETALLE para ver SU propia ficha reutilizando
 * la pantalla de detalle. Este guard impide que un estudiante autenticado consulte
 * la ficha de OTRO estudiante:
 *  - Si el usuario ES estudiante (tryResolve devuelve su estudianteId), solo puede
 *    acceder cuando :id coincide con su propio id; si no, 403.
 *  - Si el usuario NO es estudiante (tryResolve devuelve null), pasa sin restricción
 *    (comportamiento admin/staff normal).
 *
 * Debe colocarse DESPUÉS de authenticate + verificarPermiso (necesita req.usuario).
 * Resuelve los repositorios de forma perezosa desde el contenedor DI (mismo patrón
 * que authenticate), para no alterar la firma del router.
 */
export async function estudianteSelfOnlyGuard(req, res, next) {
  try {
    const container = getAppContainer();
    const studentRepository = container.resolve(REPOSITORIOS_TOKENS.studentRepository);
    const userRepository = container.resolve(REPOSITORIOS_TOKENS.userRepository);

    const suEstudianteId = await tryResolveEstudianteIdForUsuario({
      studentRepository,
      userRepository,
      usuarioId: req.usuario.id,
    });

    // No es estudiante: comportamiento admin normal (sin restricción).
    if (suEstudianteId == null) {
      return next();
    }

    if (Number(req.params.id) !== suEstudianteId) {
      throw new ForbiddenError('No puedes ver los datos de otro estudiante.');
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
