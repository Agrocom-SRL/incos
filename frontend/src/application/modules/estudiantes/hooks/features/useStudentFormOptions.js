/**
 * Hook: useStudentFormOptions
 * 
 * Single Responsibility: Transformar datos del contexto en opciones de formulario
 * 
 * Clean Architecture:
 * - Application Layer: Hook de lógica específica para transformación de datos de formulario
 * - Solo se encarga de transformar datos a opciones consumibles por campos select/radio
 * 
 * SOLID Principles:
 * - Single Responsibility: Única responsabilidad de transformar datos a opciones
 * - Open/Closed: Extensible agregando nuevos tipos de datos sin modificar código existente
 * - Dependency Inversion: Depende de abstracciones (transformers genéricos)
 * 
 * Este hook:
 * - Transforma datos del contexto en formato consumible (resolveOptions)
 * - Usa mappers específicos del módulo que internamente usan transformers genéricos
 * 
 * Usado por: StudentRegisterProvider (para exponer resolveOptions vía Context)
 */

import { useMemo } from 'react';
import { transformToOptions as transformGeneric, excludeByMultipleFields } from '@application/utils';

/**
 * Factory de mappers predefinidos para tipos de datos de estudiantes
 * 
 * Mapea claves específicas a sus transformadores correspondientes
 * Co-localizado con el hook que lo usa
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
  tiposParentesco: (data) => transformGeneric('generic', data),
  departamentos: (data) => transformGeneric('generic', data),
  provincias: (data) => transformGeneric('generic', data),
  provinciasResidencia: (data) => transformGeneric('generic', data),
  segundaProvincias: (data) => transformGeneric('generic', data),
  municipios: (data) => transformGeneric('generic', data),
  municipiosResidencia: (data) => transformGeneric('generic', data),
  segundaMunicipios: (data) => transformGeneric('generic', data),
  
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
 */
const transformToOptions = (key, data) => {
  const mapper = studentMappers[key];
  
  if (!mapper) {
    console.warn(`[useStudentFormOptions] No mapper found for key: ${key}`);
    return [];
  }
  
  return mapper(data);
};

/**
 * Hook para transformar datos del contexto en opciones de formulario
 * 
 * @param {Object} contextData - Datos del contexto (expediciones, generos, paises, etc.)
 * @returns {Function} Función resolveOptions(key) que retorna opciones para el campo especificado
 */
export const useStudentFormOptions = (contextData) => {
  const {
    expediciones = [],
    generos = [],
    paises = [],
    idiomas = [],
    estadosCiviles = [],
    tiposSangre = [],
    discapacidades = [],
    gradosDiscapacidad = [],
    tiposOrigen = [],
    tiposParentesco = [],
    departamentos = [],
    provincias = [], // Para origen (primera nacionalidad)
    provinciasResidencia = [], // Para residencia
    segundaProvincias = [], // Para segunda nacionalidad
    municipios = [], // Para origen (primera nacionalidad)
    municipiosResidencia = [], // Para residencia
    segundaMunicipios = [], // Para segunda nacionalidad
  } = contextData || {};

  // Función para resolver opciones de campos select
  // Usa mappers centralizados para transformar datos del contexto a opciones de formulario
  // SOLID: Usa Strategy Pattern para mapear diferentes tipos de datos
  const resolveOptions = useMemo(() => {
    return (key) => {
      const dataMap = {
        expediciones,
        generos,
        paises,
        idiomas,
        estadosCiviles,
        tiposSangre,
        discapacidades,
        gradosDiscapacidad,
        tiposOrigen,
        tiposParentesco,
        departamentos,
        provincias, // Para origen (primera nacionalidad)
        provinciasResidencia, // Para residencia
        segundaProvincias, // Para segunda nacionalidad
        municipios, // Para origen (primera nacionalidad)
        municipiosResidencia, // Para residencia
        segundaMunicipios, // Para segunda nacionalidad
      };

      // Caso especial: paisesExtranjeros necesita todos los países para filtrar
      if (key === 'paisesExtranjeros') {
        return transformToOptions(key, paises);
      }

      // Caso especial: tiposOrigenPrimera filtra solo BOLIVIANA y EXTRANJERA (sin DOBLE_NACIONALIDAD)
      if (key === 'tiposOrigenPrimera') {
        const tiposOrigenFiltrados = tiposOrigen.filter(
          tipo => tipo.value === 'BOLIVIANA' || tipo.value === 'EXTRANJERA'
        );
        return transformToOptions('tiposOrigen', tiposOrigenFiltrados);
      }

      const data = dataMap[key];
      if (!data) {
        return [];
      }

      return transformToOptions(key, data);
    };
  }, [expediciones, generos, paises, idiomas, estadosCiviles, tiposSangre, discapacidades, gradosDiscapacidad, tiposOrigen, tiposParentesco, departamentos, provincias, provinciasResidencia, segundaProvincias, municipios, municipiosResidencia, segundaMunicipios]);

  return resolveOptions;
};

