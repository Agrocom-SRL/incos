/**
 * Devuelve permisos agrupados por grupo_ui para el panel de seguridad.
 * Separa: que esta asignado al rol vs que es valido para el permiso.
 */
export class ObtenerPermisosGrillaRolUseCase {
  constructor({ rolPermisoRepository }) {
    this.rolPermisoRepository = rolPermisoRepository;
  }

  /**
   * @param {number} rolId
   * @param {string} dominio
   */
  async execute(rolId, dominio) {
    if (!dominio) {
      throw new Error('El parámetro dominio es obligatorio');
    }

    return this.rolPermisoRepository.findPermisosParaGrilla(rolId, dominio);
  }
}
