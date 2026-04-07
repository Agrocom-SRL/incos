export class AgregarOverridePermisoUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(usuarioId, data) {
    if (!['GRANT', 'REVOKE'].includes(data?.tipo)) throw new Error('Tipo inválido');
    return this.usuarioAdminRepository.addOverride(usuarioId, data);
  }
}

