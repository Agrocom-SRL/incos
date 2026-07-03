/**
 * Configuración declarativa pura del Historial Académico FORM-SIE-ITT-04 (PDF).
 *
 * Solo datos (anchos proporcionales de columna, colores, tamaños de fuente, alto
 * de filas, etiquetas, escala de valoración, firmas). Sin lógica: la aritmética
 * de posiciones vive en `historialAcademicoPdfLayout.js` y el render en
 * `HistorialAcademicoPdfGenerator.js`. Mismo patrón que `boletinPdfConfig.js`.
 */
export const HISTORIAL_ACADEMICO_PDF_CONFIG = {
  colors: {
    primary: '#196b45', // Verde institucional (título y cabecera de tabla)
    headerText: '#ffffff', // Texto blanco sobre la cabecera verde
    text: '#000000',
    border: '#000000',
    tint: '#eef2f0' // Gris muy claro para la fila TOTAL
  },
  fonts: {
    tituloSize: 15,
    datosSize: 9,
    headerSize: 6.5,
    cellSize: 7.5,
    footerSize: 8,
    firmaSize: 9,
    pieSize: 8,
    leyendaSize: 8
  },
  table: {
    headerHeight: 24,
    rowHeight: 15,
    cellPadding: 3,
    borderWidth: 0.8
  },
  /**
   * Columnas de la tabla del transcript, en orden. `width` es proporción (suman
   * 1.0). `wrap: true` permite envolver el texto en varias líneas (ASIGNATURA).
   */
  columns: [
    { key: 'nro', label: 'N°', width: 0.045, align: 'center' },
    { key: 'gestionAnio', label: 'GESTION ACADEMICA', width: 0.09, align: 'center' },
    { key: 'cargaHoraria', label: 'CARGA HORARIA', width: 0.07, align: 'center' },
    { key: 'periodoNombre', label: 'SEMESTRE/AÑO', width: 0.11, align: 'center' },
    { key: 'asignaturaSigla', label: 'SIGLA', width: 0.08, align: 'center' },
    { key: 'asignaturaNombre', label: 'ASIGNATURA', width: 0.26, align: 'left', wrap: true },
    { key: 'prerrequisitoSigla', label: 'PRE REQUISITO', width: 0.08, align: 'center' },
    { key: 'notaFinal', label: 'NOTA', width: 0.065, align: 'center' },
    { key: 'notaRecuperacion', label: 'PRUEBA RECUP.', width: 0.07, align: 'center' },
    { key: 'estado', label: 'OBSERVACIONES', width: 0.13, align: 'center' }
  ],
  /** Etiqueta de la fila final con la carga horaria total del transcript. */
  totalRowLabel: 'TOTAL:',
  /** Texto para celdas sin valor (nota, prerrequisito, etc.). */
  nullPlaceholder: '—',
  /** Etiqueta institucional fija del bloque de datos. */
  institutoNombre: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ',
  /** Prefijo de la línea de lugar y fecha. */
  lugarFecha: { etiqueta: 'Lugar y fecha: ', lugar: 'Santa Cruz' },
  firmas: [
    { label: 'DIRECTORA ACADÉMICA', centerRatio: 0.27 },
    { label: 'RECTOR', centerRatio: 0.73 }
  ],
  /** Tabla "ESCALA DE VALORACIÓN" del pie (como en el FORM oficial). */
  escalaValoracion: {
    titulo: 'ESCALA DE VALORACIÓN',
    filas: [
      { rango: '61 a 100', etiqueta: 'APROBADO' },
      { rango: '0 a 60', etiqueta: 'REPROBADO' },
      { rango: '61', etiqueta: 'NOTA MINIMA' }
    ],
    rowHeight: 13,
    anchoRango: 55,
    anchoEtiqueta: 80
  },
  /** Etiquetas del bloque de resumen del pie (columna derecha). */
  resumenLabels: {
    cargaHoraria: 'Carga Horaria: ',
    aprobadas: 'Asignaturas aprobadas: ',
    promedio: 'Promedio de calificaciones: '
  },
  /** Leyenda legal centrada al pie del documento. */
  leyenda: 'Cualquier raspadura o enmienda invalida el presente documento.'
};

export default HISTORIAL_ACADEMICO_PDF_CONFIG;
