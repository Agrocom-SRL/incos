import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { ForbiddenError } from '../../domain/errors/AppError.js';
import { tryResolveDocenteIdForUsuario } from '../../application/utils/resolveDocenteIdForUsuario.js';

/**
 * Guard de alcance anti-IDOR para GET /estudiantes/:id (rol DOCENTE).
 *
 * El rol DOCENTE tiene `matricula.admision.ver` DETALLE para abrir la ficha
 * de los estudiantes de SUS cursos (portal del rol docente, "Mis estudiantes").
 * Este guard impide que un docente autenticado consulte la ficha de un
 * estudiante ajeno a sus cursos vigentes:
 *  - Si el usuario ES docente (tryResolve devuelve su docenteId), solo puede
 *    acceder cuando el estudiante :id está matriculado en algún curso VIGENTE
 *    del docente (EXISTS sobre asignaciones_docentes → matriculas_materia →
 *    inscripciones → estudiantes_datos_academicos); si no, 403.
 *  - Si el usuario NO es docente (tryResolve devuelve null), pasa sin
 *    restricción (staff normal; el caso ESTUDIANTE-self lo cubre
 *    estudianteSelfOnlyGuard, con el que este guard se COMPONE en la ruta).
 *
 * Debe colocarse DESPUÉS de authenticate + verificarPermiso +
 * estudianteSelfOnlyGuard (necesita req.usuario y no altera el self-only).
 * Resuelve los repositorios de forma perezosa desde el contenedor DI (mismo
 * patrón que los demás guards).
 */
export async function estudianteAlcanceDocenteGuard(req, res, next) {
  try {
    const container = getAppContainer();
    const teacherRepository = container.resolve(REPOSITORIOS_TOKENS.teacherRepository);
    const userRepository = container.resolve(REPOSITORIOS_TOKENS.userRepository);

    const suDocenteId = await tryResolveDocenteIdForUsuario({
      teacherRepository,
      userRepository,
      usuarioId: req.usuario.id,
    });

    // No es docente: staff/estudiante siguen su flujo normal (sin restricción extra).
    if (suDocenteId == null) {
      return next();
    }

    const teacherAssignmentRepository = container.resolve(
      REPOSITORIOS_TOKENS.teacherAssignmentRepository
    );
    const esSuEstudiante = await teacherAssignmentRepository.docenteTieneEstudianteVigente(
      suDocenteId,
      Number(req.params.id)
    );

    if (!esSuEstudiante) {
      throw new ForbiddenError('Solo puedes ver la ficha de estudiantes de tus cursos.');
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
