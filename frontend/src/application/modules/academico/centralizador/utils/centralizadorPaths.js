/**
 * Rutas del módulo Centralizador (ítem Académico · ACA-CENTRALIZADOR).
 *
 * Flujo de 3 niveles: P1 paralelos → P2 bimestres del paralelo → P3 matriz por
 * bimestre. El endpoint de backend sigue siendo /calificaciones/centralizador
 * (infraestructura compartida); solo el módulo de frontend es propio.
 */

export const CENTRALIZADOR_PATH = '/academico/centralizador';

/** P2 — bimestres del paralelo elegido. */
export const centralizadorParaleloPath = (paraleloGestionId) =>
  `${CENTRALIZADOR_PATH}/${paraleloGestionId}`;

/** P3 — matriz estudiantes × asignaturas del bimestre elegido. */
export const centralizadorMatrizPath = (paraleloGestionId, bimestre) =>
  `${CENTRALIZADOR_PATH}/${paraleloGestionId}/bimestre/${bimestre}`;
