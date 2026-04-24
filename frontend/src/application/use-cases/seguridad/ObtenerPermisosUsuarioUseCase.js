export class ObtenerPermisosUsuarioUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(id) {
    return this.usuarioAdminRepository.findPermisos(id);
  }
}

