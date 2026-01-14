/**
 * Hook: useParaleloScheduleApi
 * 
 * Single Responsibility: Manejar la llamada a la API para obtener horarios de un paralelo
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene los horarios de un paralelo usando GetParaleloHorariosUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar hooks adicionales si es necesario
 * 
 * Ubicación: application/modules/academico/paralelos/hooks
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';

export const useParaleloScheduleApi = createApiHook({
  name: 'useParaleloScheduleApi',
  useCase: 'obtenerParaleloHorarios',
  dataType: 'object', // Retorna un objeto con schedule
  initialLoading: false, // No carga automáticamente al montar
  autoFetch: false, // No carga automáticamente (búsqueda bajo demanda)
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'schedule', // Nombre de la propiedad en el resultado
  errorMessage: 'Error al cargar los horarios del paralelo',
  validate: (parallelId) => {
    if (!parallelId || (typeof parallelId !== 'string' && typeof parallelId !== 'number')) {
      return 'ID del paralelo es requerido';
    }
    return null;
  },
});
