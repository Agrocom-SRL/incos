/**
 * Mapper de aplicación: Documentation
 * Convierte entidades de dominio (Documentation) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Documentation entity)
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad Documentation a formato de presentación
 * @param {Documentation} documentation - Entidad de dominio Documentation
 * @returns {Object|null} Objeto en formato de presentación o null si documentation es null/undefined
 */
export function entityToPresentation(documentation) {
  if (!documentation) return null;

  return {
    id: documentation.id,
    nombre: documentation.name,
    tipoDocumento: documentation.documentType,
    aceptaFotocopia: documentation.acceptsPhotocopy,
    requerido: documentation.required,
    orden: documentation.order,
    descripcion: documentation.description,
    documentoPadreId: documentation.parentDocumentId,
    esDocumentoSistema: documentation.isSystemDocument,
    activo: documentation.active,
    createdAt: documentation.createdAt,
  };
}

/**
 * Convierte un array de entidades Documentation a formato de presentación
 * @param {Documentation[]} documentations - Array de entidades de dominio Documentation
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(documentations) {
  if (!Array.isArray(documentations)) return [];
  return documentations.map(entityToPresentation);
}

/**
 * Clase mapper para Documentation (exportada por compatibilidad)
 */
export class DocumentacionMapper {
  static entityToPresentation(documentation) {
    return entityToPresentation(documentation);
  }

  static entitiesToPresentation(documentations) {
    return entitiesToPresentation(documentations);
  }
}

