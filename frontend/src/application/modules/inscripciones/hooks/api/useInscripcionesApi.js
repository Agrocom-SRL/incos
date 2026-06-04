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
import { DEFAULT_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

export const useInscripcionesApi = createApiHook({
  name: 'useInscripcionesApi',
  useCase: 'obtenerTodasInscripciones',
  dataType: 'array',
  initialLoading: false,
  autoFetch: false,
  paginationKey: 'pagination',
  dataKey: 'inscripciones',
  errorMessage: 'Error al cargar las inscripciones',
});

export const inscripcionesListFetchParams = (overrides = {}) => ({
  params: {
    page: DEFAULT_LIST_PAGE,
    limit: DEFAULT_LIST_LIMIT,
    ...overrides,
  },
});
