/**
 * Rutas del módulo Asistencia (ítem Académico · ACA-ASI), gemelo de Calificaciones.
 *
 * Flujo: Asistencia (entrada) → mis cursos (registro) → planilla diaria del curso.
 * Páginas hermanas del mismo ítem: clases no dictadas, consolidado %, licencias.
 * El docente en vista coordinación se pasa por location.state / sesión, no por URL.
 */

export const ASISTENCIA_PATH = '/academico/asistencia';

/** Registro diario — listado "mis cursos" del docente. */
export const MIS_CURSOS_PATH = '/academico/asistencia/mis-cursos';

/** key de routes.jsx para useRouteViewMode (coordinación vs docente propio). */
export const ASISTENCIA_VIEW_ROUTE_KEY = 'ACA-ASI-MIS-CURSOS';

/**
 * Calendario mensual del curso (bimestre activo, dots por día tomado).
 * Pantalla intermedia entre «mis cursos» y la planilla semanal.
 */
export const calendarioCursoPath = (asignacionId) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/calendario`;

/**
 * Planilla semanal de un curso (roster × días válidos de la semana, marcas P/R/F/L).
 * `rango` (desde/hasta ISO) acota la semana visible; sin rango el backend resuelve la vigente.
 */
export const planillaCursoPath = (asignacionId, rango) => {
  const base = `${MIS_CURSOS_PATH}/${asignacionId}/planilla`;
  if (rango?.desde && rango?.hasta) {
    const qs = new URLSearchParams({ desde: rango.desde, hasta: rango.hasta }).toString();
    return `${base}?${qs}`;
  }
  return base;
};

/** Clases no dictadas (cancelaciones del dictado por asignación docente). */
export const CLASES_NO_DICTADAS_PATH = '/academico/asistencia/clases-no-dictadas';

/** Consolidado % por estudiante/curso (lectura). */
export const CONSOLIDADO_PATH = '/academico/asistencia/consolidado';

/** Licencias estudiantiles (página dentro de Asistencia). */
export const LICENCIAS_PATH = '/academico/asistencia/licencias/listar';
export const LICENCIA_SOLICITAR_PATH = '/academico/asistencia/licencias/solicitar';
