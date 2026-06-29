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
