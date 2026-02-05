/**
 * Hook: useGestionesApi
 * 
 * Single Responsibility: Obtener lista de gestiones académicas disponibles
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta Use Case para obtener gestiones
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Este hook:
 * - Obtiene gestiones aplicando el filtro vigente en el backend (?vigente=0 | ?vigente=1)
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * @param {Object} options - Opciones del hook
 * @param {boolean} [options.vigente] - true = solo vigentes, false = solo no vigentes, undefined = todas
 * @param {boolean} [options.autoFetch=true] - Si debe cargar al montar
 */

import { createApiHook } from '@application/utils';

export const useGestionesApi = (options = {}) => {
  const { vigente, autoFetch = true } = options;
  
  // Construir params con el filtro vigente (0 o 1)
  const params = {};
  if (vigente !== undefined) {
    params.vigente = vigente ? 1 : 0;
  }
  
  const autoFetchArgs = Object.keys(params).length > 0 ? [{ params }] : undefined;

  return createApiHook({
    name: 'useGestionesApi',
    useCase: 'obtenerTodasGestiones',
    dataType: 'array',
    dataKey: 'gestiones',
    initialLoading: false,
    autoFetch,
    autoFetchArgs,
    errorMessage: 'Error al cargar las gestiones',
  })();
};
