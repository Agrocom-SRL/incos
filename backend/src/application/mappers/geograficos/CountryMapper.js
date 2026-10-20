/**
 * Mapper: CountryMapper (Application Layer)
 * Convierte entidades de dominio (Country) a formato de presentación (API/Español)
 *
 * Responsabilidad: Domain (inglés) ↔ Presentation (español)
 *
 * Ubicación: Application Layer
 * Módulo: Geográficos
 *
 * Diferencia con infrastructure/mappers/CountryMapper:
 * - Infrastructure: ORM (Sequelize) ↔ Domain (entidades)
 * - Application: Domain (entidades) ↔ Presentation (API)
 */
export class CountryMapper {
  /**
   * Convierte una entidad Country (dominio, inglés) a formato de presentación (castellano)
   *
   * @param {Country} country - Entidad Country con nombres en inglés
   * @returns {Object} Objeto con nombres en castellano para la respuesta API
   */
  static entityToPresentation(country) {
    if (!country) return null;

    return {
      id: country.id,
      nombre: country.name,
      codigoIso: country.isoCode,
      activo: country.activo,
      createdAt: country.createdAt,
    };
  }

  /**
   * Convierte un array de entidades Country a formato de presentación
   *
   * @param {Country[]} countries - Array de entidades Country
   * @returns {Object[]} Array de objetos con nombres en castellano
   */
  static entitiesToPresentation(countries) {
    if (!Array.isArray(countries)) return [];
    return countries.map((country) => this.entityToPresentation(country));
  }
}
