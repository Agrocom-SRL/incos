/**
 * Mapper: ProvinceMapper (Application Layer)
 * Convierte entidades de dominio (Province) a formato de presentación (API/Español)
 *
 * Responsabilidad: Domain (inglés) ↔ Presentation (español)
 *
 * Ubicación: Application Layer
 * Módulo: Geográficos
 */
export class ProvinceMapper {
  /**
   * Convierte una entidad Province (dominio, inglés) a formato de presentación (castellano)
   *
   * @param {Province} province - Entidad Province con nombres en inglés
   * @returns {Object} Objeto con nombres en castellano para la respuesta API
   */
  static entityToPresentation(province) {
    if (!province) return null;

    return {
      id: province.id,
      departamentoId: province.departmentId,
      nombre: province.name,
      codigo: province.code,
      activo: province.activo,
      createdAt: province.createdAt,
    };
  }

  /**
   * Convierte un array de entidades Province a formato de presentación
   *
   * @param {Province[]} provinces - Array de entidades Province
   * @returns {Object[]} Array de objetos con nombres en castellano
   */
  static entitiesToPresentation(provinces) {
    if (!Array.isArray(provinces)) return [];
    return provinces.map((province) => this.entityToPresentation(province));
  }
}
