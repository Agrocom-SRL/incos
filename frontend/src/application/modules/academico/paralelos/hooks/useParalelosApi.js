/**
 * Hook: useParalelosApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con paralelos
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de paralelos usando GetTodosParalelosUseCase
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
import { normalizeFieldToArray } from '@application/utils';
import { mapParalelosList } from '@application-academico/paralelos/mappers';

export const useParalelosApi = createApiHook({
  name: 'useParalelosApi',
  useCase: 'obtenerTodosParalelos',
  dataType: 'array', // Retorna un array
  mapper: (data) => {
    // Mapper personalizado con múltiples transformaciones
    // Paso 1: Normalizar estructura (objeto → array) usando transformador genérico reutilizable
    const paralelosNormalizados = normalizeFieldToArray(data, 'paralelos');
    // Paso 2: Transformar datos al formato de UI usando mapper específico del módulo
    return mapParalelosList(paralelosNormalizados);
  },
  initialLoading: false, // No carga automáticamente al montar
  autoFetch: false, // No carga automáticamente (búsqueda bajo demanda)
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'paralelos', // Nombre de la propiedad en el resultado
  errorMessage: 'Error al cargar los paralelos',
});
