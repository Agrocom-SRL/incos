export class CrearUsuarioUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(data) {
    if (!data?.username?.trim()) throw new Error('Username requerido');
    if (!data?.password || String(data.password).length < 8) throw new Error('Mínimo 8 caracteres');
    if (!data?.rol_id) throw new Error('Rol requerido');
    return this.usuarioAdminRepository.create(data);
  }
}

