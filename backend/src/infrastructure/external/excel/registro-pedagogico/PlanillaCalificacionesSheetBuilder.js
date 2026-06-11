/**
 * PlanillaCalificacionesSheetBuilder — construye la hoja PLANILLA CALIFICACIONES:
 * resumen por estudiante (sexo, C.I., parcial teórico/práctico, nota, observación),
 * estadísticas del curso y espacio de firma del docente.
 *
 * Las notas teórica/práctica referencian las columnas de promedio del CONSOLIDADO.
 * Fórmulas en INGLÉS (IF/COUNTIF/AVERAGEIF). Caso vacío (sin evaluaciones): no se
 * calcula nada; solo el conteo de inscritos por sexo se mantiene.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { L } from './registroPedagogicoColumnMap.js';

const COL = { nro: 2, nombre: 3, sexo: 4, ci: 5, teoria: 7, practica: 8, nota: 9, obs: 10 };

export class PlanillaCalificacionesSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos
   * @param {Array} params.estudiantes
   * @param {Object} params.cols - mapa de columnas del CONSOLIDADO (para referencias).
   * @param {{ cuotaPractico:number, cuotaTeorico:number, notaAprobacion:number }} params.ponderacion
   * @param {boolean} params.hayEvaluaciones
   */
  static build({ composer: c, datos, estudiantes, cols, ponderacion, hayEvaluaciones }) {
    const { cuotaPractico, cuotaTeorico, notaAprobacion } = ponderacion;
    const bimestreLabel = String(datos.bimestre ?? '').toUpperCase();
    const firstDataRow = 7;
    const hayEstudiantes = estudiantes.length > 0;
    const lastDataRow = firstDataRow + Math.max(estudiantes.length - 1, 0);
    const { small } = EXCEL_FONT_SIZE;

    c.colWidths({ 1: 2, 2: 12, 3: 38, 4: 7, 5: 16, 6: 3, 7: 11, 8: 11, 9: 11, 10: 18 });

    c.bandTitle('B1:J1', `PLANILLA DE REGISTRO PEDAGÓGICO · ${bimestreLabel} BIMESTRE`);

    // Cabecera institucional — bloque izquierdo y derecho (mismo patrón que CONSOLIDADO).
    c.infoField('B2:B2', 'CARRERA:', 'C2:C2', datos.carrera);
    c.infoField('B3:B3', 'ASIGNATURA:', 'C3:C3', datos.asignatura);
    c.infoField('B4:B4', 'CÓDIGO:', 'C4:C4', datos.codigo_asignatura);
    c.infoField('F2:H2', 'DOCENTE:', 'I2:J2', datos.docente);
    c.infoField(
      'F3:H3',
      'CURSO:',
      'I3:J3',
      `${datos.curso ?? ''}   PARALELO: ${datos.paralelo ?? ''}`
    );
    c.infoField(
      'F4:H4',
      'GESTIÓN:',
      'I4:J4',
      `${datos.gestion ?? ''}   BIMESTRE: ${bimestreLabel}`
    );

    // Cabecera de tabla (filas 7–8)
    const r7 = 5;
    const r8 = 6;
    ['Nº', 'NOMBRES', 'Sexo', 'C.I.'].forEach((h, i) => {
      c.ws.mergeCells(r7, 2 + i, r8, 2 + i);
      c.cell(r7, 2 + i, h, { bold: true, size: small, wrap: true, fill: EXCEL_COLOR.infoLabel });
    });
    c.merge(`G${r7}:I${r7}`, 'PARCIAL', { bold: true, size: small, fill: EXCEL_COLOR.infoLabel });
    c.cell(r8, COL.teoria, `Teórica\n(${cuotaTeorico})`, {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.teoricas
    });
    c.cell(r8, COL.practica, `Práctica\n(${cuotaPractico})`, {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.practicas
    });
    c.cell(r8, COL.nota, 'NOTA', {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.finalHeader,
      fontColor: EXCEL_COLOR.white
    });
    c.ws.mergeCells(r7, COL.obs, r8, COL.obs);
    c.cell(r7, COL.obs, 'Observaciones', {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.obsHeader
    });
    c.ws.getRow(r8).height = 30;

    estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.cell(row, COL.nro, est.nro ?? idx + 1, { fill: zebra });
      c.cell(row, COL.nombre, String(est.nombre ?? '').toUpperCase(), {
        align: 'left',
        fill: zebra
      });
      c.cell(row, COL.sexo, est.sexo ?? '', { fill: zebra });
      c.cell(row, COL.ci, est.ci ?? '', { fill: zebra });

      if (!hayEvaluaciones) {
        c.cell(row, COL.teoria, '', { fill: EXCEL_COLOR.teoricas });
        c.cell(row, COL.practica, '', { fill: EXCEL_COLOR.practicas });
        c.cell(row, COL.nota, '', { fill: EXCEL_COLOR.finalCell });
        c.cell(row, COL.obs, '', { fill: EXCEL_COLOR.obsCell });
        return;
      }

      c.formula(row, COL.teoria, `CONSOLIDADO!${L(cols.colPromTeo)}${8 + idx}`, {
        fill: EXCEL_COLOR.teoricas
      });
      c.formula(row, COL.practica, `CONSOLIDADO!${L(cols.colPromPract)}${8 + idx}`, {
        fill: EXCEL_COLOR.practicas
      });
      c.formula(row, COL.nota, `G${row}+H${row}`, { bold: true, fill: EXCEL_COLOR.finalCell });
      c.formula(
        row,
        COL.obs,
        `IF(I${row}>=${notaAprobacion},"APROBADO/A",IF(I${row}=0,"NO SE PRESENTO","REPROBADO/A"))`,
        { wrap: true, fill: EXCEL_COLOR.obsCell }
      );
    });

    const footerRow = lastDataRow + 3;
    c.merge(`B${footerRow}:F${footerRow}`, `LUGAR Y FECHA: ${datos.fecha_emision ?? ''}`, {
      align: 'left',
      border: false
    });

    this._estadisticas(c, {
      firstDataRow,
      lastDataRow,
      hayEstudiantes,
      hayEvaluaciones,
      footerRow
    });
    c.freeze(r8, COL.ci);
  }

  /** Grilla de estadísticas: inscritos por sexo + reprobados/aprobados/promedio. */
  static _estadisticas(
    c,
    { firstDataRow, lastDataRow, hayEstudiantes, hayEvaluaciones, footerRow }
  ) {
    const { small } = EXCEL_FONT_SIZE;
    const titleRow = footerRow + 2;
    const headRow = titleRow + 1;
    const rango = (col) => `${L(col)}${firstDataRow}:${L(col)}${lastDataRow}`;
    const obsRange = rango(COL.obs);

    // Slots contiguos para que la grilla no quede separada: Concepto | F | M | Total.
    const CONCEPTO = [3, 3];
    const SLOT_F = [4, 5];
    const SLOT_M = [6, 7];
    const SLOT_TOTAL = [8, 9];
    const slot = ([start, end], row, value, style = {}, isFormula = false) => {
      if (end > start) c.ws.mergeCells(row, start, row, end);
      return isFormula ? c.formula(row, start, value, style) : c.cell(row, start, value, style);
    };

    c.cell(titleRow, COL.nombre, 'ESTADÍSTICAS', { bold: true, align: 'left', border: false });

    const headStyle = {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText
    };
    slot(CONCEPTO, headRow, 'Concepto', headStyle);
    slot(SLOT_F, headRow, 'Mujeres (F)', headStyle);
    slot(SLOT_M, headRow, 'Varones (M)', headStyle);
    slot(SLOT_TOTAL, headRow, 'Total', headStyle);

    const filas = [
      { label: 'Inscritos', tipo: 'inscritos' },
      { label: 'Reprobados', tipo: 'total', criterio: 'REPROBADO/A' },
      { label: 'Aprobados', tipo: 'total', criterio: 'APROBADO/A' },
      { label: 'Promedio (aprobados)', tipo: 'promedio' }
    ];
    const calcular = hayEstudiantes && hayEvaluaciones;

    filas.forEach((fila, i) => {
      const row = headRow + 1 + i;
      slot(CONCEPTO, row, fila.label, { bold: true, align: 'left' });

      if (fila.tipo === 'inscritos') {
        // Conteo por sexo: válido aunque no haya evaluaciones.
        slot(
          SLOT_F,
          row,
          hayEstudiantes ? `COUNTIF(${rango(COL.sexo)},"F")` : '',
          {},
          hayEstudiantes
        );
        slot(
          SLOT_M,
          row,
          hayEstudiantes ? `COUNTIF(${rango(COL.sexo)},"M")` : '',
          {},
          hayEstudiantes
        );
        slot(
          SLOT_TOTAL,
          row,
          hayEstudiantes ? `${L(SLOT_F[0])}${row}+${L(SLOT_M[0])}${row}` : 0,
          { bold: true },
          hayEstudiantes
        );
        return;
      }

      slot(SLOT_F, row, '');
      slot(SLOT_M, row, '');
      if (!calcular) {
        slot(SLOT_TOTAL, row, '', { bold: true });
      } else if (fila.tipo === 'total') {
        slot(SLOT_TOTAL, row, `COUNTIF(${obsRange},"${fila.criterio}")`, { bold: true }, true);
      } else {
        slot(
          SLOT_TOTAL,
          row,
          `AVERAGEIF(${obsRange},"APROBADO/A",${rango(COL.nota)})`,
          { bold: true },
          true
        );
      }
    });

    // Firma del docente
    const firmaRow = headRow + filas.length + 3;
    c.merge(`C${firmaRow}:G${firmaRow}`, 'DOCENTE (Sello y Firma)', {
      align: 'center',
      border: false
    });
    c.ws.mergeCells(firmaRow + 1, 3, firmaRow + 1, 7);
    c.ws.getCell(firmaRow + 1, 3).border = {
      bottom: { style: 'medium', color: { argb: EXCEL_COLOR.headerBorder } }
    };
  }
}

export default PlanillaCalificacionesSheetBuilder;
