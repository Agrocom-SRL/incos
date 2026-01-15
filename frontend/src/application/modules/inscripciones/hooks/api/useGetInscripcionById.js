/**
 * Hook: useGetInscripcionById
 * 
 * Single Responsibility: Manejar la obtención de una inscripción por ID vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de inscripciones usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene una inscripción por ID usando ObtenerInscripcionPorIdUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (formateo, transformación), usar componentes o mappers
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';

export const useGetInscripcionById = createApiHook({
  name: 'useGetInscripcionById',
  useCase: 'obtenerInscripcionPorId',
  dataType: 'object', // Retorna un objeto con múltiples entidades
  initialLoading: false,
  validate: (id) => {
    // Validación personalizada
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      return 'ID de la inscripción es requerido';
    }
    return null; // null = válido
  },
  errorMessage: 'Error al cargar la inscripción',
  dataKey: 'inscripcion', // Nombre de la propiedad en el resultado del hook
  fetchName: 'getInscripcionById', // Nombre de la función fetch
});
