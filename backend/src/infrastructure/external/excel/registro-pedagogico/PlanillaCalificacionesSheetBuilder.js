/**
 * PlanillaCalificacionesSheetBuilder — construye la hoja PLANILLA CALIFICACIONES:
 * resumen por estudiante (sexo, C.I., parcial teórico/práctico, nota, observación),
 * estadísticas por sexo y espacio de firma del docente.
 *
 * Las notas teórica/práctica referencian las columnas de promedio del CONSOLIDADO.
 * Solo construcción + estilos; la ponderación llega como parámetro.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { L } from './registroPedagogicoColumnMap.js';

export class PlanillaCalificacionesSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos
   * @param {Array} params.estudiantes
   * @param {Object} params.cols
   * @param {{ cuotaPractico:number, cuotaTeorico:number, notaAprobacion:number }} params.ponderacion
   */
  static build({ composer: c, datos, estudiantes, cols, ponderacion }) {
    const { cuotaPractico, cuotaTeorico, notaAprobacion } = ponderacion;
    const bimestreLabel = String(datos.bimestre ?? '').toUpperCase();
    const firstDataRow = 11;
    const hayEstudiantes = estudiantes.length > 0;
    const lastDataRow = firstDataRow + Math.max(estudiantes.length - 1, 0);
    const { small } = EXCEL_FONT_SIZE;

    c.colWidths({ 1: 2, 2: 5, 3: 36, 4: 6, 5: 14, 6: 3, 7: 10, 8: 10, 9: 10, 10: 16 });

    c.bandTitle(
      'B1:J1',
      `PLANILLA DE REGISTRO PEDAGÓGICO DE CALIFICACIONES · ${bimestreLabel} BIMESTRE`
    );

    c.labelValue('B2', 'CARRERA:', 'C2', datos.carrera);
    c.labelValue('B3', 'CURSO:', 'C3', `${datos.curso ?? ''}   PARALELO: ${datos.paralelo ?? ''}`);
    c.labelValue('B4', 'ASIGNATURA:', 'C4', datos.asignatura);
    c.labelValue(
      'B5',
      'CÓDIGO:',
      'C5',
      `${datos.codigo_asignatura ?? ''}   GESTIÓN: ${datos.gestion ?? ''}`
    );
    c.labelValue('B6', 'DOCENTE:', 'C6', datos.docente);

    // Cabecera de tabla (filas 9–10)
    const r9 = 9;
    const r10 = 10;
    ['Nº', 'NOMBRES', 'Sexo', 'C.I.'].forEach((h, i) => {
      c.ws.mergeCells(r9, 2 + i, r10, 2 + i);
      c.cell(r9, 2 + i, h, { bold: true, size: small, wrap: true });
    });
    c.merge(`G${r9}:I${r9}`, 'PARCIAL', { bold: true, size: small });
    c.cell(r10, 7, `Teoría\n${cuotaTeorico}`, {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.teoricas
    });
    c.cell(r10, 8, `Práctica\n${cuotaPractico}`, {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.practicas
    });
    c.cell(r10, 9, 'NOTA', { bold: true, size: small, wrap: true, fill: EXCEL_COLOR.finalCell });
    c.ws.mergeCells(r9, 10, r10, 10);
    c.cell(r9, 10, 'Observaciones', {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.obsHeader
    });
    c.ws.getRow(r10).height = 28;

    estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, 2, est.nro ?? idx + 1, { fill: zebra });
      c.cell(row, 3, String(est.nombre ?? '').toUpperCase(), { align: 'left', fill: zebra });
      c.cell(row, 4, est.sexo ?? '', { fill: zebra });
      c.cell(row, 5, est.ci ?? '', { fill: zebra });
      c.formula(row, 7, `CONSOLIDADO!${L(cols.colPromTeo)}${8 + idx}`, { fill: zebra });
      c.formula(row, 8, `CONSOLIDADO!${L(cols.colPromPract)}${8 + idx}`, { fill: zebra });
      c.formula(row, 9, `G${row}+H${row}`, { bold: true, fill: EXCEL_COLOR.finalCell });
      c.formula(
        row,
        10,
        `SI(I${row}>=${notaAprobacion},"APROBADO/A",SI(I${row}=0,"NO SE PRESENTO","REPROBADO/A"))`,
        { wrap: true, fill: EXCEL_COLOR.obsCell }
      );
    });

    // Pie: fecha + estadísticas + firma
    const footerRow = lastDataRow + 3;
    c.merge(`B${footerRow}:F${footerRow}`, `LUGAR Y FECHA: ${datos.fecha_emision ?? ''}`, {
      align: 'left',
      border: false
    });

    const statRow = footerRow + 2;
    c.cell(statRow, 3, 'ESTADÍSTICAS', { bold: true, align: 'left', border: false });

    const statHeader = statRow + 1;
    ['Inscritos', 'Abandonos', 'Reprobados', 'Aprobados', 'Promedio'].forEach((lbl, i) => {
      c.cell(statHeader, 3 + i, lbl, {
        bold: true,
        size: small,
        wrap: true,
        fill: EXCEL_COLOR.obsHeader
      });
    });
    for (let r = 1; r <= 4; r += 1) {
      c.cell(statHeader + r, 3, 'F');
      c.cell(statHeader + r, 4, 'M');
    }

    const sexoCol = 4;
    const notaCol = 9;
    const obsCol = 10;
    if (hayEstudiantes) {
      const rango = (col) => `${L(col)}${firstDataRow}:${L(col)}${lastDataRow}`;
      const obsRange = rango(obsCol);
      c.formula(statHeader + 1, 5, `CONTAR.SI(${rango(sexoCol)},"F")`);
      c.formula(statHeader + 2, 5, `CONTAR.SI(${rango(sexoCol)},"M")`);
      c.formula(statHeader + 3, 5, `CONTAR.SI(${obsRange},"REPROBADO/A")`);
      c.formula(statHeader + 4, 5, `CONTAR.SI(${obsRange},"APROBADO/A")`);
      c.formula(statHeader + 5, 5, `PROMEDIO.SI(${obsRange},"APROBADO/A",${rango(notaCol)})`);
    } else {
      [1, 2, 3, 4, 5].forEach((r) => c.cell(statHeader + r, 5, 0));
    }

    const firmaRow = statHeader + 7;
    c.merge(`C${firmaRow}:G${firmaRow}`, 'DOCENTE (Sello y Firma)', {
      align: 'center',
      border: false
    });
    c.ws.mergeCells(firmaRow + 1, 3, firmaRow + 1, 7);
    c.ws.getCell(firmaRow + 1, 3).border = {
      bottom: { style: 'medium', color: { argb: EXCEL_COLOR.headerBorder } }
    };

    c.freeze(r10, 3);
  }
}

export default PlanillaCalificacionesSheetBuilder;
