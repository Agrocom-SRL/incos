/**
 * Hook: useStableApiResult
 * 
 * Single Responsibility: Mantener referencia estable del resultado de un hook de API
 * 
 * Clean Architecture:
 * - Application Layer: Hook genérico para optimización de hooks de API
 * 
 * Este hook evita recrear el objeto retornado si las propiedades no cambiaron,
 * reduciendo re-renders innecesarios en componentes que consumen hooks de API.
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

import { useMemo, useRef } from 'react';

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
