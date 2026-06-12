/**
 * Interfaz de Repositorio (solo lectura): ISeguridadAltaUsuarioLookupRepository
 *
 * Lookups de estudiantes/docentes sin cuenta para el alta de usuarios, desde
 * vistas SQL de seguridad. NO extiende IRepository: repositorio de SOLO LECTURA.
 */
export class ISeguridadAltaUsuarioLookupRepository {
  /** @param {string} searchTerm @param {number} [limit] @returns {Promise<Array<Object>>} */
  async buscarEstudiantesSinCuenta(searchTerm, limit) {
    throw new Error('Method buscarEstudiantesSinCuenta() must be implemented');
  }

  /** @param {string} searchTerm @param {number} [limit] @returns {Promise<Array<Object>>} */
  async buscarDocentesSinCuenta(searchTerm, limit) {
    throw new Error('Method buscarDocentesSinCuenta() must be implemented');
  }
}
