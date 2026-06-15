import { ForbiddenError, NotFoundError } from '../../domain/errors/AppError.js';
import { tryResolveDocenteIdForUsuario } from './resolveDocenteIdForUsuario.js';

/**
 * Verifica acceso al cuaderno de una asignación (docente del curso o coordinación).
 * @returns {Promise<{ cursoRow: object, ctx: object, bimestreVigente: number, gestionId: number }>}
 */
export async function assertCuadernoCursoAccess({
  calificacionCoordinacionRepository,
  calificacionContextoRepository,
  teacherRepository,
  userRepository,
  authRepository,
  usuarioId,
  asignacionId,
}) {
  const asignacionIdNum = Number(asignacionId);
  if (!Number.isFinite(asignacionIdNum) || asignacionIdNum < 1) {
    throw new NotFoundError('Asignación');
  }

  const cursoRow =
    await calificacionCoordinacionRepository.obtenerCursoPorAsignacion(asignacionIdNum);
  if (!cursoRow) {
    throw new NotFoundError('Curso');
  }

  const docenteIdAsignacion = Number(cursoRow.docente_id);
  const docenteSesion = await tryResolveDocenteIdForUsuario({
    teacherRepository,
    userRepository,
    usuarioId,
  });
  const esDocenteDelCurso =
    Number.isFinite(docenteSesion) && docenteSesion === docenteIdAsignacion;

  if (!esDocenteDelCurso) {
    const esCoordinacion = await authRepository.tienePermiso(
      usuarioId,
      'academico.calificacion.coordinacion',
      'LISTAR',
    );
    if (!esCoordinacion) {
      throw new ForbiddenError('No tenés acceso a este curso.');
    }
  }

  const ctx = await calificacionContextoRepository.obtenerContextoVigente();
  if (!ctx?.gestion_id) {
    const err = new Error('No hay gestión académica vigente configurada');
    err.statusCode = 404;
    throw err;
  }

  return {
    cursoRow,
    ctx,
    bimestreVigente: Number(ctx.bimestre_vigente) || 1,
    gestionId: Number(ctx.gestion_id),
  };
}
