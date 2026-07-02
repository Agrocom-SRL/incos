/**
 * HistorialAcademicoExcelBuilder — generador .xlsx del Historial académico
 * (kardex / transcript FORM-SIE-ITT-04) de un estudiante. Implementa
 * IHistorialAcademicoExcelGenerator y se registra en el container DI; el use
 * case nunca lo importa de forma concreta.
 *
 * Reutiliza el kit de planilla académica (ExcelSheetComposer + ExcelTheme): la
 * cabecera institucional va en la banda verde primario (#196B45) por la regla de
 * planillas de INCOS. Solo construcción + estilos; sin lógica de negocio (nota
 * efectiva, resumen y numeración llegan ya resueltos desde la capa de aplicación).
 *
 * Estructura: banda de título + subtítulo, bloque de datos del estudiante,
 * cabecera de tabla (una fila), filas del transcript (zebra) y pie de resumen.
 */

import ExcelJS from 'exceljs';
import { IHistorialAcademicoExcelGenerator } from '../../../../domain/interfaces/services/IHistorialAcademicoExcelGenerator.js';
import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { ExcelSheetComposer, colLetter as L } from '../shared/ExcelSheetComposer.js';

const LAST_COL = 14; // columna final del ancho útil (col 1 = margen).

/** Columnas de la tabla del transcript (1-based; la asignatura ocupa 3 cols). */
const COL = {
  nro: 2,
  gestion: 3,
  carga: 4,
  periodo: 5,
  sigla: 6,
  asignaturaStart: 7,
  asignaturaEnd: 9,
  prereq: 10,
  nota: 11,
  recup: 12,
  estado: 13,
  origen: 14,
};

/** Estados aprobatorios (verde); reprobatorios/baja (rojo); resto neutro. */
const ESTADO_COLOR = {
  APROBADO: EXCEL_COLOR.finalHeader,
  CONVALIDADO: EXCEL_COLOR.finalHeader,
  REPROBADO: EXCEL_COLOR.danger,
  ABANDONO: EXCEL_COLOR.danger,
  RETIRADO: EXCEL_COLOR.danger,
};

const fmtNota = (n) => (n == null || Number.isNaN(Number(n)) ? '—' : String(n));

export class HistorialAcademicoExcelBuilder extends IHistorialAcademicoExcelGenerator {
  /**
   * @param {Object} payload - { estudiante, filas, resumen } (contrato de la API).
   * @returns {Promise<Buffer>}
   */
  async generarHistorialAcademico({ estudiante, filas, resumen } = {}) {
    const est = estudiante ?? {};
    const rows = Array.isArray(filas) ? filas : [];
    const res = resumen ?? {};

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INCOS Santa Cruz';
    workbook.created = new Date();

    const c = new ExcelSheetComposer(workbook.addWorksheet('Historial académico'));

    this._anchos(c);
    let row = this._titulo(c);
    row = this._datosEstudiante(c, est, row);
    row = this._cabeceraTabla(c, row);
    row = this._filas(c, rows, row);
    this._resumen(c, est, res, row);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  _anchos(c) {
    c.colWidths({
      1: 3,
      [COL.nro]: 5,
      [COL.gestion]: 10,
      [COL.carga]: 8,
      [COL.periodo]: 12,
      [COL.sigla]: 12,
      [COL.asignaturaStart]: 22,
      8: 14,
      [COL.asignaturaEnd]: 14,
      [COL.prereq]: 12,
      [COL.nota]: 10,
      [COL.recup]: 12,
      [COL.estado]: 14,
      [COL.origen]: 12,
    });
  }

  /** Banda de título institucional (verde primario) + subtítulo. */
  _titulo(c) {
    c.bandTitle(`B1:${L(LAST_COL)}1`, 'HISTORIAL ACADÉMICO DEL ESTUDIANTE');
    c.merge(`B2:${L(LAST_COL)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ  ·  FORM-SIE-ITT-04', {
      size: EXCEL_FONT_SIZE.subtitle,
      bold: true,
      fontColor: EXCEL_COLOR.bandText,
      fill: EXCEL_COLOR.subtitleBand,
      borderMedium: true,
    });
    c.rowHeight(1, 30);
    c.rowHeight(2, 24);
    return 4; // primera fila del bloque de datos.
  }

  /** Bloque de datos del estudiante (pares etiqueta/valor). */
  _datosEstudiante(c, est, startRow) {
    const half = Math.floor(LAST_COL / 2); // columna donde arranca el 2.º par.
    const valEnd = L(half - 1);
    const val2End = L(LAST_COL);
    let r = startRow;

    const fila = (label1, value1, label2, value2) => {
      c.infoField(`B${r}:C${r}`, label1, `D${r}:${valEnd}${r}`, value1);
      if (label2 != null) {
        c.infoField(
          `${L(half)}${r}:${L(half + 1)}${r}`,
          label2,
          `${L(half + 2)}${r}:${val2End}${r}`,
          value2,
        );
      }
      r += 1;
    };

    fila('ESTUDIANTE:', est.nombreCompleto ?? '', 'MATRÍCULA:', est.matricula ?? '');
    fila(
      'C.I.:',
      [est.ci, est.expedicion].filter(Boolean).join(' '),
      'FECHA NAC.:',
      est.fechaNacimiento ?? '',
    );
    fila(
      'CARRERA:',
      [est.carreraNombre, est.carreraCodigo ? `(${est.carreraCodigo})` : '']
        .filter(Boolean)
        .join(' '),
      'NIVEL:',
      est.nivelFormacion ?? '',
    );
    fila('TÍTULO:', est.tituloOtorgado ?? '', 'RÉGIMEN:', est.regimen ?? '');
    fila(
      'ADMISIÓN:',
      est.fechaAdmision ?? '',
      'CONCLUSIÓN:',
      est.fechaConclusion ?? '—',
    );
    fila(
      'CARGA HORARIA PLAN:',
      est.cargaHorariaTotalPlan ?? '',
      'DURACIÓN (AÑOS):',
      est.duracionAnios ?? '',
    );

    return r + 1; // deja una fila en blanco antes de la tabla.
  }

  /** Cabecera de la tabla del transcript (una fila). */
  _cabeceraTabla(c, r) {
    const head = (col, text) =>
      c.cell(r, col, text, {
        bold: true,
        size: EXCEL_FONT_SIZE.small,
        wrap: true,
        fill: EXCEL_COLOR.statHeader,
        fontColor: EXCEL_COLOR.statHeaderText,
        borderMedium: true,
      });

    head(COL.nro, 'Nº');
    head(COL.gestion, 'GESTIÓN');
    head(COL.carga, 'CARGA HRS');
    head(COL.periodo, 'AÑO');
    head(COL.sigla, 'SIGLA');
    c.merge(`${L(COL.asignaturaStart)}${r}:${L(COL.asignaturaEnd)}${r}`, 'ASIGNATURA', {
      bold: true,
      size: EXCEL_FONT_SIZE.small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    });
    head(COL.prereq, 'PRE-REQ.');
    head(COL.nota, 'NOTA FINAL');
    head(COL.recup, 'PRUEBA RECUP.');
    head(COL.estado, 'ESTADO');
    head(COL.origen, 'ORIGEN');
    c.rowHeight(r, 30);
    return r + 1;
  }

  /** Filas del transcript (zebra) o una fila informativa si no hay. */
  _filas(c, rows, startRow) {
    if (rows.length === 0) {
      c.merge(
        `${L(COL.nro)}${startRow}:${L(LAST_COL)}${startRow}`,
        'El estudiante no tiene asignaturas registradas.',
        { size: EXCEL_FONT_SIZE.body, align: 'center', fontColor: EXCEL_COLOR.inkSoft },
      );
      return startRow + 1;
    }

    rows.forEach((f, idx) => {
      const r = startRow + idx;
      const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
      const { small } = EXCEL_FONT_SIZE;

      c.cell(r, COL.nro, f.nro ?? idx + 1, { fill: zebra, size: small });
      c.cell(r, COL.gestion, f.gestionAnio ?? '', { fill: zebra, size: small });
      c.cell(r, COL.carga, f.cargaHoraria ?? '', { fill: zebra, size: small });
      c.cell(r, COL.periodo, f.periodoNombre ?? '', { fill: zebra, size: small });
      c.cell(r, COL.sigla, f.asignaturaSigla ?? '', { fill: zebra, size: small, bold: true });
      c.merge(`${L(COL.asignaturaStart)}${r}:${L(COL.asignaturaEnd)}${r}`, f.asignaturaNombre ?? '', {
        fill: zebra,
        size: small,
        align: 'left',
        wrap: true,
      });
      c.cell(r, COL.prereq, f.prerrequisitoSigla ?? '—', {
        fill: zebra,
        size: small,
        fontColor: EXCEL_COLOR.inkSoft,
      });
      c.cell(r, COL.nota, fmtNota(f.notaFinal), { fill: zebra, size: small, bold: true });
      c.cell(r, COL.recup, fmtNota(f.notaRecuperacion), { fill: zebra, size: small });
      c.cell(r, COL.estado, f.estado ?? '', {
        fill: zebra,
        size: small,
        bold: true,
        fontColor: ESTADO_COLOR[f.estado] ?? EXCEL_COLOR.inkSoft,
      });
      c.cell(r, COL.origen, f.origen ?? '', {
        fill: zebra,
        size: small,
        fontColor: EXCEL_COLOR.inkSoft,
      });
    });

    return startRow + rows.length;
  }

  /** Pie de resumen: carga total, aprobadas/total, promedio general. */
  _resumen(c, est, res, startRow) {
    const r = startRow + 1; // fila en blanco antes del pie.

    c.merge(`${L(COL.nro)}${r}:${L(COL.periodo)}${r}`, 'RESUMEN', {
      bold: true,
      align: 'left',
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    });

    const label = (col, text, colEnd) =>
      c.merge(`${L(col)}${r}:${L(colEnd)}${r}`, text, {
        bold: true,
        size: EXCEL_FONT_SIZE.small,
        align: 'right',
        fill: EXCEL_COLOR.infoLabel,
      });
    const value = (col, text) =>
      c.cell(r, col, text, {
        bold: true,
        size: EXCEL_FONT_SIZE.small,
        fill: EXCEL_COLOR.finalCell,
      });

    // Carga horaria acumulada / aprobadas / total / promedio.
    label(COL.sigla, 'CARGA HORARIA:', COL.asignaturaStart);
    value(8, res.totalCargaHoraria ?? 0);
    label(COL.asignaturaEnd, 'APROBADAS/TOTAL:', COL.prereq);
    value(COL.nota, `${res.asignaturasAprobadas ?? 0}/${res.asignaturasTotal ?? 0}`);
    label(COL.recup, 'PROMEDIO GENERAL:', COL.estado);
    value(COL.origen, res.promedioGeneral ?? '—');
    c.rowHeight(r, 22);
    return r + 1;
  }
}

export default HistorialAcademicoExcelBuilder;
