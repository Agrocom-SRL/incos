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
export { useInscripcionDetailContext } from './context/useInscripcionDetailContext';
export { useInscripcionesListContext } from './context/useInscripcionesListContext';

// ============================================
// 2. GLOBAL STATE (Application Layer)
// ============================================
// Exporta directamente desde el archivo (el index.js intermedio es opcional)
export { useInscripcionesData } from './state/useInscripcionesData';
export { useMatriculaWizardContext } from './state/matricula-wizard-context';
export { useMatriculaWizardPage } from './state/matricula-wizard-page';
export { useMatriculaDetail, useMatriculaDetailPage } from './state/matricula-detail';
export { useMatriculaListPage } from './state/matricula-list';

// ============================================
// 3. API / DATA FETCHING (Application Layer)
// ============================================
// Exporta directamente desde los archivos (sin index.js intermedio)
export { useInscripcionesApi } from './api/useInscripcionesApi';
export { useGetInscripcionById } from './api/useGetInscripcionById';
export { useCreateInscripcion } from './api/useCreateInscripcion';
export { useUpdateInscripcion } from './api/useUpdateInscripcion';
export { useDeleteInscripcion } from './api/useDeleteInscripcion';

// ============================================
// 4. FEATURE LOGIC (Application Layer)
// ============================================
// Exporta directamente desde los archivos (sin index.js intermedios)
export { useInscripcionNuevaPageData } from './features/useInscripcionNuevaPageData';
export { useMatriculaWizardFormHandlers } from './features/matricula-wizard-form';
export { useInscripcionNuevaStudentSearch } from './features/useInscripcionNuevaStudentSearch';
export { useInscripcionNuevaCarreras } from './features/useInscripcionNuevaCarreras';
export { useInscripcionNuevaPeriodos } from './features/useInscripcionNuevaPeriodos';
export { useInscripcionNuevaParalelos } from './features/useInscripcionNuevaParalelos';
export { useInscripcionNuevaParaleloHorarios } from './features/useInscripcionNuevaParaleloHorarios';
export { useInscripcionNuevaMaterias } from './features/useInscripcionNuevaMaterias';
export { useInscripcionNuevaMateriasByPeriods } from './features/useInscripcionNuevaMateriasByPeriods';
export { useInscripcionNuevaHistorialPrevio } from './features/useInscripcionNuevaHistorialPrevio';
export { useGenerateBoletaInscripcion } from './features/useGenerateBoletaInscripcion';
export { useExportListaInscritosPorCarreraExcel } from './features/useExportListaInscritosPorCarreraExcel';
// Nota: useEnrichWizardSteps está en @application-utils/hooks (hook genérico reutilizable)
