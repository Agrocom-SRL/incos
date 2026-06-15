// src/infrastructure/config/theme/tokens/index.js
/**
 * Exportación centralizada de todos los tokens del tema
 * Este archivo combina todos los módulos de tokens y exporta allThemeTokens
 * 
 * Responsabilidades:
 * - Exportar todos los tokens individuales (colors, spacing, typography, etc.)
 * - Combinar todos los tokens en allThemeTokens para uso en light.js
 * - Exportar componentConfig para configuración de componentes de Ant Design
 * 
 * Ubicación: tokens/index.js (dentro de tokens/ porque combina tokens)
 */

export { allColors } from './colors';
export { gradients } from './gradients';
export { shadows } from './shadows';
export { typography } from './typography';
export { allSpacing, navSpacing } from './spacing';
export { componentConfig } from './components';

// Combinación de todos los tokens
import { allColors } from './colors';
import { gradients } from './gradients';
import { shadows } from './shadows';
import { typography } from './typography';
import { allSpacing } from './spacing';

export const allThemeTokens = {
  ...allColors,
  ...gradients,
  ...shadows,
  ...typography,
  ...allSpacing,
};
