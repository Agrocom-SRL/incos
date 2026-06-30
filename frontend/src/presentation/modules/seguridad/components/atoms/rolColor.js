/**
 * Color de acento por categoría de rol (tokens del tema, sin hex hardcodeado).
 * Un hue distinto por categoría (alineado a TIPO_CONFIG): púrpura/rojo/azul/cian/verde/ámbar.
 * Se usa en las celdas gráficas de los listados de seguridad (barra/identidad/swatch).
 */
const TIPO_VAR = {
  SISTEMA: 'var(--color-accent)',
  RECTOR: 'var(--color-error-text)',
  DIRECTIVO: 'var(--color-info-text)',
  // Cian/teal sintetizado desde tokens (azul + verde) para distinguir de DIRECTIVO y DOCENTE.
  SECRETARIA: 'color-mix(in srgb, var(--color-info-text) 55%, var(--color-success-text))',
  DOCENTE: 'var(--color-success-text)',
  ESTUDIANTE: 'var(--color-warning-text)',
};

export const rolColorVar = (tipo, isSystem = false) =>
  TIPO_VAR[tipo] || (isSystem ? 'var(--color-accent)' : 'var(--color-text-secondary)');

/** Variante de pill (StatusPill) por categoría de rol. Clases en seguridad.css. */
const TIPO_PILL = {
  SISTEMA: 'seg-rol-pill--sistema',
  RECTOR: 'seg-rol-pill--rector',
  DIRECTIVO: 'seg-rol-pill--directivo',
  SECRETARIA: 'seg-rol-pill--secretaria',
  DOCENTE: 'seg-rol-pill--docente',
  ESTUDIANTE: 'seg-rol-pill--estudiante',
};

export const rolPillClass = (tipo, isSystem = false) =>
  `seg-rol-pill ${TIPO_PILL[tipo] || (isSystem ? 'seg-rol-pill--sistema' : 'seg-rol-pill--default')}`;
