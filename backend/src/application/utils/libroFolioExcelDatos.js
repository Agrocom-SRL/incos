/**
 * Helper compartido del Libro de registro / Centralizador anual (.xlsx).
 *
 * Arma la "hoja" de UN paralelo (folios apilados + estadísticas) con
 * EXACTAMENTE la misma forma que consume
 * `ILibroRegistroExcelGenerator.generarLibroRegistro({ hojas })` — espejo, para
 * el grano ANUAL, de `centralizadorExcelDatos.js` (que arma el payload por
 * bimestre). Lo usan `ExportLibroExcelUseCase` (una hoja por paralelo del
 * libro completo) y `ExportCentralizadorAnualParaleloExcelUseCase` (una sola
 * hoja de un paralelo), para NO duplicar el armado de `hoja`.
 *
 * También corrige el formato de CURSO del documento oficial: "TERCERO -
 * PARALELO A" (ordinal del periodo + solo la letra del paralelo), NO
 * "PRIMER AÑO - PARALELO PRIMERO A" (defecto detectado contra el libro físico
 * real — `periodo_nombre` trae "Primer Año" y `paralelo_nombre` ya trae el
 * ordinal repetido, p. ej. "TERCERO A").
 */

import { toFolioEstudianteDTO } from '../mappers/academico/LibroRegistroPresentationMapper.js';
import {
  construirAsignaturasDesdeFilas135,
  agruparFilas135PorEstudiante,
  construirCeldasEstudiante,
} from '../use-cases/academico/libros/helpers/folioCeldasHelper.js';

/** Ordinal institucional del periodo (1..N → PRIMERO/SEGUNDO/TERCERO/...). */
const ORDINAL_PERIODO = ['', 'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO'];

/**
 * Ordinal del periodo del CURSO oficial. Con `periodoNumero` fuera del
 * catálogo (o ausente), deriva del nombre quitando el sufijo " Año"/" AÑO"
 * (compatibilidad; no debería ocurrir con datos reales).
 * @param {number|string|null} periodoNumero
 * @param {string|null} [periodoNombre]
 * @returns {string}
 */
export function formatOrdinalPeriodo(periodoNumero, periodoNombre = null) {
  const n = Number(periodoNumero);
  if (Number.isFinite(n) && n >= 1 && n < ORDINAL_PERIODO.length) return ORDINAL_PERIODO[n];
  return String(periodoNombre ?? '')
    .toUpperCase()
    .replace(/\s+A[ÑN]O$/, '')
    .trim();
}

/** Solo la LETRA del paralelo ("TERCERO A" → "A"): último token del nombre. */
export function formatLetraParalelo(paraleloNombre) {
  const partes = String(paraleloNombre ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return partes.length > 0 ? partes[partes.length - 1].toUpperCase() : '';
}

/**
 * CURSO del documento oficial: "TERCERO - PARALELO A".
 * @param {{ periodoNumero, periodoNombre, paraleloNombre }} params
 * @returns {string}
 */
export function formatCursoLibro({ periodoNumero, periodoNombre, paraleloNombre }) {
  const ordinal = formatOrdinalPeriodo(periodoNumero, periodoNombre);
  const letra = formatLetraParalelo(paraleloNombre);
  return `${ordinal} - PARALELO ${letra}`.trim();
}

/** Nombre de hoja corto por paralelo ("TERCERO A"), saneado/único por el generador. */
export function formatNombreHojaParalelo({ periodoNumero, periodoNombre, paraleloNombre }) {
  const ordinal = formatOrdinalPeriodo(periodoNumero, periodoNombre);
  const letra = formatLetraParalelo(paraleloNombre);
  return `${ordinal} ${letra}`.trim();
}

/**
 * Arma la "hoja" de UN paralelo para
 * `ILibroRegistroExcelGenerator.generarLibroRegistro({ hojas })`: folios
 * (cabecera + asignaturas + estudiantes con celdas de nota) + estadísticas.
 *
 * @param {Object} params
 * @param {Object} [params.libroRow] - Cabecera del libro (vista 175) o
 *        equivalente mínimo: { numero_libro, codigo_registro, carrera_nombre,
 *        gestion_anio }. Si falta, se completa con el primer folio del grupo.
 * @param {Array<Object>} params.foliosParalelo - Filas de folio (vista 176)
 *        de UN MISMO paralelo, ya ordenadas por numero_folio.
 * @param {Array<Object>} params.filas135 - Filas de la vista 135 del paralelo
 *        (notas por materia; consultadas UNA vez por el caller).
 * @param {Map<number, Array<Object>>} params.estudiantesPorFolio - folio.id →
 *        filas de `LibroRegistroRepository.listarEstudiantesFolio(folio.id)`.
 * @param {Object|null} [params.estadisticas] - Del helper
 *        `estadisticasParaleloHelper.calcularEstadisticasParalelo`.
 * @returns {{ nombreHoja: string, folios: Array<Object>, estadisticas: Object|null }}
 */
export function construirHojaParalelo({
  libroRow = null,
  foliosParalelo,
  filas135,
  estudiantesPorFolio,
  estadisticas = null,
}) {
  const folioRows = Array.isArray(foliosParalelo) ? foliosParalelo : [];
  const asignaturas = construirAsignaturasDesdeFilas135(filas135);
  const filasPorEstudiante = agruparFilas135PorEstudiante(filas135);
  const primero = folioRows[0] ?? {};

  const folios = folioRows.map((folioRow) => {
    const estudiantesRows = estudiantesPorFolio?.get(folioRow.id) ?? [];
    return {
      cabecera: {
        codigoRegistro: libroRow?.codigo_registro ?? folioRow.codigo_registro ?? '',
        numeroLibro: libroRow?.numero_libro ?? folioRow.numero_libro,
        numeroFolio: folioRow.numero_folio,
        turno: folioRow.turno ?? '',
        gestionAnio: folioRow.gestion_anio ?? libroRow?.gestion_anio ?? '',
        carrera: folioRow.carrera_nombre ?? libroRow?.carrera_nombre ?? '',
        curso: formatCursoLibro({
          periodoNumero: folioRow.periodo_numero,
          periodoNombre: folioRow.periodo_nombre,
          paraleloNombre: folioRow.paralelo_nombre,
        }),
        estado: folioRow.estado,
      },
      asignaturas,
      estudiantes: estudiantesRows.map((fila) => ({
        ...toFolioEstudianteDTO(fila),
        celdas: construirCeldasEstudiante(filasPorEstudiante.get(fila.estudiante_id)),
      })),
    };
  });

  return {
    nombreHoja: formatNombreHojaParalelo({
      periodoNumero: primero.periodo_numero,
      periodoNombre: primero.periodo_nombre,
      paraleloNombre: primero.paralelo_nombre,
    }),
    folios,
    estadisticas,
  };
}

export default {
  formatOrdinalPeriodo,
  formatLetraParalelo,
  formatCursoLibro,
  formatNombreHojaParalelo,
  construirHojaParalelo,
};
