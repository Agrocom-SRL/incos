/**
 * Generador de hooks de API con patrón consistente
 * 
 * Single Responsibility: Crear hooks de API optimizados con patrón consistente
 * 
 * Clean Architecture:
 * - Application Layer: Utilidad genérica para crear hooks de API
 * 
 * Este generador permite crear hooks de API simples con menos código repetitivo,
 * manteniendo todas las optimizaciones de estado y manejo de errores.
 * 
 * Características:
 * - Setters optimizados automáticos (array, object, primitive)
 * - Manejo de errores consistente
 * - Mappers opcionales
 * - Validaciones opcionales
 * - Auto-fetch opcional (useEffect)
 * - Logs de diagnóstico opcionales
 * - Referencia estable del resultado
 * 
 * @example
 * // Hook simple para obtener por ID
 * export const useGetStudentById = createApiHook({
 *   name: 'useGetStudentById',
 *   useCase: 'obtenerEstudiantePorId',
 *   dataType: 'object', // 'object' | 'array'
 *   initialLoading: false,
 * });
 * 
 * @example
 * // Hook con mapper y auto-fetch
 * export const useCarrerasApi = createApiHook({
 *   name: 'useCarrerasApi',
 *   useCase: 'obtenerTodasCarreras',
 *   dataType: 'array',
 *   mapper: mapCarrerasList,
 *   initialLoading: true,
 *   autoFetch: true, // Carga automáticamente al montar
 * });
 * 
 * @example
 * // Hook con validación personalizada
 * export const useGetStudentById = createApiHook({
 *   name: 'useGetStudentById',
 *   useCase: 'obtenerEstudiantePorId',
 *   dataType: 'object',
 *   validate: (id) => {
 *     if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
 *       return 'ID del estudiante es requerido';
 *     }
 *     return null;
 *   },
 * });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import {
  createOptimizedArraySetter,
  createOptimizedPrimitiveSetter,
  createOptimizedObjectSetter,
} from '@application/utils/state';
import {
  extractErrorFromResult,
  normalizeError,
} from '@application/utils/error';
import { useStableApiResult } from './useStableApiResult';

/**
 * Crea un hook de API optimizado con patrón consistente
 * 
 * @param {Object} config - Configuración del hook
 * @param {string} config.name - Nombre del hook (para logs)
 * @param {string} config.useCase - Nombre del método en useCasesFactory (ej: 'obtenerEstudiantePorId')
 * @param {'array'|'object'} [config.dataType='object'] - Tipo de dato: 'array' para listas, 'object' para objetos únicos
 * @param {Function} [config.mapper] - Función para mapear los datos antes de guardarlos
 * @param {Function} [config.validate] - Función de validación que retorna null si es válido o mensaje de error
 * @param {boolean} [config.initialLoading=false] - Estado inicial de loading
 * @param {boolean} [config.autoFetch=false] - Si true, ejecuta fetch automáticamente al montar
 * @param {*} [config.autoFetchArgs] - Argumentos para autoFetch (si autoFetch es true)
 * @param {boolean} [config.enableLogs] - Activar logs de diagnóstico (default: import.meta.env.DEV && true)
 * @param {string} [config.dataKey='data'] - Nombre de la propiedad en el resultado (default: 'data')
 * @param {string} [config.fetchName='fetch'] - Nombre de la función fetch (default: 'fetch')
 * @param {string} [config.errorMessage] - Mensaje de error por defecto
 * @param {string} [config.paginationKey] - Si el use case devuelve { data, pagination }, clave para exponer pagination en el resultado (ej: 'pagination')
 * @returns {Function} Hook de React
 */
export const createApiHook = ({
  name,
  useCase,
  dataType = 'object',
  mapper,
  validate,
  initialLoading = false,
  autoFetch = false,
  autoFetchArgs,
  enableLogs = false,
  dataKey = 'data',
  fetchName = 'fetch',
  errorMessage,
  paginationKey,
}) => {
  return () => {
    // Estado inicial según el tipo de dato
    const initialData = dataType === 'array' ? [] : null;
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(initialLoading);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(paginationKey ? null : undefined);

    // Setters optimizados para evitar actualizaciones innecesarias
    // Usar useRef para mantener referencias estables (setState de React ya es estable)
    const optimizedSetDataRef = useRef(null);
    const optimizedSetLoadingRef = useRef(null);
    const optimizedSetErrorRef = useRef(null);

    // Inicializar los setters optimizados una sola vez
    if (!optimizedSetDataRef.current) {
      // Seleccionar el setter optimizado según el tipo de dato
      const setterFactory = dataType === 'array'
        ? createOptimizedArraySetter
        : createOptimizedObjectSetter;

      optimizedSetDataRef.current = setterFactory(setData);
      optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
      optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
    }

    /**
     * Función centralizada para obtener datos desde la API
     * 
     * @param {...any} args - Argumentos para pasar al use case
     */
    const fetch = useCallback(async (...args) => {
      // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
      optimizedSetLoadingRef.current(true);
      optimizedSetErrorRef.current(null);

      try {
        // 1. Validación personalizada (si existe)
        if (validate) {
          const validationError = validate(...args);
          if (validationError) {
            optimizedSetErrorRef.current(validationError);
            optimizedSetDataRef.current(initialData);
            return;
          }
        }

        // 2. Obtener el Use Case desde el container
        const useCaseInstance = useCasesFactory[useCase]();
        if (!useCaseInstance) {
          throw new Error(`Use Case '${useCase}' no encontrado en useCasesFactory`);
        }

        // 3. Ejecutar el Use Case
        const result = await useCaseInstance.ejecutar(...args);

        // 4. Si hay error, manejarlo
        if (!result.success) {
          const errorMsg = extractErrorFromResult(
            result,
            errorMessage || `Error al cargar datos en ${name}`
          );
          optimizedSetErrorRef.current(errorMsg);
          optimizedSetDataRef.current(initialData);
          if (paginationKey) setPagination(null);
          return;
        }

        // 5. Si hay éxito, mapear (si existe mapper) y actualizar el estado
        let finalData = result.data;

        // Aplicar mapper si existe
        if (mapper) {
          finalData = mapper(finalData);
        }

        // OPTIMIZACIÓN: Solo actualizar el estado si los datos realmente cambiaron
        optimizedSetDataRef.current(finalData);
        if (paginationKey && result.pagination != null) {
          setPagination(result.pagination);
        } else if (paginationKey) {
          setPagination(null);
        }
      } catch (err) {
        // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
        const errorMsg = normalizeError(
          err,
          errorMessage || `Error inesperado en ${name}`
        );
        optimizedSetErrorRef.current(errorMsg);
        optimizedSetDataRef.current(initialData);
        if (paginationKey) setPagination(null);
      } finally {
        // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
        optimizedSetLoadingRef.current(false);
      }
    }, []); // Sin dependencias porque los setters están en refs estables

    // Auto-fetch si está configurado
    useEffect(() => {
      if (autoFetch) {
        if (autoFetchArgs !== undefined) {
          // Si autoFetchArgs es un array, usar spread, sino pasar como argumento único
          const args = Array.isArray(autoFetchArgs) ? autoFetchArgs : [autoFetchArgs];
          fetch(...args);
        } else {
          fetch();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch]); // fetch es estable (no cambia), autoFetchArgs se pasa como prop estática

    /**
     * Función para recargar los datos manualmente.
     * Si se llama sin argumentos y existe autoFetchArgs, usa esos argumentos
     * (así la recarga obtiene el mismo conjunto de datos que la carga inicial).
     */
    const refetch = useCallback(async (...args) => {
      if (args.length === 0 && autoFetchArgs !== undefined) {
        const argsToUse = Array.isArray(autoFetchArgs) ? autoFetchArgs : [autoFetchArgs];
        await fetch(...argsToUse);
      } else {
        await fetch(...args);
      }
    }, [fetch, autoFetchArgs]);

    // Construir el objeto de resultado
    const result = {
      [dataKey]: data,
      loading,
      error,
      [fetchName]: fetch,
      refetch,
    };
    if (paginationKey) {
      result[paginationKey] = pagination ?? null;
    }

    // Usar helper para mantener referencia estable del resultado
    return useStableApiResult(result, enableLogs, name);
  };
};
