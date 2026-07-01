import { ForbiddenError } from '../../domain/errors/AppError.js';
import { TIPOS_REFERENCIA } from '../../domain/constants/usuarios.constants.js';

const MSG_NO_VINCULADO =
  'Tu usuario no está vinculado a un estudiante. Contactá a secretaría académica.';

/**
 * Resuelve el estudiante de la sesión para el portal del estudiante (mis-datos,
 * mis-aportes, mi-boletín). El id SIEMPRE se deriva en servidor desde el usuario
 * autenticado (evita IDOR): nunca se confía en ids del cliente.
 *
 * Espejo de resolveDocenteIdForUsuario. Orden de resolución:
 *   1. estudiantes.usuario_id (StudentRepository.findAll({ userId })).
 *   2. usuarios.referencia_id con tipo_referencia = ESTUDIANTE.
 * Valida que el estudiante exista. Lanza ForbiddenError si no hay vínculo.
 *
 * @param {{ studentRepository: object, userRepository: object, usuarioId: number }} deps
 * @returns {Promise<number>}
 */
export async function resolveEstudianteIdForUsuario({
  studentRepository,
  userRepository,
  usuarioId,
}) {
  // 1) Estudiante vinculado por estudiantes.usuario_id.
  const result = await studentRepository.findAll({ userId: usuarioId });
  const list = Array.isArray(result) ? result : (result?.students ?? []);
  const student = list?.[0] ?? null;
  if (student) {
    const plain = student.toPlainObject?.() ?? student;
    const id = Number(plain.id ?? plain.estudianteId);
    if (Number.isFinite(id) && id >= 1) {
      return id;
    }
  }

  // 2) Fallback por referencia polimórfica en usuarios.
  const user = await userRepository.findById(usuarioId);
  const u = user?.toPlainObject?.() ?? user;
  if (u?.referenceType !== TIPOS_REFERENCIA.ESTUDIANTE || u?.referenceId == null) {
    throw new ForbiddenError(MSG_NO_VINCULADO);
  }

  const estudianteId = Number(u.referenceId);
  if (!Number.isFinite(estudianteId) || estudianteId < 1) {
    throw new ForbiddenError(MSG_NO_VINCULADO);
  }

  const estudiante = await studentRepository.findById(estudianteId);
  if (!estudiante) {
    throw new ForbiddenError(MSG_NO_VINCULADO);
  }

  return estudianteId;
}

/**
 * @returns {Promise<number|null>} null si no hay vínculo de estudiante (sin lanzar ForbiddenError)
 */
export async function tryResolveEstudianteIdForUsuario(deps) {
  try {
    return await resolveEstudianteIdForUsuario(deps);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return null;
    }
    throw err;
  }
}
