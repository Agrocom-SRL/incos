/**
 * ExcelStructureBuilder - Construye la estructura del Excel
 * Responsabilidad: Crear encabezados, títulos y estructura base
 * Principio: Single Responsibility Principle (SRP)
 */

import { ExcelStyleManager } from './ExcelStyleManager.js';

/** Título del reporte (más grande que el cuerpo de la tabla). */
const FONT_SIZE_TITULO_REPORTE = 22;

class ExcelStructureBuilder {
  /**
   * Configura los anchos de las columnas
   */
  static configurarColumnas(worksheet) {
    worksheet.getColumn('A').width = 3;
    // B más estrecha → el nombre de carrera hace wrap en el bloque fusionado (4 filas)
    worksheet.getColumn('B').width = 24;
    worksheet.getColumn('C').width = 18;
    for (let i = 4; i <= 39; i++) {
      worksheet.getColumn(i).width = 8;
    }
    // Totales por género (títulos largos)
    for (let i = 40; i <= 45; i++) {
      worksheet.getColumn(i).width = 15;
    }
  }

  /**
   * Agrega el título del reporte
   */
  static agregarTitulo(worksheet, gestionAnio) {
    worksheet.mergeCells('B3:AS5');
    const titulo = worksheet.getCell('B3');
    titulo.value = `ESTADÍSTICA ESTUDIANTES INSTITUTO INCOS SANTA CRUZ - GESTIÓN ${gestionAnio || ''}`;
    titulo.font = { size: FONT_SIZE_TITULO_REPORTE, bold: true };
    titulo.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
  }

  /**
   * Construye todos los encabezados (filas 7, 8, 9)
   */
  static construirEncabezados(worksheet) {
    this.agregarFila7Categorias(worksheet);
    this.agregarFila8Paralelos(worksheet);
    this.agregarFila9Genero(worksheet);
    ExcelStyleManager.aplicarEstilosEncabezados(worksheet);
  }

  /**
   * Agrega la fila 7 con las categorías principales
   */
  static agregarFila7Categorias(worksheet) {
    // CARRERAS
    worksheet.mergeCells('B7:B9');
    worksheet.getCell('B7').value = 'CARRERAS';

    // REGIMEN
    worksheet.mergeCells('C7:C9');
    const celdaRegimen = worksheet.getCell('C7');
    celdaRegimen.value = 'REGIMEN';
    celdaRegimen.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      textRotation: 90
    };

    // INSCRIPCIÓN
    worksheet.mergeCells('D7:K7');
    worksheet.getCell('D7').value = 'INSCRIPCIÓN';
    worksheet.mergeCells('L7:L9');
    const celdaTotalInscripcion = worksheet.getCell('L7');
    celdaTotalInscripcion.value = 'TOTAL';
    celdaTotalInscripcion.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      textRotation: 90
    };

    // ABANDONOS
    worksheet.mergeCells('M7:T7');
    worksheet.getCell('M7').value = 'ABANDONOS';
    worksheet.mergeCells('U7:U9');
    const celdaTotalAbandonos = worksheet.getCell('U7');
    celdaTotalAbandonos.value = 'TOTAL';
    celdaTotalAbandonos.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      textRotation: 90
    };

    // REPROBADOS
    worksheet.mergeCells('V7:AC7');
    worksheet.getCell('V7').value = 'REPROBADOS';
    worksheet.mergeCells('AD7:AD9');
    const celdaTotalReprobados = worksheet.getCell('AD7');
    celdaTotalReprobados.value = 'TOTAL';
    celdaTotalReprobados.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      textRotation: 90
    };

    // APROBADOS
    worksheet.mergeCells('AE7:AL7');
    worksheet.getCell('AE7').value = 'APROBADOS';
    worksheet.mergeCells('AM7:AM9');
    const celdaTotalAprobados = worksheet.getCell('AM7');
    celdaTotalAprobados.value = 'TOTAL';
    celdaTotalAprobados.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      textRotation: 90
    };

    // Totales por género
    const totalesGenero = [
      { col: 'AN', label: 'TOTAL MUJERES ABANDONO' },
      { col: 'AO', label: 'TOTAL VARONES ABANDONO' },
      { col: 'AP', label: 'TOTAL MUJERES REPROBADOS' },
      { col: 'AQ', label: 'TOTAL VARONES REPROBADOS' },
      { col: 'AR', label: 'TOTAL MUJERES APROBADOS' },
      { col: 'AS', label: 'TOTAL VARONES APROBADOS' }
    ];

    totalesGenero.forEach(({ col, label }) => {
      worksheet.mergeCells(`${col}7:${col}9`);
      const celda = worksheet.getCell(`${col}7`);
      celda.value = label;
      celda.alignment = {
        vertical: 'middle',
        horizontal: 'center'
        // Sin rotación - texto horizontal según imagen
      };
    });
  }

  /**
   * Agrega la fila 8 con los paralelos (A, B, C, D)
   */
  static agregarFila8Paralelos(worksheet) {
    const paralelos = ['A', 'B', 'C', 'D'];
    const configuraciones = [
      { cols: [['D', 'E'], ['F', 'G'], ['H', 'I'], ['J', 'K']] }, // INSCRIPCIÓN
      { cols: [['M', 'N'], ['O', 'P'], ['Q', 'R'], ['S', 'T']] }, // ABANDONOS
      { cols: [['V', 'W'], ['X', 'Y'], ['Z', 'AA'], ['AB', 'AC']] }, // REPROBADOS
      { cols: [['AE', 'AF'], ['AG', 'AH'], ['AI', 'AJ'], ['AK', 'AL']] } // APROBADOS
    ];

    configuraciones.forEach(({ cols }) => {
      cols.forEach((colPair, idx) => {
        worksheet.mergeCells(`${colPair[0]}8:${colPair[1]}8`);
        worksheet.getCell(`${colPair[0]}8`).value = paralelos[idx];
      });
    });
  }

  /**
   * Agrega la fila 9 con género (M/V)
   */
  static agregarFila9Genero(worksheet) {
    const secciones = [
      ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'], // INSCRIPCIÓN
      ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'], // ABANDONOS
      ['V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC'], // REPROBADOS
      ['AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL'] // APROBADOS
    ];

    secciones.forEach(cols => {
      cols.forEach((col, idx) => {
        worksheet.getCell(`${col}9`).value = idx % 2 === 0 ? 'M' : 'V';
      });
    });
  }
}

export { ExcelStructureBuilder };