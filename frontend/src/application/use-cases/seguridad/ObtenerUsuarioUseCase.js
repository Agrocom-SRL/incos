export class ObtenerUsuarioUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(id) {
    return this.usuarioAdminRepository.findById(id);
  }
}

