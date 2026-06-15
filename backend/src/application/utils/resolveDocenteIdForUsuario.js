import { ForbiddenError } from '../../domain/errors/AppError.js';
import { TIPOS_REFERENCIA } from '../../domain/constants/usuarios.constants.js';

const MSG_NO_VINCULADO =
  'Tu usuario no está vinculado a un docente. Contactá a coordinación académica.';

/**
 * Resuelve el docente de la sesión para mis-cursos / cuaderno propio.
 * Orden: docentes.usuario_id → usuarios.referencia_id (tipo DOCENTE).
 * Si solo existe referencia en usuarios, sincroniza docentes.usuario_id.
 *
 * @param {{ teacherRepository: object, userRepository: object, usuarioId: number }} deps
 * @returns {Promise<number>}
 */
export async function resolveDocenteIdForUsuario({
  teacherRepository,
  userRepository,
  usuarioId,
}) {
  const teachers = await teacherRepository.findAll({ userId: usuarioId });
  const teacher = teachers?.[0] ?? null;
  if (teacher) {
    const plain = teacher.toPlainObject?.() ?? teacher;
    const id = Number(plain.id ?? plain.docenteId);
    if (Number.isFinite(id) && id >= 1) {
      return id;
    }
  }

  const user = await userRepository.findById(usuarioId);
  const u = user?.toPlainObject?.() ?? user;
  if (u?.referenceType !== TIPOS_REFERENCIA.DOCENTE || u?.referenceId == null) {
    throw new ForbiddenError(MSG_NO_VINCULADO);
  }

  const docenteId = Number(u.referenceId);
  if (!Number.isFinite(docenteId) || docenteId < 1) {
    throw new ForbiddenError(MSG_NO_VINCULADO);
  }

  const docente = await teacherRepository.findById(docenteId);
  if (!docente) {
    throw new ForbiddenError(MSG_NO_VINCULADO);
  }

  const dp = docente.toPlainObject?.() ?? docente;
  if (dp.userId == null) {
    await teacherRepository.update(docenteId, { userId: usuarioId });
  }

  return docenteId;
}

/**
 * @returns {Promise<number|null>} null si no hay vínculo docente (sin lanzar ForbiddenError)
 */
export async function tryResolveDocenteIdForUsuario(deps) {
  try {
    return await resolveDocenteIdForUsuario(deps);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return null;
    }
    throw err;
  }
}
