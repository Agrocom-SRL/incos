/**
 * Rutas del módulo Nivelación (ítem Académico · ACA-NIV).
 *
 * Flujo: P1 nivel 1 (paralelos) → P1 nivel 2 (grilla del paralelo) → click en
 * un StatusPill navega a /inscribir o /aprobar con querystring de contexto
 * (ver `nivelacionEventoContexto.js` para el detalle de esos parámetros).
 */

export const NIVELACION_LISTAR_PATH = '/academico/nivelaciones/listar';
export const NIVELACION_INSCRIBIR_PATH = '/academico/nivelaciones/inscribir';
export const NIVELACION_APROBAR_PATH = '/academico/nivelaciones/aprobar';

/** P1 nivel 2 — grilla estudiantes × asignaturas del paralelo elegido. */
export const nivelacionParaleloPath = (paraleloGestionId) =>
  `${NIVELACION_LISTAR_PATH}/${paraleloGestionId}`;
