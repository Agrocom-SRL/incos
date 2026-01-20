/**
 * Hook: useGetPagoById
 * 
 * Single Responsibility: Manejar la obtención de un pago por ID vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de pagos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene un pago por ID usando ObtenerPagoAportePorIdUseCase
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

export const useGetPagoById = createApiHook({
  name: 'useGetPagoById',
  useCase: 'obtenerPagoAportePorId',
  dataType: 'object', // Retorna un objeto con múltiples entidades relacionadas
  initialLoading: false,
  validate: (id) => {
    // Validación personalizada
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      return 'ID del pago es requerido';
    }
    return null; // null = válido
  },
  errorMessage: 'Error al cargar el pago',
  dataKey: 'pago', // Nombre de la propiedad en el resultado del hook
  fetchName: 'getPagoById', // Nombre de la función fetch
});
