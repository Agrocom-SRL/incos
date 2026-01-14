/**
 * Hook: useGetStudentById
 * 
 * Single Responsibility: Manejar la obtención de un estudiante por ID vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de estudiantes usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene un estudiante por ID usando ObtenerEstudiantePorIdUseCase
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

export const useGetStudentById = createApiHook({
  name: 'useGetStudentById',
  useCase: 'obtenerEstudiantePorId',
  dataType: 'object', // Retorna un objeto único
  initialLoading: false,
  validate: (id) => {
    // Validación personalizada
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      return 'ID del estudiante es requerido';
    }
    return null; // null = válido
  },
  errorMessage: 'Error al cargar el estudiante',
  dataKey: 'student', // Nombre de la propiedad en el resultado
  fetchName: 'getStudentById', // Nombre de la función fetch
});

