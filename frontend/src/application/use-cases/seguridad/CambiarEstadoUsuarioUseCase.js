export class CambiarEstadoUsuarioUseCase {
  constructor(usuarioAdminRepository) {
    this.usuarioAdminRepository = usuarioAdminRepository;
  }

  async ejecutar(id, estado, motivo) {
    if (estado !== null && estado !== undefined && !motivo) throw new Error('Motivo requerido');
    return this.usuarioAdminRepository.changeEstado(id, { estado, motivo });
  }
}

