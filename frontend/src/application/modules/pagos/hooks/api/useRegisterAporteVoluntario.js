/**
 * Hook: useRegisterAporteVoluntario
 * 
 * Single Responsibility: Manejar el registro de aportes voluntarios vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la creación de aportes voluntarios usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Registra un aporte voluntario usando RegisterAporteVoluntarioUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para registrar
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (validación, formateo), usar hooks adicionales si es necesario
 * 
 * Optimización: Usa createApiHook para reducir código repetitivo y mantener
 * todas las optimizaciones de estado automáticamente.
 */

import { createApiHook } from '@application/utils';

export const useRegisterAporteVoluntario = createApiHook({
  name: 'useRegisterAporteVoluntario',
  useCase: 'registrarAporteVoluntario',
  dataType: 'object', // Retorna un objeto (el aporte registrado)
  initialLoading: false, // No carga automáticamente al montar
  autoFetch: false, // No carga automáticamente
  dataKey: 'aporteVoluntario', // Nombre de la propiedad en el resultado
  fetchName: 'registrar', // Nombre de la función fetch (más semántico que 'fetch')
  errorMessage: 'Error al registrar el aporte voluntario',
});
