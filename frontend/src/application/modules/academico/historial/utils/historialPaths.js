/**
 * Rutas del módulo Historial académico (ítem de menú ACA · Historial).
 *
 * Centraliza las URLs para no repetir literales por la app (mismo patrón que
 * `calificacionesPaths`). El detalle es una ruta dinámica por estudiante.
 */

/** Landing (selector de estudiante). */
export const HISTORIAL_SELECTOR_PATH = '/academico/historial/academico';

/** Detalle (transcript) de un estudiante. */
export const historialAcademicoPath = (estudianteId) =>
  `/academico/historial/academico/${estudianteId}`;

export default { HISTORIAL_SELECTOR_PATH, historialAcademicoPath };
