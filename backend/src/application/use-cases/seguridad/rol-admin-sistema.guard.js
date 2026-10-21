import { ForbiddenError } from '../../../domain/errors/AppError.js';

export const ROL_ADMIN_SISTEMA_CODIGO = 'ADMIN_SISTEMA';

/**
 * Solo un ADMIN_SISTEMA puede asignar o retirar el rol ADMIN_SISTEMA.
 * Sin actor identificado se rechaza (falla cerrado).
 *
 * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} userRepository
 * @param {number|null|undefined} actorId
 */
export async function exigirActorAdminSistema(userRepository, actorId) {
  const actor = actorId != null ? await userRepository.findByIdWithRoleForAdmin(Number(actorId)) : null;
  if (actor?.rol_codigo !== ROL_ADMIN_SISTEMA_CODIGO) {
    throw new ForbiddenError('Solo un ADMIN_SISTEMA puede asignar o retirar el rol ADMIN_SISTEMA');
  }
}
