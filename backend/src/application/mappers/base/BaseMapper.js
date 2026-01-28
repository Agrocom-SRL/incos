/**
 * Mapper base para la capa de aplicación
 * Proporciona funcionalidad común para mappers de presentación (vista → API)
 *
 * Rol: solo el mapeo campo a campo condicional (origen → presentación).
 * Para el resto (parsear JSON de columnas, mapear arrays de filas, normalizar IDs)
 * se usa domain/utils/mapUtils.js (parseJsonArray, mapRows, normalizeId, createMap).
 *
 * Referencia simple: ContributionPaymentMapper (una fila → un objeto, solo BaseMapper).
 * Variantes: StudentPersonalDataMapper (fila con JSON → parseJsonArray + BaseMapper por ítem),
 *            StudentDocumentDeliveryViewMapper (filas → mapRows(rows, rowToPresentation)).
 */

/**
 * Mapea campos base comunes de una entidad a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 * 
 * @param {Object} entity - Entidad de dominio o objeto plano
 * @param {Object} presentation - Objeto de presentación donde agregar los campos base
 * @returns {Object} Objeto de presentación con campos base agregados
 */
export function mapBaseFields(entity, presentation = {}) {
  if (!entity) return presentation;

  // Solo incluir campos que existen en la entidad
  if (entity.hasOwnProperty('id') && entity.id !== undefined) {
    presentation.id = entity.id;
  }
  if (entity.hasOwnProperty('active') && entity.active !== undefined) {
    presentation.activo = entity.active;
  }
  if (entity.hasOwnProperty('createdAt') && entity.createdAt !== undefined) {
    presentation.createdAt = entity.createdAt;
  }
  if (entity.hasOwnProperty('updatedAt') && entity.updatedAt !== undefined) {
    presentation.updatedAt = entity.updatedAt;
  }

  return presentation;
}

/**
 * Mapea un campo condicionalmente solo si existe en la entidad
 * Útil para mapear campos opcionales o cuando se usan attributes limitados
 * 
 * @param {Object} entity - Entidad de dominio o objeto plano
 * @param {string} sourceField - Nombre del campo en la entidad (camelCase)
 * @param {string} targetField - Nombre del campo en la presentación (snake_case)
 * @param {Object} presentation - Objeto de presentación donde agregar el campo
 * @returns {Object} Objeto de presentación con el campo agregado si existe
 */
export function mapFieldIfExists(entity, sourceField, targetField, presentation = {}) {
  if (!entity) return presentation;

  if (entity.hasOwnProperty(sourceField) && entity[sourceField] !== undefined) {
    presentation[targetField] = entity[sourceField];
  }

  return presentation;
}

/**
 * Clase base para mappers de aplicación
 * Proporciona métodos estáticos comunes
 */
export class BaseMapper {
  /**
   * Mapea campos base comunes
   * @param {Object} entity - Entidad de dominio
   * @param {Object} presentation - Objeto de presentación
   * @returns {Object} Objeto de presentación con campos base
   */
  static mapBaseFields(entity, presentation = {}) {
    return mapBaseFields(entity, presentation);
  }

  /**
   * Mapea un campo condicionalmente
   * @param {Object} entity - Entidad de dominio
   * @param {string} sourceField - Campo en la entidad
   * @param {string} targetField - Campo en la presentación
   * @param {Object} presentation - Objeto de presentación
   * @returns {Object} Objeto de presentación con el campo agregado
   */
  static mapFieldIfExists(entity, sourceField, targetField, presentation = {}) {
    return mapFieldIfExists(entity, sourceField, targetField, presentation);
  }
}
