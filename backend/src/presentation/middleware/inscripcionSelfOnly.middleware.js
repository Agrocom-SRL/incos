import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';
import { ForbiddenError } from '../../domain/errors/AppError.js';
import { tryResolveEstudianteIdForUsuario } from '../../application/utils/resolveEstudianteIdForUsuario.js';

/**
 * Guard anti-IDOR para GET /inscripciones/:id (detalle de matrícula).
 *
 * El rol ESTUDIANTE comparte la pantalla de detalle de inscripción
 * (matricula.inscribir DETALLE) para ver SU propia matrícula. Este guard impide
 * que un estudiante autenticado consulte la matrícula de OTRO estudiante:
 *  - Si el usuario ES estudiante (tryResolve devuelve su estudianteId), solo puede
 *    acceder cuando la inscripción :id pertenece a ese estudiante; si no, 403.
 *  - Si el usuario NO es estudiante (tryResolve devuelve null), pasa sin restricción
 *    (comportamiento admin/staff normal).
 *  - Si la inscripción no existe, deja pasar para que el controlador responda 404
 *    (no se filtra información a través de un 403).
 *
 * El dueño de la inscripción NO es un campo directo: se resuelve por la cadena
 *   inscripciones.datos_academicos_id → estudiantes_datos_academicos.estudiante_id
 * usando enrollmentRepository + studentAcademicDataRepository (sin vistas nuevas).
 *
 * Debe colocarse DESPUÉS de authenticate + verificarPermiso (+ idValidator/validateRequest):
 * necesita req.usuario y un req.params.id ya validado. Resuelve los repositorios de forma
 * perezosa desde el contenedor DI (mismo patrón que aporteSelfOnlyGuard), para no
 * alterar la firma del router.
 */
export async function inscripcionSelfOnlyGuard(req, res, next) {
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

    // Cargar la inscripción para resolver a su dueño por la cadena académica.
    const enrollmentRepository = container.resolve(REPOSITORIOS_TOKENS.enrollmentRepository);
    const enrollment = await enrollmentRepository.findById(Number(req.params.id), {
      attributes: ['id', 'datosAcademicosId'],
    });

    // Si no existe la inscripción, dejar que el controlador responda 404.
    if (!enrollment) {
      return next();
    }

    const enrollmentPlain = enrollment.toPlainObject?.() ?? enrollment;
    const academicDataId = Number(
      enrollmentPlain.academicDataId ??
        enrollmentPlain.datosAcademicosId ??
        enrollmentPlain.datos_academicos_id
    );

    // Resolver el estudiante dueño vía estudiantes_datos_academicos.
    let dueñoId = null;
    if (Number.isFinite(academicDataId) && academicDataId >= 1) {
      const studentAcademicDataRepository = container.resolve(
        REPOSITORIOS_TOKENS.studentAcademicDataRepository
      );
      const academicData = await studentAcademicDataRepository.findById(academicDataId, {
        attributes: ['id', 'estudianteId'],
      });
      if (academicData) {
        const academicPlain = academicData.toPlainObject?.() ?? academicData;
        dueñoId = Number(academicPlain.studentId ?? academicPlain.estudianteId);
      }
    }

    if (dueñoId !== suEstudianteId) {
      throw new ForbiddenError('No se puede ver la matrícula de otro estudiante.');
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
