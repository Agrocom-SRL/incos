/**
 * Color de acento por categoría de rol (tokens del tema, sin hex hardcodeado).
 * Se usa en las celdas gráficas de los listados de seguridad (barra/identidad/swatch).
 */
const TIPO_VAR = {
  SISTEMA: 'var(--color-accent)',
  RECTOR: 'var(--color-primary)',
  DIRECTIVO: 'var(--color-primary)',
  SECRETARIA: 'var(--color-info-text)',
  DOCENTE: 'var(--color-success-text)',
  ESTUDIANTE: 'var(--color-warning-text)',
};

export const rolColorVar = (tipo, isSystem = false) =>
  TIPO_VAR[tipo] || (isSystem ? 'var(--color-accent)' : 'var(--color-text-secondary)');

/** Variante de pill (StatusPill) por categoría de rol. Clases en seguridad.css. */
const TIPO_PILL = {
  SISTEMA: 'seg-rol-pill--sistema',
  RECTOR: 'seg-rol-pill--institucional',
  DIRECTIVO: 'seg-rol-pill--institucional',
  SECRETARIA: 'seg-rol-pill--institucional',
  DOCENTE: 'seg-rol-pill--academico',
  ESTUDIANTE: 'seg-rol-pill--academico',
};

export const rolPillClass = (tipo, isSystem = false) =>
  `seg-rol-pill ${TIPO_PILL[tipo] || (isSystem ? 'seg-rol-pill--sistema' : 'seg-rol-pill--default')}`;
