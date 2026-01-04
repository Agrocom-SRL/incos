/**
 * Mapper de aplicación: Language
 * Convierte entidades de dominio (Language) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Language entity)
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad Language a formato de presentación
 * @param {Language} language - Entidad de dominio Language
 * @returns {Object|null} Objeto en formato de presentación o null si language es null/undefined
 */
export function entityToPresentation(language) {
  if (!language) return null;

  return {
    id: language.id,
    nombre: language.name,
    codigoIso: language.isoCode,
    activo: language.active,
    createdAt: language.createdAt,
  };
}

/**
 * Convierte un array de entidades Language a formato de presentación
 * @param {Language[]} languages - Array de entidades de dominio Language
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(languages) {
  if (!Array.isArray(languages)) return [];
  return languages.map(entityToPresentation);
}

/**
 * Clase mapper para Language (exportada por compatibilidad)
 */
export class LanguageMapper {
  static entityToPresentation(language) {
    return entityToPresentation(language);
  }

  static entitiesToPresentation(languages) {
    return entitiesToPresentation(languages);
  }
}

