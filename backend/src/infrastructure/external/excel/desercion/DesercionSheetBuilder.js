/**
 * DesercionSheetBuilder — construye la ÚNICA hoja del reporte de Deserción
 * estudiantil (grano ANUAL): cabecera institucional + RESUMEN por carrera ×
 * gestión (con denominadores y % de deserción) + DETALLE de desertores (una
 * fila por matrícula de materia en ABANDONO/RETIRADO).
 *
 * Solo construcción + estilos (vía ExcelSheetComposer + ExcelTheme, cabecera
 * VERDE primario #196B45). Sin lógica de negocio: los agregados llegan
 * calculados desde GetDesercionUseCase (paridad pantalla ↔ Excel).
 */

import { EXCEL_COLOR, EXCEL_FONT_SIZE } from '../shared/index.js';
import { colLetter as L } from '../shared/ExcelSheetComposer.js';

const fmtPct = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

export class DesercionSheetBuilder {
  /**
   * @param {Object} params
   * @param {import('../shared/ExcelSheetComposer.js').ExcelSheetComposer} params.composer
   * @param {Object} params.datos - Ver IDesercionExcelGenerator.
   */
  static build({ composer: c, datos }) {
    const { small, body, label } = EXCEL_FONT_SIZE;
    const carreras = Array.isArray(datos.carreras) ? datos.carreras : [];
    const desertores = Array.isArray(datos.desertores) ? datos.desertores : [];
    const resumen = datos.resumen ?? {};

    // 8 columnas de datos (col 1 = margen). Ambas tablas comparten el ancho.
    const cols = [2, 3, 4, 5, 6, 7, 8, 9];
    const lastCol = cols[cols.length - 1];
    c.colWidths({ 1: 4, 2: 14, 3: 40, 4: 15, 5: 42, 6: 15, 7: 15, 8: 15, 9: 16 });

    // ---- Título + cabecera institucional (planilla verde) ----
    c.bandTitle(`B1:${L(lastCol)}1`, 'DESERCIÓN ESTUDIANTIL (CONSOLIDADO ANUAL)');
    c.merge(`B2:${L(lastCol)}2`, 'INSTITUTO TÉCNICO INCOS SANTA CRUZ', {
      bold: true,
      size: body,
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });
    c.infoField('B3:B3', 'GESTIÓN:', 'C3:E3', datos.gestionFiltro ?? 'TODAS');
    c.infoField('F3:G3', 'FECHA EMISIÓN:', `H3:${L(lastCol)}3`, datos.fechaEmision ?? '');
    c.merge(`B4:${L(lastCol)}4`, 'Estados consolidados ABANDONO / RETIRADO de la matrícula por materia.', {
      size: small,
      align: 'left',
      fontColor: EXCEL_COLOR.inkSoft,
      border: false,
    });

    const headStyle = {
      bold: true,
      size: small,
      wrap: true,
      fill: EXCEL_COLOR.statHeader,
      fontColor: EXCEL_COLOR.statHeaderText,
      borderMedium: true,
    };

    // ---- Sección 1: resumen por carrera × gestión ----
    let row = 6;
    c.merge(`B${row}:${L(lastCol)}${row}`, 'RESUMEN POR CARRERA Y GESTIÓN', {
      bold: true,
      size: label,
      align: 'left',
      fill: EXCEL_COLOR.infoLabel,
      borderMedium: true,
    });
    row += 1;
    const headResumen = ['GESTIÓN', 'CARRERA', 'ESTUDIANTES', 'DESERTORES', '% DESERCIÓN', 'MAT. ABANDONO', 'MAT. RETIRO', 'MAT. TOTALES'];
    headResumen.forEach((texto, i) => c.cell(row, cols[i], texto, headStyle));
    c.rowHeight(row, 30);
    row += 1;

    if (carreras.length === 0) {
      c.merge(`B${row}:${L(lastCol)}${row}`, 'Sin datos de deserción para el filtro elegido.', {
        size: small,
        align: 'center',
        fontColor: EXCEL_COLOR.inkSoft,
      });
      row += 1;
    } else {
      carreras.forEach((fila, idx) => {
        const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
        const valores = [
          fila.gestionAnio ?? fila.gestionNombre ?? '—',
          fila.carreraNombre ?? '—',
          fila.totalEstudiantes ?? 0,
          fila.estudiantesDesercion ?? 0,
          fmtPct(fila.pctEstudiantesDesercion),
          fila.matriculasAbandono ?? 0,
          fila.matriculasRetiro ?? 0,
          fila.totalMatriculasMateria ?? 0,
        ];
        valores.forEach((valor, i) =>
          c.cell(row, cols[i], valor, {
            fill: zebra,
            size: small,
            align: i === 1 ? 'left' : 'center',
            wrap: i === 1,
          }),
        );
        row += 1;
      });

      // Fila TOTAL global.
      c.merge(`B${row}:C${row}`, 'TOTAL', {
        bold: true,
        size: small,
        align: 'right',
        fill: EXCEL_COLOR.finalCell,
      });
      const totales = [
        resumen.totalEstudiantes ?? 0,
        resumen.estudiantesDesercion ?? 0,
        fmtPct(resumen.pctEstudiantesDesercion),
        resumen.matriculasAbandono ?? 0,
        resumen.matriculasRetiro ?? 0,
        resumen.totalMatriculasMateria ?? 0,
      ];
      totales.forEach((valor, i) =>
        c.cell(row, cols[i + 2], valor, {
          bold: true,
          size: small,
          fill: EXCEL_COLOR.finalCell,
        }),
      );
      row += 1;
    }

    // ---- Sección 2: detalle de desertores ----
    row += 1;
    c.merge(`B${row}:${L(lastCol)}${row}`, 'DETALLE DE DESERTORES (UNA FILA POR MATERIA)', {
      bold: true,
      size: label,
      align: 'left',
      fill: EXCEL_COLOR.infoLabel,
      borderMedium: true,
    });
    row += 1;
    const headDetalle = ['GESTIÓN', 'NÓMINA DEL ESTUDIANTE', 'CÓDIGO', 'CARRERA', 'ASIGNATURA', 'CURSO', 'ESTADO', ''];
    headDetalle.forEach((texto, i) => c.cell(row, cols[i], texto, headStyle));
    c.rowHeight(row, 30);
    row += 1;

    if (desertores.length === 0) {
      c.merge(`B${row}:${L(lastCol)}${row}`, 'Sin desertores registrados para el filtro elegido.', {
        size: small,
        align: 'center',
        fontColor: EXCEL_COLOR.inkSoft,
      });
    } else {
      desertores.forEach((fila, idx) => {
        const zebra = idx % 2 === 1 ? EXCEL_COLOR.zebra : EXCEL_COLOR.white;
        c.cell(row, cols[0], fila.gestionAnio ?? '—', { fill: zebra, size: small });
        c.cell(row, cols[1], String(fila.nombreCompleto ?? '').toUpperCase(), {
          fill: zebra,
          size: small,
          align: 'left',
        });
        c.cell(row, cols[2], fila.codigo ?? '', { fill: zebra, size: small });
        c.cell(row, cols[3], fila.carreraNombre ?? '', {
          fill: zebra,
          size: small,
          align: 'left',
          wrap: true,
        });
        c.cell(row, cols[4], `${fila.asignaturaSigla ?? ''} ${fila.asignaturaNombre ?? ''}`.trim(), {
          fill: zebra,
          size: small,
          align: 'left',
          wrap: true,
        });
        c.cell(row, cols[5], fila.periodoNombre ?? fila.periodoNumero ?? '—', {
          fill: zebra,
          size: small,
        });
        c.cell(row, cols[6], fila.estado ?? '', {
          fill: zebra,
          size: small,
          bold: true,
          fontColor: EXCEL_COLOR.inkSoft,
        });
        c.cell(row, cols[7], '', { fill: zebra });
        row += 1;
      });
    }
  }
}

export default DesercionSheetBuilder;
