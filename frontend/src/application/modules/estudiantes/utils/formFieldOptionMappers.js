/**
 * formFieldOptionMappers - Mappers específicos para estudiantes (wrapper sobre transformers genéricos)
 * 
 * Single Responsibility: Proporcionar mappers específicos del módulo de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades específicas del módulo de estudiantes
 * - Usa transformers genéricos de @application/utils
 * 
 * SOLID Principles:
 * - Single Responsibility: Mappers específicos para tipos de datos de estudiantes
 * - Dependency Inversion: Depende de transformers genéricos (abstracciones)
 * 
 * Este archivo mantiene compatibilidad con el formato anterior mientras usa
 * los transformers genéricos compartidos.
 * 
 * Uso: Solo dentro del módulo de estudiantes
 * Para uso general, usar directamente los transformers de @application/utils
 */

import { transformToOptions as transformGeneric, excludeByMultipleFields } from '@application/utils';

/**
 * Factory de mappers predefinidos para tipos de datos de estudiantes
 * 
 * Mapea claves específicas a sus transformadores correspondientes
 */
const studentMappers = {
  // Mappers genéricos (para datos con estructura { id, nombre })
  expediciones: (data) => transformGeneric('generic', data),
  generos: (data) => transformGeneric('generic', data),
  paises: (data) => transformGeneric('generic', data),
  idiomas: (data) => transformGeneric('generic', data),
  estadosCiviles: (data) => transformGeneric('generic', data),
  tiposSangre: (data) => transformGeneric('generic', data),
  discapacidades: (data) => transformGeneric('generic', data),
  departamentos: (data) => transformGeneric('generic', data),
  provincias: (data) => transformGeneric('generic', data),
  municipios: (data) => transformGeneric('generic', data),
  
  // Mappers para datos con estructura { label, value }
  gradosDiscapacidad: (data) => transformGeneric('labelValue', data),
  tiposOrigen: (data) => transformGeneric('labelValue', data),
  
  // Caso especial: paisesExtranjeros (países sin Bolivia)
  paisesExtranjeros: (data) => {
    const filterFn = excludeByMultipleFields([
      { field: 'codigo_iso', value: 'BOL' },
      { field: 'codigoIso', value: 'BOL' },
      { field: 'nombre', value: 'Bolivia' },
    ]);
    return transformGeneric('generic', data, filterFn);
  },
};

/**
 * Transforma datos del contexto en opciones de campos de formulario
 * 
 * Wrapper que mantiene compatibilidad con el formato anterior
 * pero usa los transformers genéricos internamente
 * 
 * @param {string} key - Clave del tipo de opción (ej: 'idiomas', 'generos', 'paisesExtranjeros')
 * @param {*} data - Datos a transformar
 * @returns {Array} Array de opciones con formato { label, value } para campos de formulario
 * 
 * @deprecated Para nuevo código, usar directamente transformToOptions de @application/utils
 */
export const transformToOptions = (key, data) => {
  const mapper = studentMappers[key];
  
  if (!mapper) {
    console.warn(`[formFieldOptionMappers] No mapper found for key: ${key}`);
    return [];
  }
  
  return mapper(data);
};

/**
 * Exportar mappers para uso directo si es necesario
 */
export const formFieldOptionMappers = studentMappers;
