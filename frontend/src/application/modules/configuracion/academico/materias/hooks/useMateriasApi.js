/**
 * Hook: useMateriasApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con materias
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de materias usando GetTodasMateriasUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar useMateriasList
 * 
 * Ubicación: application/modules/configuracion/academico/materias/hooks
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';
import { normalizeFieldToArray } from '@application/utils';
import { mapMateriasList } from '@application-configuracion/academico/materias/mappers';

export const useMateriasApi = createApiHook({
  name: 'useMateriasApi',
  useCase: 'obtenerTodasMaterias',
  dataType: 'array', // Retorna un array
  mapper: (data) => {
    // Mapper personalizado con múltiples transformaciones
    // Paso 1: Normalizar estructura (objeto → array) usando transformador genérico reutilizable
    const materiasNormalizadas = normalizeFieldToArray(data, 'materias');
    // Paso 2: Transformar datos al formato de UI usando mapper específico del módulo
    return mapMateriasList(materiasNormalizadas);
  },
  initialLoading: false, // No carga automáticamente al montar
  autoFetch: true, // Carga automáticamente al montar
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'materias', // Nombre de la propiedad en el resultado
  errorMessage: 'Error al cargar las materias',
});

