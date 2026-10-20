import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';

const hexToRgba = (hex, alpha) => {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Oscurece un hex multiplicando cada canal por (1 - amount). */
const hexDarken = (hex, amount) => {
  const normalized = hex.replace('#', '');
  const r = Math.round(parseInt(normalized.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(normalized.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(normalized.slice(4, 6), 16) * (1 - amount));
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Variables CSS — color de carrera como identidad (cabeceras sólidas, cuerpo tintado).
 */
export const buildPlanDocumentoThemeVars = (colorHex) => {
  const accent = sanitizeDocenteColorHex(colorHex) || '#196b45';
  const darkened1 = hexDarken(accent, 0.15);
  const darkened2 = hexDarken(accent, 0.24);
  const darkened3 = hexDarken(accent, 0.35);

  return {
    '--cfg-plan-accent': accent,
    '--cfg-plan-accent-header': accent,
    '--cfg-plan-accent-on-dark': '#ffffff',
    '--cfg-plan-accent-border': accent,
    '--cfg-plan-accent-body': hexToRgba(accent, 0.06),
    '--cfg-plan-accent-soft-bg': hexToRgba(accent, 0.12),
    '--cfg-plan-meta-band-1': accent,
    '--cfg-plan-meta-band-2': darkened1,
    '--cfg-plan-meta-band-3': darkened2,
    '--cfg-plan-meta-band-4': darkened3,
    '--cfg-plan-th-sub': hexToRgba(accent, 0.14),
    '--cfg-plan-row-stripe': hexToRgba(accent, 0.07),
  };
};

/** Fondo suave para tarjeta seleccionada (patrón política asistencia). */
export const buildCarreraChipStyle = (colorHex, selected) => {
  const accent = sanitizeDocenteColorHex(colorHex) || '#196b45';
  if (!selected) {
    return { borderColor: '#e8e8e8', background: '#fff', accentColor: accent };
  }
  return {
    borderColor: accent,
    background: hexToRgba(accent, 0.12),
    accentColor: accent,
  };
};

export const formatResolucionLabel = (resolucion) => {
  if (!resolucion) return '—';
  const raw = String(resolucion).trim();
  if (/resoluci[oó]n/i.test(raw)) return raw.toUpperCase();
  const normalized = raw.replace(/^No\.?\s*/i, '').trim();
  return `RESOLUCIÓN MINISTERIAL No. ${normalized}`;
};
