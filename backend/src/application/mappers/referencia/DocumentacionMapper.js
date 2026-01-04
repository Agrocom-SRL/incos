/**
 * Mapper de aplicación: Documentacion
 * Convierte entidades de dominio (Documentacion) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Documentacion entity)
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad Documentacion a formato de presentación
 * @param {Documentacion} documentacion - Entidad de dominio Documentacion
 * @returns {Object|null} Objeto en formato de presentación o null si documentacion es null/undefined
 */
export function entityToPresentation(documentacion) {
  if (!documentacion) return null;

  return {
    id: documentacion.id,
    nombre: documentacion.name,
    tipoDocumento: documentacion.documentType,
    aceptaFotocopia: documentacion.acceptsPhotocopy,
    requerido: documentacion.required,
    orden: documentacion.order,
    descripcion: documentacion.description,
    documentoPadreId: documentacion.documentoPadreId,
    esOriginal: documentacion.esOriginal,
    esDocumentoSistema: documentacion.esDocumentoSistema,
    activo: documentacion.active,
    createdAt: documentacion.createdAt,
  };
}

/**
 * Convierte un array de entidades Documentacion a formato de presentación
 * @param {Documentacion[]} documentaciones - Array de entidades de dominio Documentacion
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(documentaciones) {
  if (!Array.isArray(documentaciones)) return [];
  return documentaciones.map(entityToPresentation);
}

/**
 * Clase mapper para Documentacion (exportada por compatibilidad)
 */
export class DocumentacionMapper {
  static entityToPresentation(documentacion) {
    return entityToPresentation(documentacion);
  }

  static entitiesToPresentation(documentaciones) {
    return entitiesToPresentation(documentaciones);
  }
}

