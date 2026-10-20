/**
 * Mapper de aplicación: BecaDescuento
 * Convierte entidades de dominio (Scholarship) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Scholarship entity)
 * - Usa BaseMapper para campos comunes
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una entidad Scholarship a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 *
 * @param {Scholarship} scholarship - Entidad de dominio Scholarship
 * @returns {Object|null} Objeto en formato de presentación o null si scholarship es null/undefined
 */
export function entityToPresentation(scholarship) {
  if (!scholarship) return null;

  const presentation = {};

  // Mapear campos base comunes (id, active, createdAt, updatedAt)
  BaseMapper.mapBaseFields(scholarship, presentation);

  // Mapear campos específicos de Scholarship
  // Solo incluir campos que existen en la entidad (usando mapFieldIfExists)
  // Esto es importante cuando se usan attributes limitados en las consultas
  BaseMapper.mapFieldIfExists(scholarship, 'name', 'nombre', presentation);
  BaseMapper.mapFieldIfExists(scholarship, 'code', 'codigo', presentation);
  BaseMapper.mapFieldIfExists(scholarship, 'percentage', 'porcentaje', presentation);
  BaseMapper.mapFieldIfExists(scholarship, 'description', 'descripcion', presentation);
  BaseMapper.mapFieldIfExists(scholarship, 'requiresDocumentation', 'requiereDocumentacion', presentation);
  BaseMapper.mapFieldIfExists(scholarship, 'requiresRectorApproval', 'requiereAprobacionRector', presentation);
  BaseMapper.mapFieldIfExists(scholarship, 'isAutomatic', 'esAutomatica', presentation);
  BaseMapper.mapFieldIfExists(scholarship, 'automaticType', 'tipoAutomatica', presentation);
  BaseMapper.mapFieldIfExists(scholarship, 'minimumAverage', 'promedioMinimo', presentation);

  return presentation;
}

/**
 * Convierte un array de entidades Scholarship a formato de presentación
 * @param {Scholarship[]} scholarships - Array de entidades de dominio Scholarship
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(scholarships) {
  if (!Array.isArray(scholarships)) return [];
  return scholarships.map(entityToPresentation);
}

/**
 * Clase mapper para BecaDescuento (exportada por compatibilidad)
 */
export class BecaDescuentoMapper {
  static entityToPresentation(scholarship) {
    return entityToPresentation(scholarship);
  }

  static entitiesToPresentation(scholarships) {
    return entitiesToPresentation(scholarships);
  }
}
