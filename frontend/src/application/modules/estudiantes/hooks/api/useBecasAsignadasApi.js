/**
 * Hook: useBecasAsignadasApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con becas asignadas a estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de becas asignadas usando ObtenerTodasBecasAsignadasUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar hooks de features
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';

export const useBecasAsignadasApi = createApiHook({
  name: 'useBecasAsignadasApi',
  useCase: 'obtenerTodasBecasAsignadas',
  dataType: 'object', // Retorna un objeto con { becas: [...], total, page, limit, totalPages }
  mapper: null, // No necesita mapper, los datos vienen ya estructurados del backend
  initialLoading: true, // Carga automáticamente al montar
  autoFetch: true, // Carga automáticamente al montar
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'becasAsignadas', // Nombre de la propiedad en el resultado del hook
  // El backend retorna: { becas: [...], total, page, limit, totalPages }
  // El hook retornará: { becasAsignadas: { becas: [...], total, ... }, loading, error }
  errorMessage: 'Error al cargar las becas asignadas',
});
