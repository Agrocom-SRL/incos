/**
 * ExcelStyleManager - Maneja todos los estilos y colores del Excel
 * Responsabilidad: Aplicar estilos, colores y formatos a las celdas
 * Principio: Single Responsibility Principle (SRP)
 */

class ExcelStyleManager {
  /**
   * Configuración de colores según el diseño institucional
   */
  static COLORS = {
    HEADER_BG: { argb: 'FFD9D9D9' }, // Gris claro para encabezados
    CONTADURIA_BG: null, // Blanco (sin color) para filas de datos
    ADMINISTRACION_BG: { argb: 'FFE2EFDA' }, // Verde claro para filas de datos
    SISTEMAS_BG: { argb: 'FFE2EFDA' }, // Verde claro para filas de datos
    // Colores para totales por carrera (según imagen)
    TOTAL_CONTADURIA_BG: { argb: 'FFE2BEF1' }, // Violeta claro
    TOTAL_ADMINISTRACION_BG: { argb: 'FFB4D8B4' }, // Verde teal más oscuro
    TOTAL_SISTEMAS_BG: { argb: 'FFB4D8E8' }, // Azul teal más oscuro
    TOTAL_GENERAL_BG: { argb: 'FFFFB6C1' } // Rosado/rojizo claro
  };

  /**
   * Aplica estilos a las filas de encabezados
   */
  static aplicarEstilosEncabezados(worksheet) {
    [7, 8, 9].forEach(row => {
      worksheet.getRow(row).eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: this.COLORS.HEADER_BG
        };
        cell.font = { bold: true, size: 11 };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        };
        cell.border = this.getBordeDelgado();
      });
    });

    worksheet.getRow(7).height = 25;
    worksheet.getRow(8).height = 20;
    worksheet.getRow(9).height = 20;
  }

  /**
   * Aplica color de fondo según la carrera
   */
  static aplicarColorCarrera(worksheet, row, carreraNombre) {
    const color = this.obtenerColorCarrera(carreraNombre);
    
    if (color) {
      worksheet.getRow(row).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: color
      };
    }
  }

  /**
   * Obtiene el color de fondo para una carrera
   */
  static obtenerColorCarrera(carreraNombre) {
    const nombre = carreraNombre?.toUpperCase() || '';
    
    if (nombre.includes('ADMINISTRACIÓN') || nombre.includes('ADMINISTRACION')) {
      return this.COLORS.ADMINISTRACION_BG;
    }
    if (nombre.includes('SISTEMAS')) {
      return this.COLORS.SISTEMAS_BG;
    }
    // Contaduría General: sin color (blanco)
    return this.COLORS.CONTADURIA_BG;
  }

  /**
   * Aplica estilo a la fila de total por carrera según la carrera
   */
  static aplicarEstiloTotalCarrera(worksheet, row, carreraNombre) {
    const color = this.obtenerColorTotalCarrera(carreraNombre);
    
    worksheet.getRow(row).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: color
    };
  }

  /**
   * Obtiene el color de fondo para el total de una carrera
   */
  static obtenerColorTotalCarrera(carreraNombre) {
    const nombre = carreraNombre?.toUpperCase() || '';
    
    if (nombre.includes('CONTADURÍA') || nombre.includes('CONTADURIA')) {
      return this.COLORS.TOTAL_CONTADURIA_BG;
    }
    if (nombre.includes('ADMINISTRACIÓN') || nombre.includes('ADMINISTRACION')) {
      return this.COLORS.TOTAL_ADMINISTRACION_BG;
    }
    if (nombre.includes('SISTEMAS')) {
      return this.COLORS.TOTAL_SISTEMAS_BG;
    }
    // Default: violeta claro
    return this.COLORS.TOTAL_CONTADURIA_BG;
  }

  /**
   * Aplica estilo a la fila de total general
   */
  static aplicarEstiloTotalGeneral(worksheet, row) {
    worksheet.getRow(row).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: this.COLORS.TOTAL_GENERAL_BG
    };
  }

  /**
   * Aplica bordes delgados a una fila completa
   */
  static aplicarBordesFila(worksheet, row) {
    worksheet.getRow(row).eachCell(cell => {
      cell.border = this.getBordeDelgado();
    });
  }

  /**
   * Retorna configuración de borde delgado
   */
  static getBordeDelgado() {
    return {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  /**
   * Aplica estilo de texto en negrita
   */
  static aplicarNegrita(cell) {
    cell.font = { ...cell.font, bold: true };
  }
}

module.exports = { ExcelStyleManager };
