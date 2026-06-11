/**
 * ExcelTheme — tokens de diseño institucional para libros Excel de INCOS.
 *
 * Fuente única de verdad para tipografía, paleta y bordes de los reportes .xlsx,
 * de modo que todos los generadores compartan un lenguaje visual homogéneo
 * (mismo criterio que el theme de Ant Design en el frontend).
 *
 * Reutilizable: cualquier *ExcelBuilder* debe tomar colores/fuentes de aquí en
 * lugar de literales sueltos, para mantener el diseño estandarizado.
 */

export const EXCEL_FONT = 'Calibri';

export const EXCEL_FONT_SIZE = {
  title: 17,
  subtitle: 15,
  label: 14,
  body: 13,
  small: 12
};

/** Paleta institucional (ARGB). Tonos suaves para cabeceras, acentos para totales. */
export const EXCEL_COLOR = {
  white: 'FFFFFFFF',
  ink: 'FF1F2937', // texto principal (slate-800)
  inkSoft: 'FF475569', // texto secundario (slate-600)
  band: 'FF1F4E79', // banda de título institucional (azul profundo)
  bandText: 'FFFFFFFF',
  infoLabel: 'FFDCE6F1', // fondo de etiquetas de cabecera (carrera/docente/...) azul muy suave
  statHeader: 'FF1F4E79', // cabecera de tablas de estadísticas
  statHeaderText: 'FFFFFFFF',
  practicas: 'FFFFF2CC', // ámbar suave
  practicasStrong: 'FFFFE08A',
  teoricas: 'FFE2EFDA', // verde suave
  teoricasStrong: 'FFC6E0B4',
  finalHeader: 'FF2E7D32', // verde fuerte cabecera nota final
  finalCell: 'FFEAF4EA',
  obsHeader: 'FFDDEBF7', // azul suave
  obsCell: 'FFF3F8FD',
  zebra: 'FFF7F9FC', // fila par
  headerBorder: 'FF94A3B8',
  gridBorder: 'FFCBD5E1'
};

/** Estilos de borde reutilizables. */
export const EXCEL_BORDER = {
  thin: { style: 'thin', color: { argb: EXCEL_COLOR.gridBorder } },
  medium: { style: 'medium', color: { argb: EXCEL_COLOR.headerBorder } },
  hair: { style: 'hair', color: { argb: EXCEL_COLOR.gridBorder } }
};

export default { EXCEL_FONT, EXCEL_FONT_SIZE, EXCEL_COLOR, EXCEL_BORDER };
