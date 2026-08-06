/**
 * Helpers puros del folio del centralizador: derivan columnas (asignaturas),
 * celdas de nota final y estado académico sugerido desde las filas de la
 * vista 135 (formato largo: una fila por estudiante × oferta_curso).
 *
 * Limitación documentada (A5): la vista 135 filtra la asignación docente
 * VIGENTE — el libro se genera al cierre de la gestión mientras esta es
 * vigente; el folio congela estado_academico y observaciones. Reimpresión de
 * gestiones pasadas = evolución futura (parametrizar la gestión en la 135).
 */

import { ESTADOS_ACADEMICOS_FOLIO } from '../../../../../domain/constants/libros.constants.js';

/** Leyenda del centralizador impreso para "sin nota" (No se Presentó). */
export const NOTA_NP = 'NP';

/** Estados de matriculas_materia que en el papel se asientan como NP. */
const ESTADOS_MATERIA_NP = ['ABANDONO', 'RETIRADO'];

/**
 * Columnas de asignaturas del folio a partir de las filas 135 (identidad =
 * oferta_curso_id; orden institucional por asignatura_orden).
 * @param {Array<Object>} filas135
 * @returns {Array<{ ofertaCursoId:number, sigla:string, nombre:string, orden:number, docenteNombre:string|null }>}
 */
export function construirAsignaturasDesdeFilas135(filas135) {
  const porOferta = new Map();
  for (const fila of filas135 ?? []) {
    if (!porOferta.has(fila.oferta_curso_id)) {
      porOferta.set(fila.oferta_curso_id, {
        ofertaCursoId: fila.oferta_curso_id,
        sigla: fila.asignatura_sigla ?? '',
        nombre: fila.asignatura_nombre ?? '',
        orden: fila.asignatura_orden ?? 0,
        docenteNombre: fila.docente_nombre ?? null,
      });
    }
  }
  return [...porOferta.values()].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
}

/**
 * Nota de la celda del folio: la NOTA FINAL cacheada en matriculas_materia
 * (paridad con el papel). NULL o materia en ABANDONO/RETIRADO → 'NP'.
 * @param {Object} fila135
 * @returns {number|string}
 */
export function notaCeldaFolio(fila135) {
  const estadoMateria = fila135?.estado ?? null;
  const notaFinal = fila135?.nota_final;
  if (notaFinal == null || ESTADOS_MATERIA_NP.includes(estadoMateria)) {
    return NOTA_NP;
  }
  return Number(notaFinal);
}

/**
 * Filas 135 agrupadas por estudiante: Map estudiante_id → filas de sus materias.
 * @param {Array<Object>} filas135
 * @returns {Map<number, Array<Object>>}
 */
export function agruparFilas135PorEstudiante(filas135) {
  const porEstudiante = new Map();
  for (const fila of filas135 ?? []) {
    const lista = porEstudiante.get(fila.estudiante_id) ?? [];
    lista.push(fila);
    porEstudiante.set(fila.estudiante_id, lista);
  }
  return porEstudiante;
}

/**
 * Celdas de un estudiante para el folio: { [ofertaCursoId]: nota|'NP' }.
 * @param {Array<Object>} filasEstudiante - Filas 135 de UN estudiante.
 * @returns {Object<number, number|string>}
 */
export function construirCeldasEstudiante(filasEstudiante) {
  const celdas = {};
  for (const fila of filasEstudiante ?? []) {
    celdas[fila.oferta_curso_id] = notaCeldaFolio(fila);
  }
  return celdas;
}

/**
 * Columna ESTADO sugerida para la fila del folio, desde el estado REAL de
 * matrícula de cada materia (matriculas_materia.estado, vía filas 135) — el
 * folio no decide nada por su cuenta, solo lo agrega:
 * - alguna materia REPROBADO                          → REPROBADO
 * - alguna materia CURSANDO/INSCRITO (aún sin nota)    → CURSANDO
 * - todas ABANDONO/RETIRADO (retiro real registrado)   → ABANDONO
 * - en otro caso (con nota, ninguna reprobada)         → APROBADO
 * Sin filas (sin matrícula visible en la 135) → ABANDONO (todo NP en el papel).
 *
 * El paso CURSANDO→REPROBADO cuando cierra la gestión sin nota es
 * responsabilidad del centralizador de notas (matriculas_materia.estado), no
 * de este helper: al cerrar, esa capa marca la materia y esta función ya la
 * lee como REPROBADO de forma natural.
 *
 * @param {Array<Object>} filasEstudiante
 * @returns {string} ESTADOS_ACADEMICOS_FOLIO.*
 */
export function derivarEstadoAcademico(filasEstudiante) {
  const filas = filasEstudiante ?? [];
  if (filas.length === 0) return ESTADOS_ACADEMICOS_FOLIO.ABANDONO;

  const algunaReprobada = filas.some((fila) => fila.estado === 'REPROBADO');
  if (algunaReprobada) return ESTADOS_ACADEMICOS_FOLIO.REPROBADO;

  const algunaCursando = filas.some(
    (fila) => ['CURSANDO', 'INSCRITO'].includes(fila.estado) && notaCeldaFolio(fila) === NOTA_NP,
  );
  if (algunaCursando) return ESTADOS_ACADEMICOS_FOLIO.CURSANDO;

  const todasAbandonoORetirado = filas.every((fila) => ESTADOS_MATERIA_NP.includes(fila.estado));
  if (todasAbandonoORetirado) return ESTADOS_ACADEMICOS_FOLIO.ABANDONO;

  return ESTADOS_ACADEMICOS_FOLIO.APROBADO;
}

export default {
  NOTA_NP,
  construirAsignaturasDesdeFilas135,
  notaCeldaFolio,
  agruparFilas135PorEstudiante,
  construirCeldasEstudiante,
  derivarEstadoAcademico,
};
