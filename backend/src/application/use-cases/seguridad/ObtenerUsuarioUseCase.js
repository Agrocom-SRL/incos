import { NotFoundError } from '../../../domain/errors/AppError.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';

export class ObtenerUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/UserPermissionRepository.js').UserPermissionRepository} deps.userPermissionRepository
   * @param {import('../../../infrastructure/repositories/UsuarioReferenciaVinculoRepository.js').UsuarioReferenciaVinculoRepository} deps.usuarioReferenciaVinculoRepository
   * @param {import('../../../infrastructure/repositories/StaffRepository.js').StaffRepository} deps.staffRepository
   */
  constructor({
    userRepository,
    userPermissionRepository,
    usuarioReferenciaVinculoRepository,
    staffRepository,
  }) {
    this.userRepository = userRepository;
    this.userPermissionRepository = userPermissionRepository;
    this.usuarioReferenciaVinculoRepository = usuarioReferenciaVinculoRepository;
    this.staffRepository = staffRepository;
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

    const personalEditable =
      row.referencia_id != null &&
      (row.tipo_referencia == null ||
        row.tipo_referencia === 'RECTOR' ||
        row.tipo_referencia === 'DIRECTOR' ||
        row.tipo_referencia === 'SECRETARIA')
        ? await this.staffRepository.findById(Number(row.referencia_id))
        : null;

    const personalPayload = personalEditable
      ? {
          ci: personalEditable.ci ?? null,
          expedition: personalEditable.expedition ?? null,
          firstName: personalEditable.firstName ?? null,
          lastName: personalEditable.lastName ?? null,
          motherLastName: personalEditable.motherLastName ?? null,
          birthDate: personalEditable.birthDate ?? null,
          gender: personalEditable.gender ?? null,
          civilStatusId: personalEditable.civilStatusId ?? null,
          personalEmail: personalEditable.personalEmail ?? null,
          phone: personalEditable.phone ?? null,
          mobilePhone: personalEditable.mobilePhone ?? null,
          address: personalEditable.address ?? null,
          municipalityId: personalEditable.municipalityId ?? null,
        }
      : null;

    return {
      usuario: {
        ...mapUsuarioAdminRow(row),
        vinculo_perfil: vinculoPerfil,
        personal: personalPayload,
      },
      overrides,
    };
  }
}
