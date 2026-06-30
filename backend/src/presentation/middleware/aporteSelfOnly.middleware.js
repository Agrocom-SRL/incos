import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { ForbiddenError } from '../../domain/errors/AppError.js';
import { tryResolveEstudianteIdForUsuario } from '../../application/utils/resolveEstudianteIdForUsuario.js';

/**
 * Guard anti-IDOR para GET /pagos-aportes/:id (detalle de cabecera de aporte).
 *
 * El rol ESTUDIANTE comparte la opción de menú "Aportes" (matricula.pago.aporte.ver)
 * y tiene la acción DETALLE, por lo que puede reutilizar la pantalla de detalle admin
 * para ver SU propio aporte. Este guard impide que un estudiante autenticado consulte
 * la cabecera de OTRO estudiante:
 *  - Si el usuario ES estudiante (tryResolve devuelve su estudianteId), solo puede
 *    acceder cuando la cabecera :id pertenece a ese estudiante; si no, 403.
 *  - Si el usuario NO es estudiante (tryResolve devuelve null), pasa sin restricción
 *    (comportamiento admin/staff normal).
 *  - Si la cabecera no existe, deja pasar para que el controlador responda 404
 *    (no se filtra información a través de un 403).
 *
 * Debe colocarse DESPUÉS de authenticate + verificarPermiso (+ idValidator/validateRequest):
 * necesita req.usuario y un req.params.id ya validado. Resuelve los repositorios de forma
 * perezosa desde el contenedor DI (mismo patrón que estudianteSelfOnlyGuard), para no
 * alterar la firma del router.
 */
export async function aporteSelfOnlyGuard(req, res, next) {
  try {
    const container = getAppContainer();
    const studentRepository = container.resolve(REPOSITORIOS_TOKENS.studentRepository);
    const userRepository = container.resolve(REPOSITORIOS_TOKENS.userRepository);

    const suEstudianteId = await tryResolveEstudianteIdForUsuario({
      studentRepository,
      userRepository,
      usuarioId: req.usuario.id,
    });

    // No es estudiante: comportamiento admin/staff normal (sin restricción).
    if (suEstudianteId == null) {
      return next();
    }

    // Cargar la cabecera del aporte para conocer a su dueño (estudiante_id).
    const contributionPaymentRepository = container.resolve(
      REPOSITORIOS_TOKENS.contributionPaymentRepository
    );
    const cabecera = await contributionPaymentRepository.findById(Number(req.params.id));

    // Si no existe la cabecera, dejar que el controlador responda 404.
    if (!cabecera) {
      return next();
    }

    const plain = cabecera.toPlainObject?.() ?? cabecera;
    const dueñoId = Number(plain.studentId ?? plain.estudianteId ?? plain.estudiante_id);

    if (dueñoId !== suEstudianteId) {
      throw new ForbiddenError('No puedes ver los aportes de otro estudiante.');
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
