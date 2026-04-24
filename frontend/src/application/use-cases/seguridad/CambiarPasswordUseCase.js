export class CambiarPasswordUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(id, passwordNuevo) {
    if (!passwordNuevo || passwordNuevo.length < 8) throw new Error('Mínimo 8 caracteres');
    return this.usuarioAdminRepository.changePassword(id, { password_nuevo: passwordNuevo });
  }
}

