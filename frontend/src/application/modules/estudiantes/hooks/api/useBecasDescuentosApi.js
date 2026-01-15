/**
 * Hook: useBecasDescuentosApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con becas y descuentos
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de becas y descuentos usando ObtenerTodasBecasDescuentosUseCase
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
import { mapBecasDescuentosList } from '@application-estudiantes/mappers';

export const useBecasDescuentosApi = createApiHook({
  name: 'useBecasDescuentosApi',
  useCase: 'obtenerTodasBecasDescuentos',
  dataType: 'array', // Retorna un array
  mapper: mapBecasDescuentosList, // Mapea los datos antes de guardarlos
  initialLoading: true, // Carga automáticamente al montar
  autoFetch: true, // Carga automáticamente al montar
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'becasDescuentos', // Nombre de la propiedad en el resultado
  errorMessage: 'Error al cargar las becas y descuentos',
});
