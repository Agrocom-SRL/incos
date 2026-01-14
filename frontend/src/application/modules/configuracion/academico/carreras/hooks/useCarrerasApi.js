/**
 * Hook: useCarrerasApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con carreras
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de carreras usando GetTodasCarrerasUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar useCarrerasList
 * 
 * Ubicación: application/modules/configuracion/academico/carreras/hooks
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';
import { mapCarrerasList } from '@application-configuracion/academico/carreras/mappers';

export const useCarrerasApi = createApiHook({
  name: 'useCarrerasApi',
  useCase: 'obtenerTodasCarreras',
  dataType: 'array', // Retorna un array
  mapper: mapCarrerasList, // Mapea los datos antes de guardarlos
  initialLoading: true, // Carga automáticamente al montar
  autoFetch: true, // Carga automáticamente al montar
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'carreras', // Nombre de la propiedad en el resultado
  errorMessage: 'Error al cargar las carreras',
});

