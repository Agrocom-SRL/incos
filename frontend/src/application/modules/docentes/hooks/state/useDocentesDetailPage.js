import { useDocenteDetail } from './useDocenteDetail';

/**
 * Alias de consistencia para hooks de página del módulo Docentes.
 * Mantiene compatibilidad con implementaciones previas que usan useDocenteDetail.
 */
export const useDocentesDetailPage = (docenteIdRaw) => useDocenteDetail(docenteIdRaw);

