/**
 * Hooks CFG → Recursos académicos (organización por tipo, mismo patrón que Académico/Complementarios).
 */

export { useParaleloContext } from './context/useParaleloContext';

export { useParalelosCfgApi } from './api/useParalelosCfgApi';
export { useParaleloInstanciasGestionApi } from './api/useParaleloInstanciasGestionApi';

export { useParalelosList } from './features/useParalelosList';

export { useParaleloForm } from './state/useParaleloForm';
export { useParaleloDetallePage } from './state/useParaleloDetallePage';

export { useAulaContext } from './context/useAulaContext';
export { useAulasApi } from './api/useAulasApi';
export { useAulasList } from './features/useAulasList';
export { useAulaForm } from './state/useAulaForm';
export { useAulaDetallePage } from './state/useAulaDetallePage';

export { useTipoEvaluacionContext } from './context/useTipoEvaluacionContext';
export { useTiposEvaluacionAdminApi } from './api/useTiposEvaluacionAdminApi';
export { useTiposEvaluacionList } from './features/useTiposEvaluacionList';
export { useTipoEvaluacionForm } from './state/useTipoEvaluacionForm';
export { useTipoEvaluacionDetallePage } from './state/useTipoEvaluacionDetallePage';
