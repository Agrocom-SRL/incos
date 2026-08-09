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
 * Veredicto de UNA materia contra la nota mínima institucional — fuente ÚNICA
 * de "aprobado/reprobado", compartida por el folio del Libro
 * (`derivarEstadoAcademico`) y por Centralizador
 * (`GetCentralizadorParaleloUseCase`), para que ambas pantallas emitan
 * siempre el mismo veredicto sobre el mismo dato (`nota_final` cacheada en
 * `matriculas_materia`, vía filas 135). NO compara `fila.estado ===
 * 'REPROBADO'`: ningún caso de uso del sistema escribe ese valor hoy (el
 * campo solo llega hasta CURSANDO) — decide directamente por umbral.
 * @param {Object} fila135
 * @param {number} notaMinimaAprobacion
 * @returns {string} ESTADOS_ACADEMICOS_FOLIO.*
 */
export function calcularVeredictoMateria(fila135, notaMinimaAprobacion) {
  const estadoMateria = fila135?.estado ?? null;
  if (ESTADOS_MATERIA_NP.includes(estadoMateria)) return ESTADOS_ACADEMICOS_FOLIO.ABANDONO;
  const notaFinal = fila135?.nota_final;
  if (notaFinal == null) return ESTADOS_ACADEMICOS_FOLIO.CURSANDO;
  return Number(notaFinal) >= Number(notaMinimaAprobacion)
    ? ESTADOS_ACADEMICOS_FOLIO.APROBADO
    : ESTADOS_ACADEMICOS_FOLIO.REPROBADO;
}

/**
 * Columna ESTADO sugerida para la fila del folio, agregando el veredicto por
 * materia (`calcularVeredictoMateria`) de cada una de sus filas 135:
 * - alguna materia REPROBADO                          → REPROBADO
 * - alguna materia CURSANDO (aún sin nota_final)       → CURSANDO
 * - todas ABANDONO/RETIRADO (retiro real registrado)   → ABANDONO
 * - en otro caso (con nota, ninguna reprobada)         → APROBADO
 * Sin filas (sin matrícula visible en la 135) → ABANDONO (todo NP en el papel).
 *
 * @param {Array<Object>} filasEstudiante
 * @param {number} notaMinimaAprobacion
 * @returns {string} ESTADOS_ACADEMICOS_FOLIO.*
 */
export function derivarEstadoAcademico(filasEstudiante, notaMinimaAprobacion) {
  const filas = filasEstudiante ?? [];
  if (filas.length === 0) return ESTADOS_ACADEMICOS_FOLIO.ABANDONO;

  const veredictos = filas.map((fila) => calcularVeredictoMateria(fila, notaMinimaAprobacion));

  if (veredictos.some((v) => v === ESTADOS_ACADEMICOS_FOLIO.REPROBADO)) {
    return ESTADOS_ACADEMICOS_FOLIO.REPROBADO;
  }
  if (veredictos.some((v) => v === ESTADOS_ACADEMICOS_FOLIO.CURSANDO)) {
    return ESTADOS_ACADEMICOS_FOLIO.CURSANDO;
  }
  if (veredictos.every((v) => v === ESTADOS_ACADEMICOS_FOLIO.ABANDONO)) {
    return ESTADOS_ACADEMICOS_FOLIO.ABANDONO;
  }
  return ESTADOS_ACADEMICOS_FOLIO.APROBADO;
}

export default {
  NOTA_NP,
  construirAsignaturasDesdeFilas135,
  notaCeldaFolio,
  agruparFilas135PorEstudiante,
  construirCeldasEstudiante,
  calcularVeredictoMateria,
  derivarEstadoAcademico,
};
