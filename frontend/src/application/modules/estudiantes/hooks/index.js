/**
 * Hooks del módulo de Estudiantes
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
export * from './context';

// ============================================
// 2. GLOBAL STATE (Application Layer)
// ============================================
export * from './state';

// ============================================
// 3. API / DATA FETCHING (Application Layer)
// ============================================
export * from './api';

// ============================================
// 4. FEATURE LOGIC (Application Layer)
// ============================================
export * from './features';

// Helpers de documentación (para uso en página de registro/edición)
export {
  filterDocumentacionOcultarHijosCuandoPadreEntregado,
  getDocumentacionCatalogForEdit,
} from './helpers/documentacionHelpers';
