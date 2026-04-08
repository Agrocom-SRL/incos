export class ObtenerPermisosGrillaRolUseCase {
  constructor(rolAdminRepository) {
    this.rolAdminRepository = rolAdminRepository;
  }

  /**
   * @param {number} rolId
   * @param {string} dominio
   * @returns {Promise<Array<{ grupoUi: string, rutaSidebar: string, codigos: string[], accionesValidas: string[], accionesAsignadas: string[] }>>}
   */
  async ejecutar(rolId, dominio) {
    return this.rolAdminRepository.findPermisosGrillaById(rolId, dominio);
  }
}
