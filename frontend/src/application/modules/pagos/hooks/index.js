/**
 * Hooks del módulo de Pagos
 * 
 * Organización por tipo/nivel:
 * 1. Context Consumers: Hooks para consumir contextos (Presentation Layer)
 * 2. Global State: Hooks para gestión de estado global/compartido (Application Layer)
 * 3. API / Data Fetching: Hooks para llamadas a BD y obtención de datos (Application Layer)
 * 4. Feature Logic: Hooks de lógica específica por feature (Application Layer)
 */

// ============================================
// 1. CONTEXT CONSUMERS (Presentation Layer)
// ============================================
// Exporta directamente desde los archivos (los index.js intermedios son opcionales)
export { usePagosContext } from './context/usePagosContext';
export { usePagosRegistrarContext } from './context/usePagosRegistrarContext';
export { usePagosListContext } from './context/usePagosListContext';
export { usePagosDetailContext } from './context/usePagosDetailContext';

// ============================================
// 2. GLOBAL STATE (Application Layer)
// ============================================
// Exporta directamente desde el archivo (el index.js intermedio es opcional)
export { usePagosData } from './state/usePagosData';
export { usePagosRegistrarData } from './state/usePagosRegistrarData';

// ============================================
// 3. API / DATA FETCHING (Application Layer)
// ============================================
// Exporta directamente desde los archivos (sin index.js intermedio)
export { usePagosApi } from './api/usePagosApi';
export { useGetPagoById } from './api/useGetPagoById';
export { useDeletePagoAporte } from './api/useDeletePagoAporte';
export { usePaymentAccountsApi } from './api/usePaymentAccountsApi';
export { useAuthorizedBanksApi } from './api/useAuthorizedBanksApi';
export { usePaymentMethodsApi } from './api/usePaymentMethodsApi';
export { useContributionConfigurationsApi } from './api/useContributionConfigurationsApi';
export { useRegisterAporteVoluntario } from './api/useRegisterAporteVoluntario';

// ============================================
// 4. FEATURE LOGIC (Application Layer)
// ============================================
// Exporta directamente desde los archivos (sin index.js intermedio)
export { usePagosRegistrarPaymentAccounts } from './features/usePagosRegistrarPaymentAccounts';
export { usePagosRegistrarAuthorizedBanks } from './features/usePagosRegistrarAuthorizedBanks';
export { usePagosRegistrarPaymentMethods } from './features/usePagosRegistrarPaymentMethods';
export { usePagosRegistrarContributionConfigurations } from './features/usePagosRegistrarContributionConfigurations';
