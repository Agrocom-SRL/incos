import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { ForbiddenError } from '../../domain/errors/AppError.js';
import { tryResolveEstudianteIdForUsuario } from '../../application/utils/resolveEstudianteIdForUsuario.js';

/**
 * Guard anti-IDOR para GET /estudiantes/becas/:id (detalle de una asignación de beca).
 *
 * El rol ESTUDIANTE comparte la opción de menú "Becas" (matricula.beca.ver) y tiene
 * la acción DETALLE, por lo que puede reutilizar la pantalla de detalle admin para
 * ver SU propia beca ("Mi beca"). Este guard impide que un estudiante autenticado
 * consulte la asignación de beca de OTRO estudiante:
 *  - Si el usuario ES estudiante (tryResolve devuelve su estudianteId), solo puede
 *    acceder cuando la asignación :id pertenece a ese estudiante; si no, 403.
 *  - Si el usuario NO es estudiante (tryResolve devuelve null), pasa sin restricción
 *    (comportamiento admin/staff normal).
 *  - Si la asignación no existe, deja pasar para que el controlador responda 404
 *    (no se filtra información a través de un 403).
 *
 * Debe colocarse DESPUÉS de authenticate + verificarPermiso (+ idValidator/validateRequest):
 * necesita req.usuario y un req.params.id ya validado. Resuelve los repositorios de forma
 * perezosa desde el contenedor DI (mismo patrón que aporteSelfOnlyGuard/estudianteSelfOnlyGuard),
 * para no alterar la firma del router.
 */
export async function becaSelfOnlyGuard(req, res, next) {
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

    // Cargar la asignación de beca para conocer a su dueño (studentId).
    const studentScholarshipRepository = container.resolve(
      REPOSITORIOS_TOKENS.studentScholarshipRepository
    );
    const beca = await studentScholarshipRepository.findById(Number(req.params.id));

    // Si no existe la asignación, dejar que el controlador responda 404.
    if (!beca) {
      return next();
    }

    const plain = beca.toPlainObject?.() ?? beca;
    const dueñoId = Number(plain.studentId ?? plain.estudianteId ?? plain.estudiante_id);

    if (dueñoId !== suEstudianteId) {
      throw new ForbiddenError('No se puede ver la beca de otro estudiante.');
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
