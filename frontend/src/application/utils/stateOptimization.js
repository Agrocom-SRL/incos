/**
 * Helpers para optimización de estado en React
 * 
 * Estos helpers permiten crear setters optimizados que solo actualizan el estado
 * cuando los datos realmente cambian, evitando renders innecesarios.
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades genéricas reutilizables
 * 
 * Uso:
 * ```javascript
 * const [students, setStudents] = useState([]);
 * const optimizedSetStudents = createOptimizedArraySetter(setStudents);
 * 
 * // En lugar de: setStudents(newStudents)
 * optimizedSetStudents(newStudents); // Solo actualiza si realmente cambió
 * ```
 */

import { useMemo, useRef } from 'react';

/**
 * Crea un setter optimizado para arrays de objetos con IDs
 * Solo actualiza el estado si los IDs realmente cambiaron
 * 
 * @param {Function} setState - Función setState de React
 * @returns {Function} Setter optimizado que compara por IDs
 * 
 * @example
 * const [carreras, setCarreras] = useState([]);
 * const optimizedSetCarreras = createOptimizedArraySetter(setCarreras);
 * optimizedSetCarreras(newCarreras); // Solo actualiza si los IDs cambiaron
 */
export const createOptimizedArraySetter = (setState) => {
  return (newData) => {
    setState(prevData => {
      // Si no es un array, actualizar directamente
      if (!Array.isArray(newData)) {
        return newData;
      }

      // Si las referencias son iguales (mismo array), mantener
      if (prevData === newData) {
        return prevData;
      }

      // Si no es array el anterior, actualizar
      if (!Array.isArray(prevData)) {
        return newData;
      }

      // Si la longitud es diferente, definitivamente cambió
      if (prevData.length !== newData.length) {
        return newData;
      }

      // Si ambos arrays están vacíos, mantener referencia
      if (prevData.length === 0) {
        return prevData;
      }

      // Verificar si todos los elementos tienen ID
      const allHaveIds = newData.every(item => item?.id != null);
      
      if (!allHaveIds) {
        // Si no todos tienen ID, comparar por referencia completa
        // (fallback para casos edge)
        return newData;
      }

      // Comparar IDs para verificar si realmente cambió
      const prevIds = prevData.map(item => item.id).sort().join(',');
      const newIds = newData.map(item => item.id).sort().join(',');

      // Si los IDs son iguales, mantener la referencia anterior (evita re-renders)
      if (prevIds === newIds) {
        return prevData;
      }

      // Si los IDs cambiaron, actualizar con los nuevos datos
      return newData;
    });
  };
};

/**
 * Crea un setter optimizado para valores primitivos (string, boolean, number, null)
 * Solo actualiza el estado si el valor realmente cambió
 * 
 * @param {Function} setState - Función setState de React
 * @returns {Function} Setter optimizado que compara por valor
 * 
 * @example
 * const [loading, setLoading] = useState(false);
 * const optimizedSetLoading = createOptimizedPrimitiveSetter(setLoading);
 * optimizedSetLoading(true); // Solo actualiza si realmente cambió
 */
export const createOptimizedPrimitiveSetter = (setState) => {
  return (newValue) => {
    setState(prevValue => {
      // Si el valor es el mismo, mantener la referencia (evita re-renders)
      if (prevValue === newValue) {
        return prevValue;
      }
      return newValue;
    });
  };
};

/**
 * Crea un setter optimizado para objetos
 * Solo actualiza el estado si la referencia cambió
 * 
 * @param {Function} setState - Función setState de React
 * @returns {Function} Setter optimizado que compara por referencia
 * 
 * @example
 * const [selectedStudent, setSelectedStudent] = useState(null);
 * const optimizedSetSelectedStudent = createOptimizedObjectSetter(setSelectedStudent);
 * optimizedSetSelectedStudent(newStudent); // Solo actualiza si la referencia cambió
 */
export const createOptimizedObjectSetter = (setState) => {
  return (newData) => {
    setState(prevData => {
      // Si la referencia es la misma, mantener (evita re-renders)
      if (prevData === newData) {
        return prevData;
      }
      return newData;
    });
  };
};

/**
 * Hook para mantener referencia estable del resultado de un hook de API
 * Evita recrear el objeto retornado si las propiedades no cambiaron
 * 
 * @param {Object} result - Objeto a memoizar
 * @param {boolean} enableLogs - Activar logs de debug
 * @param {string} hookName - Nombre del hook (para logs)
 * @returns {Object} Resultado con referencia estable
 * 
 * @example
 * return useStableApiResult(
 *   { carreras, loading, error, refetch },
 *   ENABLE_RENDER_LOGS,
 *   'useCarrerasApi'
 * );
 */
export const useStableApiResult = (result, enableLogs = false, hookName = 'Hook') => {
  const prevResultRef = useRef(null);

  // Extraer todas las propiedades como dependencias para useMemo
  // Esto permite que React detecte cambios en cualquier propiedad
  const dependencies = Object.values(result);

  return useMemo(() => {
    const prev = prevResultRef.current;

    // Comparar todas las propiedades
    if (prev) {
      const hasChanges = Object.keys(result).some(key => {
        return prev[key] !== result[key];
      });

      if (!hasChanges) {
        if (enableLogs) {
          console.log(`✅ [${hookName}] - MANTENIENDO referencia`);
        }
        return prev;
      }

      if (enableLogs) {
        const changes = {};
        Object.keys(result).forEach(key => {
          changes[`${key}Changed`] = prev[key] !== result[key];
        });
        console.log(`✅ [${hookName}] - RECREANDO objeto retornado`, changes);
      }
    } else if (enableLogs) {
      console.log(`✅ [${hookName}] - CREANDO (primera vez)`);
    }

    prevResultRef.current = result;
    return result;
  }, dependencies); // Dependencias dinámicas basadas en los valores del objeto
};
