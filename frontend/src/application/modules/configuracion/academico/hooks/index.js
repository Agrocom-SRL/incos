/**
 * Hooks CFG → Académico (organización por tipo, mismo patrón que inscripciones).
 */

export { useCarreraContext } from './context/useCarreraContext';
export { useMateriaContext } from './context/useMateriaContext';

export { useCarrerasApi } from './api/useCarrerasApi';
export { useMateriasApi } from './api/useMateriasApi';
export { usePlanesEstudiosApi } from './api/usePlanesEstudiosApi';
export { usePlanEstudiosDetalleApi } from './api/usePlanEstudiosDetalleApi';

export { useCarrerasList } from './features/useCarrerasList';
export { useMateriasList } from './features/useMateriasList';
export { usePlanesTabPanel } from './features/usePlanesTabPanel';

export { useCarreraForm } from './state/useCarreraForm';
export { useMateriaForm } from './state/useMateriaForm';
export { usePlanForm } from './state/usePlanForm';
export { useCarreraDetallePage } from './state/useCarreraDetallePage';
export { useMateriaDetallePage } from './state/useMateriaDetallePage';
export { usePlanDetallePage } from './state/usePlanDetallePage';
export { usePlanNuevaVersion } from './state/usePlanNuevaVersion';
export { usePlanBuilder } from './state/usePlanBuilder';
