import { useEffect, useState } from 'react';

/** @typedef {'compact' | 'narrow' | 'medium' | 'full'} TableLayoutMode */

/** ≤767px — 2 columnas + fila expandible */
export const MV2_TABLE_QUERY_COMPACT = '(max-width: 767px)';

/** 768–991px — 3 columnas + fila expandible */
export const MV2_TABLE_QUERY_NARROW = '(min-width: 768px) and (max-width: 991px)';

/** 992–1199px — 4 columnas + fila expandible */
export const MV2_TABLE_QUERY_MEDIUM = '(min-width: 992px) and (max-width: 1199px)';

function resolveTableLayoutMode() {
  if (typeof window === 'undefined') return 'full';
  if (window.matchMedia(MV2_TABLE_QUERY_COMPACT).matches) return 'compact';
  if (window.matchMedia(MV2_TABLE_QUERY_NARROW).matches) return 'narrow';
  if (window.matchMedia(MV2_TABLE_QUERY_MEDIUM).matches) return 'medium';
  return 'full';
}

/**
 * Cuatro medidas de tabla según ancho de viewport:
 * - `compact` (≤767px): estudiante + acciones
 * - `narrow` (768–991px): estudiante, carrera, acciones
 * - `medium` (992–1199px): estudiante, carrera, historial, acciones
 * - `full` (≥1200px): 6 columnas (gestión incluye tipo debajo)
 *
 * @returns {TableLayoutMode}
 */
export function useCompactTableLayout() {
  const [mode, setMode] = useState(resolveTableLayoutMode);

  useEffect(() => {
    const mqCompact = window.matchMedia(MV2_TABLE_QUERY_COMPACT);
    const mqNarrow = window.matchMedia(MV2_TABLE_QUERY_NARROW);
    const mqMedium = window.matchMedia(MV2_TABLE_QUERY_MEDIUM);

    const update = () => setMode(resolveTableLayoutMode());

    update();
    mqCompact.addEventListener('change', update);
    mqNarrow.addEventListener('change', update);
    mqMedium.addEventListener('change', update);
    return () => {
      mqCompact.removeEventListener('change', update);
      mqNarrow.removeEventListener('change', update);
      mqMedium.removeEventListener('change', update);
    };
  }, []);

  return mode;
}
