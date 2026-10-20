/**
 * Mapper de aplicación: Career
 * Convierte entidades de dominio (Career) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Career entity)
 * - Usa BaseMapper para campos comunes
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una entidad Career a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 *
 * @param {Career} career - Entidad de dominio Career
 * @returns {Object|null} Objeto en formato de presentación o null si career es null/undefined
 */
export function entityToPresentation(career) {
  if (!career) return null;

  const presentation = {};

  // Mapear campos base comunes (id, active, createdAt, updatedAt)
  BaseMapper.mapBaseFields(career, presentation);

  // Mapear campos específicos de Career
  // Solo incluir campos que existen en la entidad (usando mapFieldIfExists)
  // Esto es importante cuando se usan attributes limitados en las consultas
  BaseMapper.mapFieldIfExists(career, 'code', 'codigo', presentation);
  BaseMapper.mapFieldIfExists(career, 'name', 'nombre', presentation);
  BaseMapper.mapFieldIfExists(career, 'description', 'descripcion', presentation);
  BaseMapper.mapFieldIfExists(career, 'trainingArea', 'areaFormacion', presentation);
  BaseMapper.mapFieldIfExists(career, 'grantedTitle', 'tituloOtorgado', presentation);
  BaseMapper.mapFieldIfExists(career, 'colorHex', 'colorHex', presentation);
  BaseMapper.mapFieldIfExists(career, 'imagePath', 'imagenRuta', presentation);

  return presentation;
}

/**
 * Convierte un array de entidades Career a formato de presentación
 * @param {Career[]} careers - Array de entidades de dominio Career
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(careers) {
  if (!Array.isArray(careers)) return [];
  return careers.map(entityToPresentation);
}

/**
 * Clase mapper para Career (exportada por compatibilidad)
 */
export class CareerMapper {
  static entityToPresentation(career) {
    return entityToPresentation(career);
  }

  static entitiesToPresentation(careers) {
    return entitiesToPresentation(careers);
  }
}
