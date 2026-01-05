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
import { transformToOptions } from '../../utils/formFieldOptionMappers';

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
    departamentos = [],
    provincias = [],
    municipios = [],
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
        departamentos,
        provincias,
        municipios,
      };

      // Caso especial: paisesExtranjeros necesita todos los países para filtrar
      if (key === 'paisesExtranjeros') {
        return transformToOptions(key, paises);
      }

      const data = dataMap[key];
      if (!data) {
        return [];
      }

      return transformToOptions(key, data);
    };
  }, [expediciones, generos, paises, idiomas, estadosCiviles, tiposSangre, discapacidades, gradosDiscapacidad, tiposOrigen, departamentos, provincias, municipios]);

  return resolveOptions;
};

