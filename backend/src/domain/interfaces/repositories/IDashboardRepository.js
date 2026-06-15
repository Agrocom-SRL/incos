/**
 * Interfaz de Repositorio (solo lectura): IDashboardRepository
 *
 * Lecturas agregadas del dashboard desde vistas SQL (41–49) y tablas base.
 * NO extiende IRepository: repositorio de SOLO LECTURA.
 */
export class IDashboardRepository {
  /** @param {number} [limit] @returns {Promise<Array<Object>>} */
  async findActividadesRecientes(limit) {
    throw new Error('Method findActividadesRecientes() must be implemented');
  }

  /** @returns {Promise<Object>} */
  async countEstudiantesRegistradosHoyYMes() {
    throw new Error('Method countEstudiantesRegistradosHoyYMes() must be implemented');
  }

  /** @param {number} [limit] @returns {Promise<Array<Object>>} */
  async findDocentesRecientes(limit) {
    throw new Error('Method findDocentesRecientes() must be implemented');
  }

  /** @param {number} [limit] @returns {Promise<Array<Object>>} */
  async findCarrerasDestacadas(limit) {
    throw new Error('Method findCarrerasDestacadas() must be implemented');
  }

  /** @param {number} [limit] @returns {Promise<Array<Object>>} */
  async findEstudiantesRecientes(limit) {
    throw new Error('Method findEstudiantesRecientes() must be implemented');
  }
}
