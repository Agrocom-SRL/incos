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

import { useMemo } from 'react';

export const useStableApiResult = (result, enableLogs = false, hookName = 'Hook') => {
  // Extraer todas las propiedades como dependencias para useMemo
  // Esto permite que React detecte cambios en cualquier propiedad:
  // si ninguna cambió, useMemo devuelve la misma referencia anterior
  const dependencies = Object.values(result);

  return useMemo(() => {
    if (enableLogs) {
      console.log(`✅ [${hookName}] - RECREANDO objeto retornado`);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencias dinámicas por diseño (valores del objeto)
  }, dependencies);
};
