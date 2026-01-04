/**
 * Mapper: MunicipalityMapper (Application Layer)
 * Convierte entidades de dominio (Municipality) a formato de presentación (API/Español)
 * 
 * Responsabilidad: Domain (inglés) ↔ Presentation (español)
 * 
 * Ubicación: Application Layer
 * Módulo: Geográficos
 */
export class MunicipalityMapper {
  /**
   * Convierte una entidad Municipality (dominio, inglés) a formato de presentación (castellano)
   * 
   * @param {Municipality} municipality - Entidad Municipality con nombres en inglés
   * @returns {Object} Objeto con nombres en castellano para la respuesta API
   */
  static entityToPresentation(municipality) {
    if (!municipality) return null;

    return {
      id: municipality.id,
      provinciaId: municipality.provinceId,
      nombre: municipality.name,
      codigo: municipality.code,
      activo: municipality.activo,
      createdAt: municipality.createdAt,
    };
  }

  /**
   * Convierte un array de entidades Municipality a formato de presentación
   * 
   * @param {Municipality[]} municipalities - Array de entidades Municipality
   * @returns {Object[]} Array de objetos con nombres en castellano
   */
  static entitiesToPresentation(municipalities) {
    if (!Array.isArray(municipalities)) return [];
    return municipalities.map((municipality) => this.entityToPresentation(municipality));
  }
}

