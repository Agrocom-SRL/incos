export class ActualizarPermisosRolUseCase {
  constructor(rolAdminRepository) {
    this.rolAdminRepository = rolAdminRepository;
  }

  async ejecutar(rolId, asignaciones) {
    if (!Array.isArray(asignaciones) || asignaciones.length === 0) {
      throw new Error('Asignaciones requeridas');
    }
    return this.rolAdminRepository.updatePermisos(rolId, { asignaciones });
  }
}

