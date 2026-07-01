export class CrearRolUseCase {
  constructor(rolAdminRepository) {
    this.rolAdminRepository = rolAdminRepository;
  }

  async ejecutar(data) {
    const codigo = String(data?.codigo ?? '').trim().toUpperCase();
    const nombre = String(data?.nombre ?? '').trim();
    if (!codigo) throw new Error('Código requerido');
    if (!/^[A-Z0-9_]+$/.test(codigo)) {
      throw new Error('El código solo admite mayúsculas, números y guion bajo');
    }
    if (!nombre) throw new Error('Nombre requerido');
    const payload = { codigo, nombre };
    const tipo = data?.tipo ? String(data.tipo).trim() : undefined;
    if (tipo) payload.tipo = tipo;
    return this.rolAdminRepository.create(payload);
  }
}
