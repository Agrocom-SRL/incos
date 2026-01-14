/**
 * Hooks del módulo de Inscripciones
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
export { useInscripcionesContext } from './context/useInscripcionesContext';
export { useInscripcionesNuevaContext } from './context/useInscripcionesNuevaContext';

// ============================================
// 2. GLOBAL STATE (Application Layer)
// ============================================
// Exporta directamente desde el archivo (el index.js intermedio es opcional)
export { useInscripcionesData } from './state/useInscripcionesData';
export { useInscripcionNuevaData } from './state/useInscripcionNuevaData';

// ============================================
// 3. API / DATA FETCHING (Application Layer)
// ============================================
// TODO: Se implementará en pasos siguientes
// export * from './api';

// ============================================
// 4. FEATURE LOGIC (Application Layer)
// ============================================
// Exporta directamente desde los archivos (sin index.js intermedios)
export { useInscripcionNuevaPageData } from './features/useInscripcionNuevaPageData';
export { useInscripcionNuevaFormHandlers } from './features/useInscripcionNuevaFormHandlers';
export { useInscripcionNuevaStudentSearch } from './features/useInscripcionNuevaStudentSearch';
export { useInscripcionNuevaCarreras } from './features/useInscripcionNuevaCarreras';
export { useInscripcionNuevaParalelos } from './features/useInscripcionNuevaParalelos';
export { useInscripcionNuevaParaleloHorarios } from './features/useInscripcionNuevaParaleloHorarios';
export { useInscripcionNuevaMaterias } from './features/useInscripcionNuevaMaterias';
// Nota: useEnrichWizardSteps está en @application-utils/hooks (hook genérico reutilizable)
