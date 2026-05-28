import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const mix = (a, b, t) => Math.round(a + (b - a) * t);

/**
 * Variables CSS — familia cromática única (bandas, filas y tablas).
 */
export const buildPlanDocumentoThemeVars = (colorHex) => {
  const accent = sanitizeDocenteColorHex(colorHex) || '#196b45';
  const hex = accent.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const bodyR = clamp(mix(r, 0, 0.58), 0, 255);
  const bodyG = clamp(mix(g, 0, 0.58), 0, 255);
  const bodyB = clamp(mix(b, 0, 0.58), 0, 255);

  return {
    '--cfg-plan-accent': accent,
    '--cfg-plan-accent-header': accent,
    '--cfg-plan-accent-body': `rgb(${bodyR}, ${bodyG}, ${bodyB})`,
    '--cfg-plan-accent-on-dark': '#ffffff',
    '--cfg-plan-accent-border': `rgba(${r}, ${g}, ${b}, 0.35)`,
    '--cfg-plan-accent-soft-bg': `rgba(${r}, ${g}, ${b}, 0.12)`,
    '--cfg-plan-meta-band-1': accent,
    '--cfg-plan-meta-band-2': `rgba(${r}, ${g}, ${b}, 0.82)`,
    '--cfg-plan-meta-band-3': `rgba(${r}, ${g}, ${b}, 0.58)`,
    '--cfg-plan-meta-band-4': `rgba(${r}, ${g}, ${b}, 0.32)`,
    '--cfg-plan-row-stripe': `rgba(255, 255, 255, 0.1)`,
    '--cfg-plan-th-sub': `rgba(${r}, ${g}, ${b}, 0.72)`,
  };
};

/** Fondo suave para tarjeta seleccionada (patrón política asistencia). */
export const buildCarreraChipStyle = (colorHex, selected) => {
  const accent = sanitizeDocenteColorHex(colorHex) || '#196b45';
  if (!selected) {
    return { borderColor: '#e8e8e8', background: '#fff', accentColor: accent };
  }
  const hex = accent.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return {
    borderColor: accent,
    background: `rgba(${r}, ${g}, ${b}, 0.12)`,
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
