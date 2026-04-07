export class ActualizarUsuarioUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(id, data) {
    return this.usuarioAdminRepository.update(id, data);
  }
}

