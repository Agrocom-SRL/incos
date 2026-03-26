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
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEAD0' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
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
      worksheet.getCell(`D${rowIdx}`).value = ci;
      worksheet.getCell(`E${rowIdx}`).value = sexo;
      worksheet.getCell(`F${rowIdx}`).value = celular;
      worksheet.getCell(`G${rowIdx}`).value = observaciones;
    });

    for (let row = startDataRow; row < startDataRow + (rows?.length || 0); row++) {
      const r = worksheet.getRow(row);
      r.height = 24;
      r.font = { size: FONT_SIZE_LISTA };
      r.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      r.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }

    // Centrar todo (incluye celdas informativas). "Padding" se simula con alturas de filas.
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        const prev = cell.alignment || {};
        cell.alignment = {
          ...prev,
          horizontal: prev.horizontal ?? 'center',
          vertical: prev.vertical ?? 'middle',
          wrapText: prev.wrapText ?? true
        };
      });
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
