export class EliminarOverridePermisoUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(usuarioId, overrideId) {
    return this.usuarioAdminRepository.removeOverride(usuarioId, overrideId);
  }
}

