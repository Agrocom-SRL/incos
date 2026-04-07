export class ListarUsuariosUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(params = {}) {
    return this.usuarioAdminRepository.findAll(params);
  }
}

