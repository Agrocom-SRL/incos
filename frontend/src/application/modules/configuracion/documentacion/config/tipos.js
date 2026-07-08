/**
 * Catálogo de los 9 tipos de documento del ENUM `tipo_documento` (tabla
 * `documentacion`, ver `03-catalogos-referencia.sql`). Documentación se
 * administra ahora en UNA sola pantalla (permiso único
 * `configuracion.documentacion`), así que este archivo ya no segmenta por
 * pantalla/permiso: es la ÚNICA fuente de verdad de labels y opciones del
 * tipo en el frontend. Lo consumen la columna "Tipo y descripción" del
 * listado, el Select del formulario y la ficha de detalle.
 *
 * Los íconos por tipo (presentación) viven en
 * `@configuracion/documentacion/config/documentacionTipoIconMap.js`
 * (mismo reparto de capas que actividades: labels aquí, íconos en presentation).
 */

export const TIPOS_DOCUMENTO = {
  INSCRIPCION: 'INSCRIPCION',
  LICENCIA: 'LICENCIA',
  PASANTIA: 'PASANTIA',
  DESCUENTO: 'DESCUENTO',
  TITULACION: 'TITULACION',
  TRASPASO: 'TRASPASO',
  TRANSITABILIDAD: 'TRANSITABILIDAD',
  BECA: 'BECA',
  OTRO: 'OTRO',
};

export const TIPO_DOCUMENTO_LABEL = {
  [TIPOS_DOCUMENTO.INSCRIPCION]: 'Inscripción',
  [TIPOS_DOCUMENTO.LICENCIA]: 'Licencia',
  [TIPOS_DOCUMENTO.PASANTIA]: 'Pasantía',
  [TIPOS_DOCUMENTO.DESCUENTO]: 'Descuento',
  [TIPOS_DOCUMENTO.TITULACION]: 'Titulación',
  [TIPOS_DOCUMENTO.TRASPASO]: 'Traspaso',
  [TIPOS_DOCUMENTO.TRANSITABILIDAD]: 'Transitabilidad',
  [TIPOS_DOCUMENTO.BECA]: 'Beca',
  [TIPOS_DOCUMENTO.OTRO]: 'Otro',
};

/** Opciones del Select "Tipo de documento" del formulario (9 valores del ENUM). */
export const TIPOS_DOCUMENTO_OPTIONS = Object.entries(TIPO_DOCUMENTO_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const getTipoDocumentoLabel = (tipo) => TIPO_DOCUMENTO_LABEL[tipo] ?? tipo ?? '—';
