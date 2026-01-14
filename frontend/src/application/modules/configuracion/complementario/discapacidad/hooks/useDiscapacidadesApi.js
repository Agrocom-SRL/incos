/**
 * Hook: useDiscapacidadesApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con discapacidades
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de discapacidades usando GetTodasDiscapacidadesUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar useDiscapacidadesList
 * 
 * Ubicación: application/modules/configuracion/complementario/discapacidad/hooks
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';
import { mapDiscapacidadesList } from '@application-configuracion/complementario/discapacidad/mappers';

export const useDiscapacidadesApi = createApiHook({
  name: 'useDiscapacidadesApi',
  useCase: 'obtenerTodasDiscapacidades',
  dataType: 'array', // Retorna un array
  mapper: mapDiscapacidadesList, // Mapea los datos antes de guardarlos
  initialLoading: false, // No carga automáticamente al montar
  autoFetch: true, // Carga automáticamente al montar
  autoFetchArgs: {}, // Argumentos para el auto-fetch
  dataKey: 'discapacidades', // Nombre de la propiedad en el resultado
  errorMessage: 'Error al cargar las discapacidades',
});

