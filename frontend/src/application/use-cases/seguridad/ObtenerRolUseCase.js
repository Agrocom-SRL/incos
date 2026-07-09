export class ObtenerRolUseCase {
  constructor(rolAdminRepository) {
    this.rolAdminRepository = rolAdminRepository;
  }

  async ejecutar(id) {
    return this.rolAdminRepository.findById(id);
  }
}
