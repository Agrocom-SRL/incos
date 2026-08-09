/**
 * Normalización de las filas de paralelos del dashboard compartido
 * (`vista_horarios_paralelo_estado`, snake_case) al shape camelCase que
 * consume la pantalla P1 nivel 1 de Nivelación. Espejo local de
 * `centralizador/utils/paraleloCentralizador.js` — módulo autocontenido, no
 * se cruza el import (mismo patrón de duplicación deliberada que
 * `CabeceraAsignatura.jsx`/`CeldaEstudiante.jsx`).
 */

/**
 * @param {Object} row fila snake_case del dashboard de paralelos
 */
export const normalizarParaleloNivelacion = (row) => ({
  paraleloGestionId: row.paralelo_gestion_id != null ? Number(row.paralelo_gestion_id) : null,
  paraleloNombre: row.paralelo_nombre ?? null,
  carreraId: row.carrera_id != null ? Number(row.carrera_id) : null,
  carreraNombre: row.carrera_nombre ?? null,
  carreraColorHex: row.carrera_color_hex ?? null,
  periodoNombre: row.periodo_nombre ?? null,
  turno: row.turno ?? null,
  cantidadEstudiantes:
    row.cantidad_estudiantes != null ? Number(row.cantidad_estudiantes) : null,
});

/** Normaliza y filtra la colección, descartando filas sin `paralelo_gestion_id`. */
export const normalizarParalelosNivelacion = (rows = []) =>
  (Array.isArray(rows) ? rows : [])
    .map(normalizarParaleloNivelacion)
    .filter((p) => p.paraleloGestionId != null);

/** Etiqueta corta del paralelo para breadcrumbs/títulos: solo "Paralelo X". */
export const etiquetaParaleloNivelacionCorta = (p) =>
  p?.paraleloNombre ? `Paralelo ${p.paraleloNombre}` : null;

/**
 * Fusiona el dataset compartido de paralelos (`useParalelosEstadoApi`) con el
 * conteo de pendientes de nivelación por paralelo
 * (`listarNivelacionesPendientesPorParalelo`), por `paraleloGestionId`. NO
 * reconstruye el listado de paralelos (documento de diseño, B1 nivel 1).
 *
 * @param {Array} paralelosRows filas snake_case del dashboard compartido
 * @param {Array<{paraleloGestionId:number,totalEstudiantes:number,totalPendientes:number}>} pendientesRows
 */
export const fusionarPendientesNivelacion = (paralelosRows = [], pendientesRows = []) => {
  const pendientesMap = new Map(
    (Array.isArray(pendientesRows) ? pendientesRows : []).map((row) => [
      row.paraleloGestionId,
      row,
    ]),
  );

  return normalizarParalelosNivelacion(paralelosRows).map((paralelo) => {
    const pendiente = pendientesMap.get(paralelo.paraleloGestionId);
    return {
      ...paralelo,
      // Del dashboard compartido, si el conteo dedicado no trajo el paralelo
      // (sin materias arrastradas registradas todavía) cae a 0, no a null.
      totalEstudiantes: pendiente?.totalEstudiantes ?? paralelo.cantidadEstudiantes ?? 0,
      totalPendientes: pendiente?.totalPendientes ?? 0,
    };
  });
};
