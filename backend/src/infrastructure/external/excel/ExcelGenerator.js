/**
 * ExcelGenerator - Generador de reportes Excel para el Instituto INCOS
 *
 * Responsabilidad: Orquestar la generación del Excel usando las clases especializadas
 * Principio: Single Responsibility Principle (SRP) - Solo orquesta, no implementa
 *
 * Uso:
 * const buffer = await ExcelGenerator.generarReporteInscritos(datos, filtros, { soloInscripcion: true });
 */

import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ExcelStructureBuilder } from './ExcelStructureBuilder.js';
import { ExcelDataProcessor } from './ExcelDataProcessor.js';
import { ExcelContentBuilder } from './ExcelContentBuilder.js';
import { IncosPDFBase } from '../pdf/IncosPDFBase.js';

/** Columna L = fin del bloque INSCRIPCIÓN; M–AS = abandonos, reprobados, aprobados, totales género (índice 1-based Excel). */
const COL_FIN_INSCRIPCION = 12;
const COL_FIN_TABLA_COMPLETA = 45;

class ExcelGenerator {
  /**
   * Oculta columnas M:AS. El libro sigue generando toda la matriz y fórmulas (fase 2 sin tocar código).
   * @param {import('exceljs').Worksheet} worksheet
   */
  static ocultarColumnasPostInscripcion(worksheet) {
    for (let col = COL_FIN_INSCRIPCION + 1; col <= COL_FIN_TABLA_COMPLETA; col++) {
      worksheet.getColumn(col).hidden = true;
    }
  }

  /**
   * Genera el reporte Excel de inscritos con estadísticas
   * @param {Array} datos - Array de objetos con los datos de inscripciones
   * @param {Object} filtros - { gestion_nombre, gestion_anio }
   * @param {{ soloInscripcion?: boolean }} [opciones] - true: solo visible B:L (inscripción); resto oculto
   * @returns {Promise<Buffer>} Buffer del Excel
   */
  static async generarReporteInscritos(datos = [], filtros = {}, opciones = {}) {
    const soloInscripcion = opciones.soloInscripcion === true;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estadísticas Inscritos');

    ExcelStructureBuilder.configurarColumnas(worksheet);
    ExcelStructureBuilder.agregarTitulo(worksheet, filtros.gestion_anio || '', { soloInscripcion });
    ExcelStructureBuilder.construirEncabezados(worksheet);

    if (datos && datos.length > 0) {
      const datosAgrupados = ExcelDataProcessor.construirMatrizReporte(datos);
      ExcelContentBuilder.poblarDatos(worksheet, datosAgrupados);
    } else {
      ExcelContentBuilder.agregarEstructuraVacia(worksheet);
    }

    if (soloInscripcion) {
      this.ocultarColumnasPostInscripcion(worksheet);
    }

    return workbook.xlsx.writeBuffer();
  }

  /**
   * Genera el reporte Excel de lista de inscritos por carrera, separando por paralelo (una hoja por paralelo).
   *
   * @param {Array<Record<string, unknown>>} datos - Filas de vista_reporte_excel_lista_inscritos
   * @param {Object} filtros - { gestion_nombre, gestion_anio, carrera_nombre, carrera_codigo }
   * @returns {Promise<Buffer>} Buffer del Excel
   */
  static async generarListaInscritosPorCarrera(datos = [], filtros = {}) {
    const workbook = new ExcelJS.Workbook();

    // Cargar logo (si existe) una vez por workbook
    const logoId = await this._tryAddMinisterioLogo(workbook);
    const incosLogoId = await this._tryAddIncosLogo(workbook);

    const grouped = new Map(); // sheetKey -> { sheetName, paraleloNombre, rows }
    (datos || []).forEach((row) => {
      const periodoNumero = Number(row.periodo_numero ?? row.periodoNumero ?? 0);
      const paraleloNombre = String(row.paralelo_nombre ?? row.paraleloNombre ?? 'SIN_PARALELO').trim();
      const paraleloLetra = this._extractParaleloLetra(paraleloNombre);
      const periodoEtiqueta = this._toPeriodoEtiqueta(periodoNumero);

      const rawSheetName = [periodoEtiqueta, paraleloLetra].filter(Boolean).join('-') || 'HOJA';
      const sheetName = this._toSafeWorksheetName(rawSheetName);
      const sheetKey = `${sheetName}`;

      const current = grouped.get(sheetKey) || { sheetName, paraleloNombre, rows: [] };
      current.rows.push(row);
      grouped.set(sheetKey, current);
    });

    const sheets = grouped.size
      ? Array.from(grouped.values())
      : [{ sheetName: 'SIN_DATOS', paraleloNombre: 'SIN_DATOS', rows: [] }];

    sheets.forEach((s) => {
      const ws = workbook.addWorksheet(s.sheetName);
      this._buildListaInscritosSheet(ws, s.rows, filtros, s.paraleloNombre, { logoId, incosLogoId });
    });

    return workbook.xlsx.writeBuffer();
  }

  /**
   * Lista de estado de aporte voluntario por carrera (vista_reporte_excel_lista_aportes_por_carrera).
   * Nombres alineados a la izquierda en datos (columnas B:C).
   */
  static async generarListaAportesPorCarrera(datos = [], filtros = {}) {
    const workbook = new ExcelJS.Workbook();
    const logoId = await this._tryAddMinisterioLogo(workbook);
    const incosLogoId = await this._tryAddIncosLogo(workbook);

    const grouped = new Map();
    (datos || []).forEach((row) => {
      const periodoNumero = Number(row.periodo_numero ?? row.periodoNumero ?? 0);
      const paraleloNombre = String(row.paralelo_nombre ?? row.paraleloNombre ?? 'SIN_PARALELO').trim();
      const paraleloLetra = this._extractParaleloLetra(paraleloNombre);
      const periodoEtiqueta = this._toPeriodoEtiqueta(periodoNumero);

      const rawSheetName = [periodoEtiqueta, paraleloLetra].filter(Boolean).join('-') || 'HOJA';
      const sheetName = this._toSafeWorksheetName(rawSheetName);
      const sheetKey = `${sheetName}`;

      const current = grouped.get(sheetKey) || { sheetName, paraleloNombre, rows: [] };
      current.rows.push(row);
      grouped.set(sheetKey, current);
    });

    const sheets = grouped.size
      ? Array.from(grouped.values())
      : [{ sheetName: 'SIN_DATOS', paraleloNombre: 'SIN_DATOS', rows: [] }];

    sheets.forEach((s) => {
      const ws = workbook.addWorksheet(s.sheetName);
      this._buildListaAportesPorCarreraSheet(ws, s.rows, filtros, s.paraleloNombre, {
        logoId,
        incosLogoId,
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  static _buildListaInscritosSheet(worksheet, rows, filtros, paraleloNombre, assets = {}) {
    const FONT_SIZE_LISTA = 14;
    const FONT_SIZE_TITULO = 18;
    const gestionAnio = filtros?.gestion_anio ? String(filtros.gestion_anio) : '';
    const carreraNombre = filtros?.carrera_nombre ? String(filtros.carrera_nombre) : '';
    const instituteName = IncosPDFBase?.INSTITUTE?.name || 'INSTITUTO TÉCNICO INCOS SANTA CRUZ';

    const sample = rows?.[0] || {};
    const turno = String(sample.paralelo_turno ?? sample.paraleloTurno ?? '');
    const periodoNombre = String(sample.periodo_nombre ?? sample.periodoNombre ?? '');
    const periodoNumero = Number(sample.periodo_numero ?? sample.periodoNumero ?? 0);
    const paraleloLetra = this._extractParaleloLetra(paraleloNombre);
    const periodoEtiqueta = this._toPeriodoEtiqueta(periodoNumero);

    // Anchos fijos (afectan también los "cuadros" del encabezado A2:F7)
    // 7 columnas (A:G) con tamaños fijos (B:C se combinan para nombres).
    // Importante: NO definir "header" aquí, porque ExcelJS lo escribe en la fila 1 automáticamente.
    worksheet.columns = [
      { key: 'nro', width: 8 }, // A
      { key: 'b', width: 16 }, // B (parte 1 de nombres)
      { key: 'c', width: 52 }, // C (parte 2 de nombres)
      { key: 'ci', width: 28 }, // D
      { key: 'sexo', width: 12 }, // E
      { key: 'celular', width: 28 }, // F
      { key: 'observaciones', width: 28 } // G
    ];

    // Logo en A1:B1 y título en la fila siguiente (A2:G2)
    worksheet.getRow(1).height = 58;
    worksheet.pageSetup = {
      ...worksheet.pageSetup,
      // Sin márgenes nativos (al imprimir)
      margins: { left: 0, right: 0, top: 0, bottom: 0, header: 0, footer: 0 }
    };
    worksheet.views = [{ showGridLines: false }];
    if (assets?.logoId != null) {
      worksheet.addImage(assets.logoId, {
        tl: { col: 0, row: 0 }, // A1
        br: { col: 2, row: 1 } // B1
      });
    }
    if (assets?.incosLogoId != null) {
      worksheet.addImage(assets.incosLogoId, {
        tl: { col: 6, row: 0 }, // G1
        br: { col: 7, row: 1 } // G1
      });
    }

    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = `LISTA DE ESTUDIANTES INSCRITOS ${gestionAnio}`.trim();
    worksheet.getCell('A2').font = { bold: true, size: FONT_SIZE_TITULO };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    worksheet.getRow(2).height = 32;

    // Encabezado institucional / filtros (labels en negrita, valores normales)
    worksheet.getCell('A3').value = 'INSTITUTO';
    worksheet.mergeCells('A3:B3');
    worksheet.mergeCells('C3:G3');
    worksheet.getCell('C3').value = instituteName;

    worksheet.getCell('A4').value = 'GESTIÓN:';
    worksheet.mergeCells('A4:B4');
    worksheet.mergeCells('C4:G4');
    worksheet.getCell('C4').value = gestionAnio;

    worksheet.getCell('A5').value = 'NIVEL:';
    worksheet.mergeCells('A5:B5');
    worksheet.mergeCells('C5:G5');
    worksheet.getCell('C5').value = 'TÉCNICO SUPERIOR';

    worksheet.getCell('A6').value = 'CARRERA:';
    worksheet.mergeCells('A6:B6');
    worksheet.mergeCells('C6:G6');
    worksheet.getCell('C6').value = carreraNombre;

    // Régimen fijo según formato solicitado
    worksheet.getCell('A7').value = 'RÉGIMEN:';
    worksheet.mergeCells('A7:B7');
    worksheet.mergeCells('C7:G7');
    worksheet.getCell('C7').value = 'ANUAL';

    // Curso = paralelo (nombre) y turno separado (como indicaste)
    worksheet.getCell('A8').value = 'CURSO:';
    worksheet.mergeCells('A8:B8');
    worksheet.getCell('C8').value = `${periodoNombre || periodoEtiqueta} - "${paraleloLetra || ''}"`.trim();
    worksheet.getCell('D8').value = 'TURNO:';
    worksheet.mergeCells('E8:G8');
    worksheet.getCell('E8').value = turno;

    ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'D8'].forEach((addr) => {
      worksheet.getCell(addr).font = { bold: true, size: FONT_SIZE_LISTA };
      // Evita que el label se parta en varias líneas por ser columna angosta
      worksheet.getCell(addr).alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    });
    ['C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'E8'].forEach((addr) => {
      worksheet.getCell(addr).font = { size: FONT_SIZE_LISTA };
    });
    [3, 4, 5, 6, 7, 8].forEach((r) => {
      worksheet.getRow(r).height = 24;
    });

    // Bordes del encabezado A3:G8
    for (let r = 3; r <= 8; r++) {
      for (let c = 1; c <= 7; c++) {
        const cell = worksheet.getCell(r, c);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }

    // La tabla comienza en la fila 9
    const headerRowIdx = 9;
    // Encabezado de la tabla (B:C combinadas para nombres)
    worksheet.getCell(`A${headerRowIdx}`).value = 'N°';
    worksheet.mergeCells(`B${headerRowIdx}:C${headerRowIdx}`);
    worksheet.getCell(`B${headerRowIdx}`).value = 'APELLIDO PATERNO, MATERNO Y NOMBRES';
    worksheet.getCell(`D${headerRowIdx}`).value = 'CÉDULA DE IDENTIDAD';
    worksheet.getCell(`E${headerRowIdx}`).value = 'SEXO';
    worksheet.getCell(`F${headerRowIdx}`).value = 'CELULAR';
    worksheet.getCell(`G${headerRowIdx}`).value = 'OBSERVACIONES';
    const headerRow = worksheet.getRow(headerRowIdx);
    headerRow.font = { bold: true, size: FONT_SIZE_LISTA };
    headerRow.height = 30;
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber > 7) return;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEAD0' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      const alignNombreHeader =
        colNumber === 2 || colNumber === 3
          ? { horizontal: 'left', vertical: 'middle', wrapText: true }
          : { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.alignment = alignNombreHeader;
    });

    const startDataRow = headerRowIdx + 1;
    (rows || []).forEach((r, idx) => {
      const nombre = String(r.nombre_completo ?? r.nombreCompleto ?? '').trim();
      const ci = String(r.ci ?? '').trim();
      const sexo = String(r.sexo ?? '').trim();
      const celular = String(r.celular ?? '').trim();
      const observaciones = String(r.observaciones ?? '').trim();

      const rowIdx = startDataRow + idx;
      worksheet.getCell(`A${rowIdx}`).value = idx + 1;
      worksheet.mergeCells(`B${rowIdx}:C${rowIdx}`);
      worksheet.getCell(`B${rowIdx}`).value = nombre;
      const alignNombre = { horizontal: 'left', vertical: 'middle', wrapText: true };
      worksheet.getCell(`B${rowIdx}`).alignment = alignNombre;
      worksheet.getCell(`C${rowIdx}`).alignment = alignNombre;
      worksheet.getCell(`D${rowIdx}`).value = ci;
      worksheet.getCell(`E${rowIdx}`).value = sexo;
      worksheet.getCell(`F${rowIdx}`).value = celular;
      worksheet.getCell(`G${rowIdx}`).value = observaciones;
    });

    for (let row = startDataRow; row < startDataRow + (rows?.length || 0); row++) {
      const r = worksheet.getRow(row);
      r.height = 24;
      r.font = { size: FONT_SIZE_LISTA };
      r.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber > 7) return;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (colNumber === 2 || colNumber === 3) {
          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }
      });
    }

    // Centrar celdas sin alineación explícita; B:C de la tabla (fila ≥ header) quedan a la izquierda.
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber > 7) return;
        const prev = cell.alignment || {};
        const esNombreTabla =
          (colNumber === 2 || colNumber === 3) && rowNumber >= headerRowIdx;
        cell.alignment = {
          ...prev,
          horizontal: esNombreTabla
            ? 'left'
            : prev.horizontal ?? 'center',
          vertical: prev.vertical ?? 'middle',
          wrapText: prev.wrapText ?? true
        };
      });
    });

    worksheet.views = [{ state: 'frozen', ySplit: headerRowIdx, showGridLines: false }];
  }

  /** @param {unknown} v */
  static _fmtMontoExcel(v) {
    if (v == null || v === '') return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return Number(n.toFixed(2));
  }

  /** Formato numérico para montos en Bs. (separador de miles según Excel regional). */
  static _NUM_FMT_MONTO = '#,##0.00';

  static _setMontoCell(cell, raw) {
    const v = this._fmtMontoExcel(raw);
    cell.value = v;
    if (typeof v === 'number') {
      cell.numFmt = this._NUM_FMT_MONTO;
    }
  }

  static _buildListaAportesPorCarreraSheet(worksheet, rows, filtros, paraleloNombre, assets = {}) {
    const FONT_SIZE_LISTA = 14;
    const FONT_SIZE_TITULO = 18;
    /** A:N°, B:C nombres, D:C.I., E–K montos/cuotas/estado (sin celular ni beca). */
    const LAST_COL = 11;
    const gestionAnio = filtros?.gestion_anio ? String(filtros.gestion_anio) : '';
    const carreraNombre = filtros?.carrera_nombre ? String(filtros.carrera_nombre) : '';
    const instituteName = IncosPDFBase?.INSTITUTE?.name || 'INSTITUTO TÉCNICO INCOS SANTA CRUZ';

    const sample = rows?.[0] || {};
    const turno = String(sample.paralelo_turno ?? sample.paraleloTurno ?? '');
    const periodoNombre = String(sample.periodo_nombre ?? sample.periodoNombre ?? '');
    const periodoNumero = Number(sample.periodo_numero ?? sample.periodoNumero ?? 0);
    const paraleloLetra = this._extractParaleloLetra(paraleloNombre);
    const periodoEtiqueta = this._toPeriodoEtiqueta(periodoNumero);

    worksheet.columns = [
      { width: 8 },
      { width: 18 },
      { width: 40 },
      { width: 22 },
      { width: 14 },
      { width: 14 },
      { width: 12 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
    ];

    worksheet.getRow(1).height = 58;
    worksheet.pageSetup = {
      ...worksheet.pageSetup,
      margins: { left: 0, right: 0, top: 0, bottom: 0, header: 0, footer: 0 },
    };
    worksheet.views = [{ showGridLines: false }];
    if (assets?.logoId != null) {
      worksheet.addImage(assets.logoId, {
        tl: { col: 0, row: 0 },
        br: { col: 2, row: 1 },
      });
    }
    if (assets?.incosLogoId != null) {
      worksheet.addImage(assets.incosLogoId, {
        tl: { col: LAST_COL - 1, row: 0 },
        br: { col: LAST_COL, row: 1 },
      });
    }

    const lastColLetter = String.fromCharCode(64 + LAST_COL);
    worksheet.mergeCells(`A2:${lastColLetter}2`);
    worksheet.getCell('A2').value =
      `LISTA DE ESTADO DE APORTE VOLUNTARIO ${gestionAnio}`.trim();
    worksheet.getCell('A2').font = { bold: true, size: FONT_SIZE_TITULO };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    worksheet.getRow(2).height = 32;

    const mergeVal = (r, label, value) => {
      worksheet.getCell(r, 1).value = label;
      worksheet.mergeCells(`A${r}:B${r}`);
      worksheet.mergeCells(`C${r}:${lastColLetter}${r}`);
      worksheet.getCell(r, 3).value = value;
    };

    mergeVal(3, 'INSTITUTO', instituteName);
    mergeVal(4, 'GESTIÓN:', gestionAnio);
    mergeVal(5, 'NIVEL:', 'TÉCNICO SUPERIOR');
    mergeVal(6, 'CARRERA:', carreraNombre);
    mergeVal(7, 'RÉGIMEN:', 'ANUAL');

    // Fila CURSO/TURNO (11 cols): curso C:F, TURNO en G, valor H:K
    worksheet.getCell('A8').value = 'CURSO:';
    worksheet.mergeCells('A8:B8');
    worksheet.mergeCells('C8:F8');
    worksheet.getCell('C8').value = `${periodoNombre || periodoEtiqueta} - "${paraleloLetra || ''}"`.trim();
    worksheet.getCell('G8').value = 'TURNO:';
    worksheet.mergeCells(`H8:${lastColLetter}8`);
    worksheet.getCell('H8').value = turno;

    for (let r = 3; r <= 7; r++) {
      worksheet.getCell(r, 1).font = { bold: true, size: FONT_SIZE_LISTA };
      worksheet.getCell(r, 1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
      worksheet.getCell(r, 3).font = { size: FONT_SIZE_LISTA };
      worksheet.getCell(r, 3).alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      };
    }
    ['A8', 'G8'].forEach((addr) => {
      worksheet.getCell(addr).font = { bold: true, size: FONT_SIZE_LISTA };
      worksheet.getCell(addr).alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    });
    ['C8', 'H8'].forEach((addr) => {
      worksheet.getCell(addr).font = { size: FONT_SIZE_LISTA };
      worksheet.getCell(addr).alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      };
    });
    [3, 4, 5, 6, 7, 8].forEach((r) => {
      worksheet.getRow(r).height = 24;
    });

    for (let r = 3; r <= 8; r++) {
      for (let c = 1; c <= LAST_COL; c++) {
        worksheet.getCell(r, c).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    const headerRowIdx = 9;
    const headers = [
      'N°',
      'APELLIDOS Y NOMBRES',
      '',
      'C.I.',
      'APORTE BASE',
      'DESCUENTO (Bs.)',
      'N° CUOTAS',
      'DEUDA TOTAL',
      'PAGADO',
      'SALDO',
      'ESTADO',
    ];

    worksheet.getCell(headerRowIdx, 1).value = headers[0];
    worksheet.mergeCells(`B${headerRowIdx}:C${headerRowIdx}`);
    worksheet.getCell(headerRowIdx, 2).value = headers[1];
    for (let c = 4; c <= LAST_COL; c++) {
      worksheet.getCell(headerRowIdx, c).value = headers[c - 1];
    }

    const headerRow = worksheet.getRow(headerRowIdx);
    headerRow.font = { bold: true, size: FONT_SIZE_LISTA };
    headerRow.height = 36;
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber > LAST_COL) return;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEAD0' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      // Nombres en B:C: la celda maestra B queda alineada a la izquierda (y C en el merge).
      const align =
        colNumber === 2 || colNumber === 3
          ? { horizontal: 'left', vertical: 'middle', wrapText: true }
          : { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.alignment = align;
    });

    const startDataRow = headerRowIdx + 1;
    (rows || []).forEach((row, idx) => {
      const nombre = String(row.nombre_completo ?? row.nombreCompleto ?? '').trim();
      const ci = String(row.ci ?? '').trim();
      const estadoRaw = row.estado_aporte ?? row.estadoAporte;
      const estado =
        estadoRaw != null && String(estadoRaw).trim() !== '' ? String(estadoRaw).trim() : '—';

      const rowIdx = startDataRow + idx;
      worksheet.getCell(rowIdx, 1).value = idx + 1;
      worksheet.mergeCells(`B${rowIdx}:C${rowIdx}`);
      worksheet.getCell(rowIdx, 2).value = nombre;
      const alignNombreB = { horizontal: 'left', vertical: 'middle', wrapText: true };
      worksheet.getCell(rowIdx, 2).alignment = alignNombreB;
      worksheet.getCell(rowIdx, 3).alignment = alignNombreB;
      worksheet.getCell(rowIdx, 4).value = ci;
      this._setMontoCell(worksheet.getCell(rowIdx, 5), row.aporte_monto_base ?? row.aporteMontoBase);
      this._setMontoCell(worksheet.getCell(rowIdx, 6), row.descuento_beca ?? row.descuentoBeca);
      worksheet.getCell(rowIdx, 7).value =
        row.pago_aporte_id == null && row.pagoAporteId == null
          ? '—'
          : Number(row.cantidad_cuotas ?? row.cantidadCuotas ?? 0);
      this._setMontoCell(worksheet.getCell(rowIdx, 8), row.monto_total_deuda ?? row.montoTotalDeuda);
      this._setMontoCell(worksheet.getCell(rowIdx, 9), row.monto_pagado ?? row.montoPagado);
      this._setMontoCell(worksheet.getCell(rowIdx, 10), row.saldo_pendiente ?? row.saldoPendiente);
      worksheet.getCell(rowIdx, 11).value = estado;

      const r = worksheet.getRow(rowIdx);
      r.height = 24;
      r.font = { size: FONT_SIZE_LISTA };
      for (let c = 1; c <= LAST_COL; c++) {
        const cell = worksheet.getCell(rowIdx, c);
        if (c === 2 || c === 3) continue;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
      worksheet.getCell(rowIdx, 1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      worksheet.getCell(rowIdx, 1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      for (let c = 2; c <= 3; c++) {
        const cell = worksheet.getCell(rowIdx, c);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    });

    worksheet.views = [{ state: 'frozen', ySplit: headerRowIdx, showGridLines: false }];
  }

  static async _tryAddMinisterioLogo(workbook) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const logoPath = path.join(__dirname, '../templates/ministerio.png');
      const buffer = await fs.readFile(logoPath);
      return workbook.addImage({ buffer, extension: 'png' });
    } catch {
      return null;
    }
  }

  static async _tryAddIncosLogo(workbook) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const logoPath = path.join(__dirname, '../templates/logo.png');
      const buffer = await fs.readFile(logoPath);
      return workbook.addImage({ buffer, extension: 'png' });
    } catch {
      return null;
    }
  }

  static _toSafeWorksheetName(name) {
    const raw = String(name ?? 'Hoja1').trim() || 'Hoja1';
    const sanitized = raw.replace(/[\\/:*?\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
    // Excel: máximo 31 caracteres por nombre de hoja
    return sanitized.slice(0, 31) || 'Hoja1';
  }

  static _toPeriodoEtiqueta(periodoNumero) {
    const n = Number(periodoNumero);
    if (!Number.isFinite(n) || n < 1) return '';
    const map = {
      1: '1ER',
      2: '2DO',
      3: '3ER',
      4: '4TO',
      5: '5TO',
      6: '6TO'
    };
    return map[n] || `${n}º`;
  }

  static _extractParaleloLetra(paraleloNombre) {
    const n = String(paraleloNombre || '').toUpperCase().trim();
    const match = n.match(/\b([A-Z])\b$/);
    return match ? match[1] : '';
  }
}

export { ExcelGenerator };
