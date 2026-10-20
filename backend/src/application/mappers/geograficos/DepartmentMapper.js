/**
 * Mapper: DepartmentMapper (Application Layer)
 * Convierte entidades de dominio (Department) a formato de presentación (API/Español)
 *
 * Responsabilidad: Domain (inglés) ↔ Presentation (español)
 *
 * Ubicación: Application Layer
 * Módulo: Geográficos
 */
export class DepartmentMapper {
  /**
   * Convierte una entidad Department (dominio, inglés) a formato de presentación (castellano)
   *
   * @param {Department} department - Entidad Department con nombres en inglés
   * @returns {Object} Objeto con nombres en castellano para la respuesta API
   */
  static entityToPresentation(department) {
    if (!department) return null;

    return {
      id: department.id,
      paisId: department.countryId,
      nombre: department.name,
      codigo: department.code,
      activo: department.activo,
      createdAt: department.createdAt,
    };
  }

  /**
   * Convierte un array de entidades Department a formato de presentación
   *
   * @param {Department[]} departments - Array de entidades Department
   * @returns {Object[]} Array de objetos con nombres en castellano
   */
  static entitiesToPresentation(departments) {
    if (!Array.isArray(departments)) return [];
    return departments.map((department) => this.entityToPresentation(department));
  }
}
