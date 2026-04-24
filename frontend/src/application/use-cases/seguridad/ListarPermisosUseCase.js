export class ListarPermisosUseCase {
  constructor(permisoAdminRepository) {
    this.permisoAdminRepository = permisoAdminRepository;
  }

  async ejecutar(dominio) {
    return this.permisoAdminRepository.findAllAgrupados(dominio);
  }
}

