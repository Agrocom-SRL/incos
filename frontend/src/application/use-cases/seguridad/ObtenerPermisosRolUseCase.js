export class ObtenerPermisosRolUseCase {
  constructor(rolAdminRepository) {
    this.rolAdminRepository = rolAdminRepository;
  }

  async ejecutar(rolId) {
    return this.rolAdminRepository.findPermisosById(rolId);
  }
}

