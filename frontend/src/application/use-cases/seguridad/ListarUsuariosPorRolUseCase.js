export class ListarUsuariosPorRolUseCase {
  constructor(rolAdminRepository) {
    this.rolAdminRepository = rolAdminRepository;
  }

  async ejecutar(id, params = {}) {
    return this.rolAdminRepository.findUsuariosByRolId(id, params);
  }
}
