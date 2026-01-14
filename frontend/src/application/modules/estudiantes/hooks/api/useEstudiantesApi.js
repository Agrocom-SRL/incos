/**
 * Hook: useEstudiantesApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de estudiantes usando ObtenerTodosEstudiantesUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar StudentListProvider
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';
import { mapEstudiantesList } from '@application-estudiantes/mappers';

export const useEstudiantesApi = createApiHook({
  name: 'useEstudiantesApi',
  useCase: 'obtenerTodosEstudiantes',
  dataType: 'array', // Retorna un array
  mapper: mapEstudiantesList, // Mapea los datos antes de guardarlos
  initialLoading: false, // No carga automáticamente al montar
  autoFetch: true, // Carga automáticamente al montar
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'estudiantes', // Nombre de la propiedad en el resultado
  errorMessage: 'Error al cargar los estudiantes',
});

