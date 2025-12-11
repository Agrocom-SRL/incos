// src/shared/config/theme/index.js
/**
 * Exportación centralizada de todos los tokens del tema
 * Este archivo combina todos los módulos del tema
 */

export { allColors } from './colors';
export { accentColors } from './accentColors';
export { gradients } from './gradients';
export { shadows } from './shadows';
export { typography } from './typography';
export { allSpacing } from './spacing';
export { componentConfig } from './components';

// Combinación de todos los tokens
import { allColors } from './colors';
import { accentColors } from './accentColors';
import { gradients } from './gradients';
import { shadows } from './shadows';
import { typography } from './typography';
import { allSpacing } from './spacing';

export const allThemeTokens = {
  ...allColors,
  ...accentColors,
  ...gradients,
  ...shadows,
  ...typography,
  ...allSpacing,
};
