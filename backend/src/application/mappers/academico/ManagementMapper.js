/**
 * Mapper de aplicación: Management
 * Convierte entidades de dominio (Management) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Management entity)
 * - Usa BaseMapper para campos comunes
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una entidad Management a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 * 
 * @param {Management} management - Entidad de dominio Management
 * @returns {Object|null} Objeto en formato de presentación o null si management es null/undefined
 */
export function entityToPresentation(management) {
  if (!management) return null;

  const presentation = {};
  
  // Mapear campos base comunes (id, active, createdAt, updatedAt)
  BaseMapper.mapBaseFields(management, presentation);
  
  // Mapear campos específicos de Management
  // Solo incluir campos que existen en la entidad (usando mapFieldIfExists)
  // Esto es importante cuando se usan attributes limitados en las consultas
  BaseMapper.mapFieldIfExists(management, 'code', 'codigo', presentation);
  BaseMapper.mapFieldIfExists(management, 'name', 'nombre', presentation);
  BaseMapper.mapFieldIfExists(management, 'year', 'anio', presentation);
  BaseMapper.mapFieldIfExists(management, 'type', 'tipo', presentation);
  BaseMapper.mapFieldIfExists(management, 'startDate', 'fechaInicio', presentation);
  BaseMapper.mapFieldIfExists(management, 'endDate', 'fechaFin', presentation);
  BaseMapper.mapFieldIfExists(management, 'isActive', 'activo', presentation);

  return presentation;
}

/**
 * Convierte un array de entidades Management a formato de presentación
 * @param {Management[]} managements - Array de entidades de dominio Management
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(managements) {
  if (!Array.isArray(managements)) return [];
  return managements.map(entityToPresentation);
}

/**
 * Clase mapper para Management (exportada por compatibilidad)
 */
export class ManagementMapper {
  static entityToPresentation(management) {
    return entityToPresentation(management);
  }

  static entitiesToPresentation(managements) {
    return entitiesToPresentation(managements);
  }
}
