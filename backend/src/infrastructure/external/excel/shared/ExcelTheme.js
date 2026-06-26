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
  title: 20,
  subtitle: 17,
  label: 16,
  body: 15,
  small: 14
};

/** Paleta institucional (ARGB). Tonos suaves para cabeceras, acentos para totales. */
export const EXCEL_COLOR = {
  white: 'FFFFFFFF',
  ink: 'FF1F2937', // texto principal (slate-800)
  inkSoft: 'FF475569', // texto secundario (slate-600)
  band: 'FF196B45', // banda de título institucional (verde primario del sistema)
  bandText: 'FFFFFFFF',
  infoLabel: 'FFD8EADF', // fondo de etiquetas de cabecera (verde muy suave)
  statHeader: 'FF196B45', // cabecera de tablas de estadísticas (verde primario)
  statHeaderText: 'FFFFFFFF',
  practicas: 'FFFFF2CC', // ámbar suave
  practicasStrong: 'FFFFE08A',
  teoricas: 'FFE2EFDA', // verde suave
  teoricasStrong: 'FFC6E0B4',
  finalHeader: 'FF0F5132', // verde oscuro cabecera nota final
  finalCell: 'FFE3F0E9',
  obsHeader: 'FFCFE5D9', // verde-gris suave (antes azul)
  obsCell: 'FFEFF6F2',
  zebra: 'FFF3F8F5', // fila par (verde muy tenue)
  headerBorder: 'FF7CA893',
  gridBorder: 'FFCBD5E1',
  danger: 'FFB91C1C', // texto de nota reprobada (rojo-700) — paridad con la pantalla
  dangerSoft: 'FFFCE8E8', // relleno muy tenue para celda reprobada (opcional)
  subtitleBand: 'FF0F5132' // banda secundaria (verde oscuro) bajo el título
};

/** Estilos de borde reutilizables. */
export const EXCEL_BORDER = {
  thin: { style: 'thin', color: { argb: EXCEL_COLOR.gridBorder } },
  medium: { style: 'medium', color: { argb: EXCEL_COLOR.headerBorder } },
  hair: { style: 'hair', color: { argb: EXCEL_COLOR.gridBorder } }
};

export default { EXCEL_FONT, EXCEL_FONT_SIZE, EXCEL_COLOR, EXCEL_BORDER };
