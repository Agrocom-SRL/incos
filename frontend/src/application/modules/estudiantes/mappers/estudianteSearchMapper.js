/**
 * Mapper: estudianteSearchMapper
 * 
 * Single Responsibility: Normalizar y transformar la respuesta de búsqueda del backend
 * 
 * El backend puede retornar:
 * - { data: { student: {...} } } → Un solo estudiante
 * - { data: { student: [...] } } → Array de estudiantes
 * 
 * Este mapper:
 * 1. Normaliza la estructura (convierte a array)
 * 2. Transforma cada estudiante al formato de UI usando mapEstudiantesList
 * 
 * Clean Architecture:
 * - Application Layer: Mapper que transforma datos del backend al formato de UI
 * - Normaliza la estructura y transforma campos para presentación
 */

import { mapEstudiantesList } from './estudianteListMapper';

/**
 * Normaliza la estructura de la respuesta de búsqueda del backend
 * (Convierte objeto único a array)
 * 
 * @param {Object} resultData - Datos de la respuesta del backend
 * @returns {Array} Array de estudiantes normalizado (datos crudos)
 */
const normalizeSearchStructure = (resultData) => {
  if (!resultData) {
    return [];
  }

  // Si el backend retorna { student: {...} }, extraerlo y convertir a array
  if (resultData.student) {
    return Array.isArray(resultData.student) 
      ? resultData.student 
      : [resultData.student];
  }

  // Si ya es un array, retornarlo directamente
  if (Array.isArray(resultData)) {
    return resultData;
  }

  // Si no hay datos reconocibles, retornar array vacío
  return [];
};

/**
 * Normaliza y transforma la respuesta de búsqueda del backend
 * 
 * 1. Normaliza la estructura (objeto → array)
 * 2. Transforma cada estudiante al formato de UI (ciCompleto, nombreCompleto, etc.)
 * 
 * @param {Object} resultData - Datos de la respuesta del backend
 * @returns {Array} Array de estudiantes transformados para la UI
 */
export const normalizeSearchResponse = (resultData) => {
  // 1. Normalizar estructura (convertir a array de estudiantes crudos)
  const estudiantesNormalizados = normalizeSearchStructure(resultData);
  
  // 2. Transformar cada estudiante al formato de UI
  return mapEstudiantesList(estudiantesNormalizados);
};
