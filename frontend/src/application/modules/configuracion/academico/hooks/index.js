/**
 * Hooks CFG → Académico (organización por tipo, mismo patrón que inscripciones).
 */

export { useCarreraContext } from './context/useCarreraContext';
export { useMateriaContext } from './context/useMateriaContext';
export { useParaleloContext } from './context/useParaleloContext';

export { useCarrerasApi } from './api/useCarrerasApi';
export { useMateriasApi } from './api/useMateriasApi';
export { usePlanesEstudiosApi } from './api/usePlanesEstudiosApi';
export { usePlanEstudiosDetalleApi } from './api/usePlanEstudiosDetalleApi';

export { useCarrerasList } from './features/useCarrerasList';
export { useMateriasList } from './features/useMateriasList';
export { usePlanesTabPanel } from './features/usePlanesTabPanel';

export { useCarreraForm } from './state/useCarreraForm';
export { useMateriaForm } from './state/useMateriaForm';
export { useCarreraDetallePage } from './state/useCarreraDetallePage';
export { useMateriaDetallePage } from './state/useMateriaDetallePage';
export { useParaleloForm } from './state/useParaleloForm';
export { useParaleloDetallePage } from './state/useParaleloDetallePage';
export { useParaleloInstanciasGestionApi } from './api/useParaleloInstanciasGestionApi';
