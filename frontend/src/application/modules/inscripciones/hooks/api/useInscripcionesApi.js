/**
 * Hook: useInscripcionesApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con inscripciones (listar)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de inscripciones usando ObtenerTodasInscripcionesUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar hooks adicionales si es necesario
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';

export const useInscripcionesApi = createApiHook({
  name: 'useInscripcionesApi',
  useCase: 'obtenerTodasInscripciones',
  dataType: 'array', // Retorna un array
  initialLoading: false, // No carga automáticamente al montar
  autoFetch: false, // No carga automáticamente (búsqueda bajo demanda)
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'inscripciones', // Nombre de la propiedad en el resultado
  errorMessage: 'Error al cargar las inscripciones',
});
