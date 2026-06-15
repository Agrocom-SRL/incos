/**
 * PlanillaCalificacionesSheetBuilder — construye la hoja PLANILLA CALIFICACIONES:
 * resumen por estudiante (sexo, C.I., parcial teórico/práctico, nota, observación),
 * estadísticas del curso y espacio de firma del docente.
 *
 * Las notas teórica/práctica referencian las columnas de promedio del CONSOLIDADO.
 * Fórmulas en INGLÉS (IF/COUNTIF/AVERAGEIF). Caso vacío (sin evaluaciones): no se
 * calcula nada; solo el conteo de inscritos por sexo se mantiene.
 *
 * Columnas contiguas (sin huecos): Nº | NOMBRES | Sexo | C.I. | Teórica | Práctica
 * | NOTA | Observaciones.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { L } from './registroPedagogicoColumnMap.js';

const COL = { nro: 2, nombre: 3, sexo: 4, ci: 5, teoria: 6, practica: 7, nota: 8, obs: 9 };

export class PlanillaCalificacionesSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos
   * @param {Array} params.estudiantes
   * @param {Object} params.cols - mapa de columnas del CONSOLIDADO (para referencias).
   * @param {{ cuotaPractico:number, cuotaTeorico:number, notaAprobacion:number }} params.ponderacion
   * @param {boolean} params.hayEvaluaciones - true si existe la hoja CONSOLIDADO (se referencia).
   */
  static build({
    composer: c,
    datos,
    estudiantes,
    cols,
    ponderacion,
    hayEvaluaciones
  }) {
    const { cuotaPractico, cuotaTeorico, notaAprobacion } = ponderacion;
    const bimestreLabel = String(datos.bimestre ?? '').toUpperCase();
    const firstDataRow = 7;
    const hayEstudiantes = estudiantes.length > 0;
    const hayCalificaciones = hayEvaluaciones;
    const lastDataRow = firstDataRow + Math.max(estudiantes.length - 1, 0);
    const { small } = EXCEL_FONT_SIZE;
    const lastCol = L(COL.obs);

    // Anchos (+50% respecto al diseño previo, para más aire dentro de la celda)
    c.colWidths({ 1: 3, 2: 18, 3: 56, 4: 11, 5: 24, 6: 17, 7: 17, 8: 17, 9: 27 });

    c.bandTitle(`B1:${lastCol}1`, `PLANILLA DE REGISTRO PEDAGÓGICO · ${bimestreLabel} BIMESTRE`);

    // Cabecera institucional — bloque izquierdo y derecho (mismo patrón que CONSOLIDADO).
    c.infoField('B2:B2', 'CARRERA:', 'C2:C2', datos.carrera);
    c.infoField('B3:B3', 'ASIGNATURA:', 'C3:C3', datos.asignatura);
    c.infoField('B4:B4', 'SIGLA:', 'C4:C4', datos.codigo_asignatura);
    c.infoField('F2:G2', 'DOCENTE:', 'H2:I2', datos.docente);
    c.infoField(
      'F3:G3',
      'CURSO:',
      'H3:I3',
      `${datos.curso ?? ''}   PARALELO: ${datos.paralelo ?? ''}`
    );
    c.infoField(
      'F4:G4',
      'GESTIÓN:',
      'H4:I4',
      `${datos.gestion ?? ''}   BIMESTRE: ${bimestreLabel}`
    );

    // Cabecera de tabla (filas 7–8)
    const r7 = 5;
    const r8 = 6;
    ['Nº', 'NOMBRES', 'Sexo', 'C.I.'].forEach((h, i) => {
      c.ws.mergeCells(r7, COL.nro + i, r8, COL.nro + i);
      c.cell(r7, COL.nro + i, h, {
        bold: true,
        size: small,
        wrap: true,
        fill: EXCEL_COLOR.infoLabel
      });
    });
    c.merge(`${L(COL.teoria)}${r7}:${L(COL.nota)}${r7}`, 'PARCIAL', {
      bold: true,
      size: small,
      fill: EXCEL_COLOR.infoLabel
    });
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
    c.ws.getRow(r7).height = 26;
    c.ws.getRow(r8).height = 34;

    estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.ws.getRow(row).height = 22;
      c.cell(row, COL.nro, est.nro ?? idx + 1, { fill: zebra });
      c.cell(row, COL.nombre, String(est.nombre ?? '').toUpperCase(), {
        align: 'left',
        fill: zebra
      });
      c.cell(row, COL.sexo, est.sexo ?? '', { fill: zebra });
      c.cell(row, COL.ci, est.ci ?? '', { fill: zebra });

      if (!hayEvaluaciones) {
        // Sin CONSOLIDADO que referenciar: no hay nada que resumir.
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
      c.formula(row, COL.nota, `${L(COL.teoria)}${row}+${L(COL.practica)}${row}`, {
        bold: true,
        fill: EXCEL_COLOR.finalCell
      });
      c.formula(
        row,
        COL.obs,
        `IF(${L(COL.nota)}${row}>=${notaAprobacion},"APROBADO/A",IF(${L(COL.nota)}${row}=0,"NO SE PRESENTO","REPROBADO/A"))`,
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
      hayCalificaciones,
      footerRow
    });
    c.freeze(r8, COL.ci);
  }

  /** Grilla de estadísticas: inscritos por sexo + reprobados/aprobados/promedio. */
  static _estadisticas(
    c,
    { firstDataRow, lastDataRow, hayEstudiantes, hayCalificaciones, footerRow }
  ) {
    const { small } = EXCEL_FONT_SIZE;
    const titleRow = footerRow + 2;
    const headRow = titleRow + 1;
    const rango = (col) => `${L(col)}${firstDataRow}:${L(col)}${lastDataRow}`;
    const obsRange = rango(COL.obs);

    // Slots contiguos para que la grilla no quede separada: Concepto | F | M | Total.
    const CONCEPTO = [3, 4];
    const SLOT_F = [5, 5];
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

    const sexoRange = rango(COL.sexo);
    const notaRange = rango(COL.nota);
    const filas = [
      { label: 'Inscritos', tipo: 'inscritos' },
      { label: 'Reprobados', tipo: 'conteo', criterio: 'REPROBADO/A' },
      { label: 'Aprobados', tipo: 'conteo', criterio: 'APROBADO/A' },
      { label: 'Promedio (aprobados)', tipo: 'promedio' }
    ];
    const calcular = hayEstudiantes && hayCalificaciones;

    filas.forEach((fila, i) => {
      const row = headRow + 1 + i;
      slot(CONCEPTO, row, fila.label, { bold: true, align: 'left' });

      if (fila.tipo === 'inscritos') {
        // Conteo por sexo: válido aunque no haya evaluaciones.
        slot(SLOT_F, row, hayEstudiantes ? `COUNTIF(${sexoRange},"F")` : '', {}, hayEstudiantes);
        slot(SLOT_M, row, hayEstudiantes ? `COUNTIF(${sexoRange},"M")` : '', {}, hayEstudiantes);
        slot(
          SLOT_TOTAL,
          row,
          hayEstudiantes ? `${L(SLOT_F[0])}${row}+${L(SLOT_M[0])}${row}` : 0,
          { bold: true },
          hayEstudiantes
        );
        return;
      }

      if (!calcular) {
        slot(SLOT_F, row, '');
        slot(SLOT_M, row, '');
        slot(SLOT_TOTAL, row, '', { bold: true });
        return;
      }

      if (fila.tipo === 'conteo') {
        // Acumulado por sexo (COUNTIFS sexo + observación) y total general.
        slot(SLOT_F, row, `COUNTIFS(${sexoRange},"F",${obsRange},"${fila.criterio}")`, {}, true);
        slot(SLOT_M, row, `COUNTIFS(${sexoRange},"M",${obsRange},"${fila.criterio}")`, {}, true);
        slot(SLOT_TOTAL, row, `COUNTIF(${obsRange},"${fila.criterio}")`, { bold: true }, true);
        return;
      }

      // Promedio de aprobados, redondeado; "—" si no hay aprobados (evita #DIV/0!).
      const promedio = (cond) =>
        `IFERROR(ROUND(AVERAGEIFS(${notaRange},${sexoRange},"${cond}",${obsRange},"APROBADO/A"),0),"—")`;
      slot(SLOT_F, row, promedio('F'), {}, true);
      slot(SLOT_M, row, promedio('M'), {}, true);
      slot(
        SLOT_TOTAL,
        row,
        `IFERROR(ROUND(AVERAGEIF(${obsRange},"APROBADO/A",${notaRange}),0),"—")`,
        { bold: true },
        true
      );
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
