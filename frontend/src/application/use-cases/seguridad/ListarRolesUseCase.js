export class ListarRolesUseCase {
  constructor(rolAdminRepository) {
    this.rolAdminRepository = rolAdminRepository;
  }

  async ejecutar() {
    return this.rolAdminRepository.findAll();
  }
}

