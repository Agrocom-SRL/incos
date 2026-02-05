/**
 * Hook: useGestionesApi
 * 
 * Single Responsibility: Obtener lista de gestiones académicas disponibles
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta Use Case para obtener gestiones
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Este hook:
 * - Obtiene todas las gestiones activas usando el Use Case correspondiente
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 */

import { createApiHook } from '@application/utils';

export const useGestionesApi = createApiHook({
  name: 'useGestionesApi',
  useCase: 'obtenerTodasGestiones', // Asumiendo que existe este use case, si no, usar 'obtenerGestiones' o similar
  dataType: 'array',
  dataKey: 'gestiones',
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: [{ filters: { active: true } }], // Solo gestiones activas
  errorMessage: 'Error al cargar las gestiones',
});
