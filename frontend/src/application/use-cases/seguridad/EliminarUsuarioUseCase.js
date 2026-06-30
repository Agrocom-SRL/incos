export class EliminarUsuarioUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(id) {
    if (id == null) throw new Error('Id de usuario requerido');
    return this.usuarioAdminRepository.remove(id);
  }
}
