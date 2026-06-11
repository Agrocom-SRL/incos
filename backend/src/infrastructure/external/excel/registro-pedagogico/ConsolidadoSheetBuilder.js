/**
 * ConsolidadoSheetBuilder — construye la hoja CONSOLIDADO del Registro Pedagógico:
 * detalle de evaluaciones prácticas / teóricas, promedios ponderados, nota final,
 * observaciones y estadísticas por curso.
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme). La ponderación
 * (cuotas, pesos, nota de aprobación) llega como parámetro desde la configuración
 * institucional; no hay literales de negocio embebidos.
 *
 * Robustez: si un componente no tiene evaluaciones, su promedio y contadores se
 * emiten como literal 0 (nunca como fórmula auto-referente) para evitar referencias
 * circulares.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { L } from './registroPedagogicoColumnMap.js';

export class ConsolidadoSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos
   * @param {Array} params.practicas
   * @param {Array} params.teoricas
   * @param {Array} params.estudiantes
   * @param {Object} params.cols
   * @param {{ cuotaPractico:number, cuotaTeorico:number, pesoPractico:number, pesoTeorico:number, notaAprobacion:number }} params.ponderacion
   */
  static build({ composer: c, datos, practicas, teoricas, estudiantes, cols, ponderacion }) {
    const { cuotaPractico, cuotaTeorico, pesoPractico, pesoTeorico, notaAprobacion } = ponderacion;
    const { lastCol } = cols;
    const bimestreLabel = String(datos.bimestre ?? '').toUpperCase();
    const firstDataRow = 8;
    const hayEstudiantes = estudiantes.length > 0;
    const lastDataRow = firstDataRow + Math.max(estudiantes.length - 1, 0);
    const { small } = EXCEL_FONT_SIZE;

    // Anchos
    c.colWidths({ 1: 2, [cols.colNro]: 5, [cols.colNombre]: 36 });
    for (let col = cols.colPractStart; col <= cols.colNoEval; col += 1) {
      let width = 8;
      if (col === cols.colPromPract || col === cols.colPromTeo) width = 12;
      else if (col === cols.colFinal) width = 11;
      else if (col === cols.colObs) width = 15;
      else if (col >= cols.colNoPract) width = 11;
      c.colWidths({ [col]: width });
    }

    // Banda de título + cabecera institucional
    c.bandTitle(`B1:${L(lastCol)}1`, `REGISTRO PEDAGÓGICO · ${bimestreLabel} BIMESTRE`);
    c.labelValue('B2', 'CARRERA:', 'D2', datos.carrera);
    c.labelValue('B3', 'ASIGNATURA:', 'D3', datos.asignatura);
    c.labelValue('B4', 'CÓDIGO:', 'D4', datos.codigo_asignatura);
    c.labelValue('L2', 'DOCENTE:', 'N2', datos.docente);
    c.labelValue('L3', 'CURSO:', 'N3', `${datos.curso ?? ''}   PARALELO: ${datos.paralelo ?? ''}`);
    c.labelValue('L4', 'GESTIÓN:', 'N4', `${datos.gestion ?? ''}   BIMESTRE: ${bimestreLabel}`);

    // Cabecera de tabla (filas 5–7)
    const rowSec = 5;
    const rowNames = 6;
    const rowMax = 7;

    const headBox = (col, text, opts) => {
      c.ws.mergeCells(rowSec, col, rowMax, col);
      c.cell(rowSec, col, text, { bold: true, size: small, wrap: true, ...opts });
    };
    headBox(cols.colNro, 'Nº');
    headBox(cols.colNombre, 'APELLIDOS Y NOMBRES', { align: 'center' });
    headBox(cols.colFinal, 'CALIFICACIÓN FINAL', {
      fill: EXCEL_COLOR.finalHeader,
      fontColor: EXCEL_COLOR.white
    });
    headBox(cols.colObs, 'OBSERVACIONES', { fill: EXCEL_COLOR.obsHeader });
    headBox(cols.colNoPract, 'PRÁCTICOS / ACTIVIDADES NO PRESENTADOS', {
      fill: EXCEL_COLOR.obsHeader
    });
    headBox(cols.colNoTeo, 'EXÁMENES NO PRESENTADOS', { fill: EXCEL_COLOR.obsHeader });
    headBox(cols.colNoEval, 'EVALUACIONES NO PRESENTADAS', { fill: EXCEL_COLOR.obsHeader });

    // Secciones (si un componente no tiene evaluaciones, el título cubre solo su promedio)
    const seccion = (numEvals, startCol, promCol, titulo, fill) => {
      if (numEvals > 0) {
        c.merge(`${L(startCol)}${rowSec}:${L(promCol)}${rowSec}`, titulo, {
          bold: true,
          size: small,
          fill,
          wrap: true,
          borderMedium: true
        });
      } else {
        c.cell(rowSec, promCol, titulo, { bold: true, size: small, fill, wrap: true });
      }
    };
    seccion(
      practicas.length,
      cols.colPractStart,
      cols.colPromPract,
      `EVALUACIONES PRÁCTICAS ${cuotaPractico}%`,
      EXCEL_COLOR.practicasStrong
    );
    seccion(
      teoricas.length,
      cols.colTeoStart,
      cols.colPromTeo,
      `EVALUACIONES TEÓRICAS ${cuotaTeorico}%`,
      EXCEL_COLOR.teoricasStrong
    );

    // Nombres de evaluación (fila 6) y puntajes máximos (fila 7)
    const columnaEval = (evals, startCol, fill) => {
      evals.forEach((ev, i) => {
        c.cell(rowNames, startCol + i, ev.nombre ?? '', {
          bold: true,
          size: small,
          fill,
          wrap: true
        });
        c.cell(rowMax, startCol + i, ev.puntaje_maximo ?? 0, { size: small, fill });
      });
    };
    columnaEval(practicas, cols.colPractStart, EXCEL_COLOR.practicas);
    columnaEval(teoricas, cols.colTeoStart, EXCEL_COLOR.teoricas);

    c.cell(rowNames, cols.colPromPract, 'PROM. PRÁCTICAS', {
      bold: true,
      size: small,
      fill: EXCEL_COLOR.practicas,
      wrap: true
    });
    c.cell(rowMax, cols.colPromPract, pesoPractico, { size: small, fill: EXCEL_COLOR.practicas });
    c.cell(rowNames, cols.colPromTeo, 'PROM. TEÓRICAS', {
      bold: true,
      size: small,
      fill: EXCEL_COLOR.teoricas,
      wrap: true
    });
    c.cell(rowMax, cols.colPromTeo, pesoTeorico, { size: small, fill: EXCEL_COLOR.teoricas });

    c.ws.getRow(rowSec).height = 30;
    c.ws.getRow(rowNames).height = 40;

    // Filas de estudiantes
    estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;

      c.cell(row, cols.colNro, est.nro ?? idx + 1, { fill: zebra });
      c.cell(row, cols.colNombre, String(est.nombre ?? '').toUpperCase(), {
        fill: zebra,
        align: 'left'
      });

      (est.notas_practicas ?? []).forEach((nota, i) => {
        c.cell(row, cols.colPractStart + i, nota ?? 0, { fill: zebra });
      });
      (est.notas_teoricas ?? []).forEach((nota, i) => {
        c.cell(row, cols.colTeoStart + i, nota ?? 0, { fill: zebra });
      });

      // Promedios: fórmula solo si el componente tiene evaluaciones; si no, literal 0.
      if (practicas.length > 0) {
        c.formula(row, cols.colPromPract, `ENTERO(SUMA(${cols.practRange(row)})*${pesoPractico})`, {
          fill: EXCEL_COLOR.practicas
        });
        c.formula(row, cols.colNoPract, `CONTAR.SI(${cols.practRange(row)},0)`, { fill: zebra });
      } else {
        c.cell(row, cols.colPromPract, 0, { fill: EXCEL_COLOR.practicas });
        c.cell(row, cols.colNoPract, 0, { fill: zebra });
      }
      if (teoricas.length > 0) {
        c.formula(row, cols.colPromTeo, `ENTERO(SUMA(${cols.teoRange(row)})*${pesoTeorico})`, {
          fill: EXCEL_COLOR.teoricas
        });
        c.formula(row, cols.colNoTeo, `CONTAR.SI(${cols.teoRange(row)},0)`, { fill: zebra });
      } else {
        c.cell(row, cols.colPromTeo, 0, { fill: EXCEL_COLOR.teoricas });
        c.cell(row, cols.colNoTeo, 0, { fill: zebra });
      }

      c.formula(row, cols.colFinal, `${L(cols.colPromPract)}${row}+${L(cols.colPromTeo)}${row}`, {
        fill: EXCEL_COLOR.finalCell,
        bold: true
      });
      c.formula(
        row,
        cols.colObs,
        `SI(${L(cols.colFinal)}${row}>=${notaAprobacion},"APROBADO/A",SI(${L(cols.colFinal)}${row}=0,"NO SE PRESENTO","REPROBADO/A"))`,
        { fill: EXCEL_COLOR.obsCell, wrap: true }
      );
      c.formula(row, cols.colNoEval, `${L(cols.colNoPract)}${row}+${L(cols.colNoTeo)}${row}`, {
        fill: zebra
      });
    });

    // Estadísticas
    const statsStart = lastDataRow + 3;
    const obsCol = L(cols.colObs);
    const obsRange = hayEstudiantes ? `${obsCol}${firstDataRow}:${obsCol}${lastDataRow}` : null;
    const stats = [
      ['APROBADOS:', 'APROBADO/A'],
      ['REPROBADOS:', 'REPROBADO/A'],
      ['NO SE PRESENTÓ:', 'NO SE PRESENTO']
    ];
    stats.forEach(([label, criterio], i) => {
      const row = statsStart + i;
      c.cell(row, cols.colNombre, label, { bold: true, align: 'left', border: false });
      if (obsRange) {
        c.formula(row, cols.colNombre + 1, `CONTAR.SI(${obsRange},"${criterio}")`, {
          align: 'left'
        });
      } else {
        c.cell(row, cols.colNombre + 1, 0, { align: 'left' });
      }
    });
    const totalRow = statsStart + 3;
    c.cell(totalRow, cols.colNombre, 'TOTAL:', { bold: true, align: 'left', border: false });
    c.formula(
      totalRow,
      cols.colNombre + 1,
      `${L(cols.colNombre + 1)}${statsStart}+${L(cols.colNombre + 1)}${statsStart + 1}+${L(cols.colNombre + 1)}${statsStart + 2}`,
      { align: 'left' }
    );

    c.freeze(rowMax, cols.colNombre);
  }
}

export default ConsolidadoSheetBuilder;
