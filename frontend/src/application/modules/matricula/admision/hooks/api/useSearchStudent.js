/**
 * Hook: useSearchStudent
 * 
 * Single Responsibility: Manejar la búsqueda de estudiantes por término de búsqueda vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la búsqueda de estudiantes usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * - Transforma datos del backend usando mappers antes de pasarlos al provider/componente
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * Application (hook) → Application (mapper) → Transforma datos para UI
 * 
 * Este hook:
 * - Busca estudiantes por término de búsqueda usando BuscarEstudianteUseCase
 * - NO valida parámetros (las validaciones están en el Use Case)
 * - Normaliza la estructura de respuesta usando normalizeFieldToArray (transformador genérico)
 * - Transforma datos usando mapEstudiantesList (mapper específico del módulo)
 * - Normaliza errores usando helpers genéricos (extractErrorFromResult, normalizeError)
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * 
 * Separación de responsabilidades:
 * - Transformador (normalizeFieldToArray): Normaliza estructura (objeto → array) - genérico, reutilizable en cualquier módulo
 * - Mapper (mapEstudiantesList): Transforma datos al formato de UI - específico del módulo de estudiantes
 * - El manejo de errores se hace usando helpers genéricos reutilizables
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';
import { mapEstudiantesList } from '@application-matricula/admision/mappers';
import { normalizeFieldToArray } from '@application/utils';

export const useSearchStudent = createApiHook({
  name: 'useSearchStudent',
  useCase: 'buscarEstudiante',
  dataType: 'array', // Retorna un array
  mapper: (data) => {
    // Mapper personalizado con múltiples transformaciones
    // Paso 1: Normalizar estructura (objeto → array) usando transformador genérico reutilizable
    const estudiantesNormalizados = normalizeFieldToArray(data, 'student');
    // Paso 2: Transformar datos al formato de UI usando mapper específico del módulo
    return mapEstudiantesList(estudiantesNormalizados);
  },
  initialLoading: false, // No carga automáticamente al montar
  autoFetch: false, // No carga automáticamente (búsqueda bajo demanda)
  dataKey: 'students', // Nombre de la propiedad en el resultado
  fetchName: 'searchStudent', // Nombre de la función fetch
  errorMessage: 'Error al buscar estudiantes',
});
