/**
 * Resuelve la persona/ficha vinculada a un usuario (estudiante, docente o
 * personal), con el mismo shape que el detalle admin:
 * `{ tipo_etiqueta, nombre_completo, lineas[], referencia_id, tipo_referencia }`.
 *
 * Compartido por MeUseCase y LoginUseCase para que el `vinculo_perfil` viaje
 * tanto en `/auth/me` como en la respuesta del login (el header muestra el
 * nombre de la persona vinculada, no el username, desde el primer render).
 *
 * Aditivo y defensivo: ante ausencia de vínculo o de repos devuelve null sin
 * romper el flujo de autenticación.
 *
 * @param {Object} deps
 * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
 * @param {import('../../../infrastructure/repositories/views/UsuarioReferenciaVinculoRepository.js').UsuarioReferenciaVinculoRepository} deps.usuarioReferenciaVinculoRepository
 * @param {number} deps.usuarioId
 * @returns {Promise<Object|null>}
 */
export const resolveVinculoPerfilUsuario = async ({
  userRepository,
  usuarioReferenciaVinculoRepository,
  usuarioId,
}) => {
  if (!userRepository || !usuarioReferenciaVinculoRepository) {
    return null;
  }
  const row = await userRepository.findByIdWithRoleForAdmin(usuarioId);
  if (!row) {
    return null;
  }
  return usuarioReferenciaVinculoRepository.findPerfilVinculado(
    row.tipo_referencia,
    row.referencia_id
  );
};

export default resolveVinculoPerfilUsuario;
