/**
 * Hook: useGenerateReciboPago
 * 
 * Single Responsibility: Manejar la generación/obtención del recibo de pago vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la generación de recibos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Genera u obtiene el recibo de pago usando GenerateReciboPagoUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para generar/obtener el recibo
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (formateo, transformación), usar componentes o mappers
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';

export const useGenerateReciboPago = createApiHook({
  name: 'useGenerateReciboPago',
  useCase: 'generarReciboPago',
  dataType: 'object', // Retorna un objeto con filePath, fileName, absolutePath
  initialLoading: false,
  validate: (id) => {
    // Validación personalizada
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      return 'ID del pago es requerido';
    }
    return null; // null = válido
  },
  errorMessage: 'Error al generar el recibo de pago',
  dataKey: 'recibo', // Nombre de la propiedad en el resultado del hook
  fetchName: 'generateReciboPago', // Nombre de la función fetch
});
