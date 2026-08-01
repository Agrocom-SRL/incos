/**
 * Configuración declarativa pura del Boletín de Calificaciones (PDF).
 *
 * Solo datos (anchos proporcionales de columna, colores, tamaños de fuente, alto de
 * filas, etiquetas). Sin lógica: la aritmética de posiciones vive en
 * `boletinPdfLayout.js` y el render en `BoletinPdfGenerator.js`.
 *
 * Las columnas PROM./HAB./FINAL llevan `tinted: true` para pintarlas con un leve
 * fondo gris que las agrupa visualmente como columnas de resumen.
 */
export const BOLETIN_PDF_CONFIG = {
  colors: {
    primary: '#196b45', // Verde institucional (fondo de cabecera de tabla y título)
    headerText: '#ffffff', // Texto blanco sobre la cabecera verde
    text: '#000000',
    border: '#000000',
    tint: '#eef2f0' // Gris muy claro para columnas de resumen (PROM/HAB/FINAL) y pie
  },
  fonts: {
    tituloSize: 15,
    datosSize: 9,
    headerSize: 7.5,
    cellSize: 8,
    footerSize: 8,
    firmaSize: 9
  },
  table: {
    headerHeight: 26,
    rowHeight: 18,
    cellPadding: 3,
    borderWidth: 0.8
  },
  /**
   * Columnas de la tabla de notas del boletín ANUAL, en orden. `width` es
   * proporción (suman 1.0). `tinted` marca columnas de resumen con leve fondo gris.
   */
  columns: [
    { key: 'codigo', label: 'CÓDIGO', width: 0.08, align: 'center' },
    { key: 'asignatura', label: 'ASIGNATURA', width: 0.26, align: 'left' },
    { key: 'par1', label: '1º PAR', width: 0.06, align: 'center' },
    { key: 'par2', label: '2º PAR', width: 0.06, align: 'center' },
    { key: 'par3', label: '3º PAR', width: 0.06, align: 'center' },
    { key: 'par4', label: '4º PAR', width: 0.06, align: 'center' },
    { key: 'prom', label: 'PROM.', width: 0.07, align: 'center', tinted: true },
    { key: 'hab', label: 'HAB.', width: 0.06, align: 'center', tinted: true },
    { key: 'final', label: 'FINAL', width: 0.07, align: 'center', tinted: true },
    { key: 'obs', label: 'OBSERVACIONES', width: 0.22, align: 'left' }
  ],
  /**
   * Columnas de la tabla del boletín BIMESTRAL: desglose del bimestre por
   * asignatura (nota TEÓRICA + PRÁCTICA = TOTAL, regla institucional
   * nota_bimestre = teórico + práctico) y ESTADO según la escala vigente.
   */
  columnsBimestre: [
    { key: 'codigo', label: 'CÓDIGO', width: 0.1, align: 'center' },
    { key: 'asignatura', label: 'ASIGNATURA', width: 0.4, align: 'left' },
    { key: 'teo', label: 'TEÓRICA', width: 0.12, align: 'center' },
    { key: 'pra', label: 'PRÁCTICA', width: 0.12, align: 'center' },
    { key: 'total', label: 'TOTAL', width: 0.12, align: 'center', tinted: true },
    { key: 'estado', label: 'ESTADO', width: 0.14, align: 'center', tinted: true }
  ],
  /** Etiqueta de la fila de pie con los promedios de clase por parcial. */
  footerRowLabel: 'PROMEDIO ANUAL',
  /** Texto para celdas numéricas sin nota. */
  nullPlaceholder: '—',
  firmas: [
    { label: 'DIRECTORA ACADÉMICA', centerRatio: 0.27 },
    { label: 'RECTOR', centerRatio: 0.73 }
  ]
};

export default BOLETIN_PDF_CONFIG;
