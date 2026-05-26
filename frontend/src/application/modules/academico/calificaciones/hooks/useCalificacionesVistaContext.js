/**
 * Alias del módulo Calificaciones sobre useRouteViewMode (patrón global).
 * @deprecated Preferir useRouteViewMode('ACA-CAL-…') en código nuevo.
 */

import { useRouteViewMode } from '@navigation/hooks/useRouteViewMode.js';
import { useAuth } from '@application-auth';
import { CALIFICACIONES_PERMISOS } from '../utils/calificacionesPermisos.js';

/** Cualquier ruta hija de ACA-CAL resuelve el mismo viewStack del menú. */
const CALIFICACIONES_ROUTE_KEY = 'ACA-CAL-MIS-CURSOS';

export const useCalificacionesVistaContext = () => {
  const { hasPermiso } = useAuth();
  const {
    viewId,
    contextId,
    contextName,
    limpiarContexto,
    isView,
  } = useRouteViewMode(CALIFICACIONES_ROUTE_KEY);

  const puedeCoordinacion = hasPermiso(
    CALIFICACIONES_PERMISOS.coordinacion,
    'LISTAR',
  );
  const esVistaCoordinacion = isView('coordinacion');

  return {
    docenteIdCoordinacion: contextId,
    docenteNombreCoordinacion: contextName,
    esVistaCoordinacion,
    puedeCoordinacion,
    viewId,
    limpiarContextoCoordinacion: limpiarContexto,
    limpiarContexto,
  };
};
