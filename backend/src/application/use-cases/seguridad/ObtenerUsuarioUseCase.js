import { NotFoundError } from '../../../domain/errors/AppError.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

export class ObtenerUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/UserPermissionRepository.js').UserPermissionRepository} deps.userPermissionRepository
   * @param {import('../../../infrastructure/repositories/UsuarioReferenciaVinculoRepository.js').UsuarioReferenciaVinculoRepository} deps.usuarioReferenciaVinculoRepository
   */
  constructor({ userRepository, userPermissionRepository, usuarioReferenciaVinculoRepository }) {
    this.userRepository = userRepository;
    this.userPermissionRepository = userPermissionRepository;
    this.usuarioReferenciaVinculoRepository = usuarioReferenciaVinculoRepository;
  }

  async execute(usuarioId) {
    const row = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!row) {
      throw new NotFoundError('Usuario');
    }

    const overridesRaw =
      await this.userPermissionRepository.findOverridesRawByUsuarioId(usuarioId);
    const overrides = overridesRaw.map((o) => ({
      id: o.id,
      codigo: o.codigo,
      accion: o.accion,
      tipo: o.tipo,
      motivo: o.motivo ?? null,
      permiso_id: o.permiso_id,
    }));

    const vinculoPerfil = await this.usuarioReferenciaVinculoRepository.findPerfilVinculado(
      row.tipo_referencia,
      row.referencia_id
    );

    return {
      usuario: {
        ...mapUsuarioAdminRow(row),
        vinculo_perfil: vinculoPerfil,
      },
      overrides,
    };
  }
}
