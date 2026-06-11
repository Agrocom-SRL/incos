/**
 * ConsolidadoSheetBuilder — construye la hoja CONSOLIDADO del Registro Pedagógico:
 * detalle de evaluaciones prácticas / teóricas, promedios por componente, nota
 * final, observaciones y estadísticas por curso.
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme). La ponderación
 * (cuotas práctica/teórica y nota de aprobación) llega como parámetro desde la
 * configuración institucional; no hay literales de negocio embebidos.
 *
 * Fórmulas en INGLÉS (IF/COUNTIF/SUM): el formato .xlsx almacena las funciones en
 * inglés y Excel/LibreOffice las traduce al idioma del usuario. Escribirlas en
 * español produce #NOMBRE?/#NAME?.
 *
 * Ponderación: el promedio de cada componente es la SUMA de sus notas (las notas
 * de cada evaluación suman como máximo la cuota del componente, p.ej. 70 práctica
 * + 30 teórica = 100). No se multiplica por 0.7/0.3.
 *
 * Caso vacío (sin evaluaciones registradas): no se emite ninguna fórmula ni
 * cálculo — las celdas de promedio/nota/observación/estadística quedan en blanco.
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { L, MARCA_ANULADA } from './registroPedagogicoColumnMap.js';

export class ConsolidadoSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos
   * @param {Array} params.practicas
   * @param {Array} params.teoricas
   * @param {Array} params.estudiantes
   * @param {Object} params.cols
   * @param {{ cuotaPractico:number, cuotaTeorico:number, notaAprobacion:number }} params.ponderacion
   */
  static build({ composer: c, datos, practicas, teoricas, estudiantes, cols, ponderacion }) {
    const { cuotaPractico, cuotaTeorico, notaAprobacion } = ponderacion;
    const { lastCol } = cols;
    const bimestreLabel = String(datos.bimestre ?? '').toUpperCase();
    const firstDataRow = 8;
    const hayEstudiantes = estudiantes.length > 0;
    const hayEvaluaciones = practicas.length + teoricas.length > 0;
    const lastDataRow = firstDataRow + Math.max(estudiantes.length - 1, 0);
    const { small } = EXCEL_FONT_SIZE;

    // Anchos. Columnas de evaluación más anchas (21 = base 14 +50%) y CALIFICACIÓN
    // FINAL ampliada para que el rótulo y la nota respiren.
    c.colWidths({ 1: 3, [cols.colNro]: 9, [cols.colNombre]: 56 });
    for (let col = cols.colPractStart; col <= cols.colNoEval; col += 1) {
      let width = 21;
      if (col === cols.colPromPract || col === cols.colPromTeo) width = 20;
      else if (col === cols.colFinal) width = 26;
      else if (col === cols.colObs) width = 24;
      else if (col >= cols.colNoPract) width = 20;
      c.colWidths({ [col]: width });
    }

    // Banda de título
    c.bandTitle(`B1:${L(lastCol)}1`, `REGISTRO PEDAGÓGICO · ${bimestreLabel} BIMESTRE`);

    // Cabecera institucional — bloque izquierdo (carrera/asignatura/código) y
    // bloque derecho sobre las columnas de observación (docente/curso/gestión).
    const izqValEnd = L(cols.colFinal);
    c.infoField('B2:C2', 'CARRERA:', `D2:${izqValEnd}2`, datos.carrera);
    c.infoField('B3:C3', 'ASIGNATURA:', `D3:${izqValEnd}3`, datos.asignatura);
    c.infoField('B4:C4', 'SIGLA:', `D4:${izqValEnd}4`, datos.codigo_asignatura);

    const derLabel = L(cols.colObs);
    const derValIni = L(cols.colNoPract);
    const derValEnd = L(cols.colNoEval);
    c.infoField(
      `${derLabel}2:${derLabel}2`,
      'DOCENTE:',
      `${derValIni}2:${derValEnd}2`,
      datos.docente
    );
    c.infoField(
      `${derLabel}3:${derLabel}3`,
      'CURSO:',
      `${derValIni}3:${derValEnd}3`,
      `${datos.curso ?? ''}   PARALELO: ${datos.paralelo ?? ''}`
    );
    c.infoField(
      `${derLabel}4:${derLabel}4`,
      'GESTIÓN:',
      `${derValIni}4:${derValEnd}4`,
      `${datos.gestion ?? ''}   BIMESTRE: ${bimestreLabel}`
    );

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

    // Cabecera de sección. Con evaluaciones: el título abarca columnas de
    // evaluación + promedio (fila 5) y los nombres van en la fila 6. Sin
    // evaluaciones: el título ocupa la columna de promedio en las filas 5–6
    // unidas (evita el conflicto de D/E vacías). No se rotula "PROM." en fila 6.
    const seccion = ({ numEvals, startCol, promCol, titulo, cuota, fillTitulo, fillProm }) => {
      if (numEvals > 0) {
        c.merge(`${L(startCol)}${rowSec}:${L(promCol)}${rowSec}`, titulo, {
          bold: true,
          size: small,
          fill: fillTitulo,
          wrap: true,
          borderMedium: true
        });
        c.cell(rowNames, promCol, '', { fill: fillProm });
      } else {
        c.ws.mergeCells(rowSec, promCol, rowNames, promCol);
        c.cell(rowSec, promCol, titulo, {
          bold: true,
          size: small,
          fill: fillTitulo,
          wrap: true,
          borderMedium: true
        });
      }
      c.cell(rowMax, promCol, cuota, { bold: true, size: small, fill: fillProm });
    };
    seccion({
      numEvals: practicas.length,
      startCol: cols.colPractStart,
      promCol: cols.colPromPract,
      titulo: `EVALUACIONES PRÁCTICAS (${cuotaPractico})`,
      cuota: `${cuotaPractico}%`,
      fillTitulo: EXCEL_COLOR.practicasStrong,
      fillProm: EXCEL_COLOR.practicas
    });
    seccion({
      numEvals: teoricas.length,
      startCol: cols.colTeoStart,
      promCol: cols.colPromTeo,
      titulo: `EVALUACIONES TEÓRICAS (${cuotaTeorico})`,
      cuota: `${cuotaTeorico}%`,
      fillTitulo: EXCEL_COLOR.teoricasStrong,
      fillProm: EXCEL_COLOR.teoricas
    });

    // Nombres de evaluación (fila 6, recortados si son muy largos para no deformar
    // el documento) y puntajes máximos (fila 7) con sufijo "pts".
    const truncar = (texto, max = 46) => {
      const t = String(texto ?? '');
      return t.length > max ? `${t.slice(0, max - 1)}…` : t;
    };
    const columnaEval = (evals, startCol, fill) => {
      evals.forEach((ev, i) => {
        c.cell(rowNames, startCol + i, truncar(ev.nombre), {
          bold: true,
          size: small,
          fill,
          wrap: true
        });
        c.cell(rowMax, startCol + i, `${ev.puntaje_maximo ?? 0} pts`, { size: small, fill });
      });
    };
    columnaEval(practicas, cols.colPractStart, EXCEL_COLOR.practicas);
    columnaEval(teoricas, cols.colTeoStart, EXCEL_COLOR.teoricas);

    c.ws.getRow(rowSec).height = 30;
    c.ws.getRow(rowNames).height = 50;
    c.ws.getRow(rowMax).height = 22;

    // Filas de estudiantes
    estudiantes.forEach((est, idx) => {
      const row = firstDataRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      c.ws.getRow(row).height = 22;

      c.cell(row, cols.colNro, est.nro ?? idx + 1, { fill: zebra });
      c.cell(row, cols.colNombre, String(est.nombre ?? '').toUpperCase(), {
        fill: zebra,
        align: 'left'
      });

      // Notas administrativas (habilitación) por componente: si existen, las
      // actividades de ese componente quedan anuladas (marca «—») y su promedio
      // pasa a regirse por la habilitación. null = el docente calcula normal.
      const habPract = est.habilitacion_practico;
      const habTeo = est.habilitacion_teorico;

      (est.notas_practicas ?? []).forEach((nota, i) => {
        c.cell(row, cols.colPractStart + i, habPract != null ? MARCA_ANULADA : (nota ?? 0), {
          fill: zebra
        });
      });
      (est.notas_teoricas ?? []).forEach((nota, i) => {
        c.cell(row, cols.colTeoStart + i, habTeo != null ? MARCA_ANULADA : (nota ?? 0), {
          fill: zebra
        });
      });

      if (!hayEvaluaciones) {
        // Sin evaluaciones registradas: no se calcula nada (celdas en blanco).
        const fillVacio = (col) => {
          if (col === cols.colFinal) return EXCEL_COLOR.finalCell;
          if (col === cols.colObs) return EXCEL_COLOR.obsCell;
          return zebra;
        };
        [
          cols.colPromPract,
          cols.colPromTeo,
          cols.colFinal,
          cols.colObs,
          cols.colNoPract,
          cols.colNoTeo,
          cols.colNoEval
        ].forEach((col) => c.cell(row, col, '', { fill: fillVacio(col) }));
        return;
      }

      // Promedio = SUMA de las notas del componente (sin multiplicar). Si hay nota
      // administrativa, el promedio es la habilitación (literal) y las actividades
      // anuladas no se cuentan como "no presentadas". Literal 0 si el componente no
      // tiene evaluaciones ni habilitación.
      const pintarComponente = ({ hab, numEvals, promCol, noCol, rangeFn, fillProm }) => {
        if (hab != null) {
          c.cell(row, promCol, hab, { bold: true, fill: fillProm });
          c.cell(row, noCol, 0, { fill: zebra });
        } else if (numEvals > 0) {
          c.formula(row, promCol, `SUM(${rangeFn(row)})`, { bold: true, fill: fillProm });
          c.formula(row, noCol, `COUNTIF(${rangeFn(row)},0)`, { fill: zebra });
        } else {
          c.cell(row, promCol, 0, { bold: true, fill: fillProm });
          c.cell(row, noCol, 0, { fill: zebra });
        }
      };
      pintarComponente({
        hab: habPract,
        numEvals: practicas.length,
        promCol: cols.colPromPract,
        noCol: cols.colNoPract,
        rangeFn: cols.practRange,
        fillProm: EXCEL_COLOR.practicas
      });
      pintarComponente({
        hab: habTeo,
        numEvals: teoricas.length,
        promCol: cols.colPromTeo,
        noCol: cols.colNoTeo,
        rangeFn: cols.teoRange,
        fillProm: EXCEL_COLOR.teoricas
      });

      c.formula(row, cols.colFinal, `${L(cols.colPromPract)}${row}+${L(cols.colPromTeo)}${row}`, {
        fill: EXCEL_COLOR.finalCell,
        bold: true
      });
      c.formula(
        row,
        cols.colObs,
        `IF(${L(cols.colFinal)}${row}>=${notaAprobacion},"APROBADO/A",IF(${L(cols.colFinal)}${row}=0,"NO SE PRESENTO","REPROBADO/A"))`,
        { fill: EXCEL_COLOR.obsCell, wrap: true }
      );
      c.formula(row, cols.colNoEval, `${L(cols.colNoPract)}${row}+${L(cols.colNoTeo)}${row}`, {
        fill: zebra
      });
    });

    this._estadisticas(c, cols, { firstDataRow, lastDataRow, hayEstudiantes, hayEvaluaciones });
    c.freeze(rowMax, cols.colNombre);
  }

  /** Mini-tabla de estadísticas (Aprobados / Reprobados / No se presentó / Total). */
  static _estadisticas(c, cols, { firstDataRow, lastDataRow, hayEstudiantes, hayEvaluaciones }) {
    const { small } = EXCEL_FONT_SIZE;
    const titleRow = lastDataRow + 2;
    const headRow = titleRow + 1;
    const valRow = headRow + 1;
    const c0 = cols.colNombre;
    const obsCol = L(cols.colObs);
    const obsRange = `${obsCol}${firstDataRow}:${obsCol}${lastDataRow}`;
    const calcular = hayEstudiantes && hayEvaluaciones;

    c.cell(titleRow, c0, 'ESTADÍSTICAS', { bold: true, align: 'left', border: false });

    const columnas = [
      ['Aprobados', 'APROBADO/A'],
      ['Reprobados', 'REPROBADO/A'],
      ['No se presentó', 'NO SE PRESENTO'],
      ['Total', null]
    ];
    columnas.forEach(([titulo, criterio], i) => {
      const col = c0 + i;
      c.cell(headRow, col, titulo, {
        bold: true,
        size: small,
        wrap: true,
        fill: EXCEL_COLOR.statHeader,
        fontColor: EXCEL_COLOR.statHeaderText
      });
      if (!calcular) {
        c.cell(valRow, col, '', {});
      } else if (criterio) {
        c.formula(valRow, col, `COUNTIF(${obsRange},"${criterio}")`, { bold: true });
      } else {
        c.formula(valRow, col, `${L(c0)}${valRow}+${L(c0 + 1)}${valRow}+${L(c0 + 2)}${valRow}`, {
          bold: true
        });
      }
    });
  }
}

export default ConsolidadoSheetBuilder;
