// src/shared/config/theme/gradients.js
/**
 * Gradientes y efectos metálicos
 * Inspirados en el logo de INCOS
 * Incluye gradientes para todos los colores de acento
 */

import { allColors } from './colors';
import { accentColors } from './accentColors';

export const gradients = {
  // Gradiente verde metálico (como el texto "INCOS" del logo)
  gradientPrimary: `linear-gradient(135deg, ${allColors.colorPrimaryBorder} 0%, ${allColors.colorPrimary} 50%, ${allColors.colorPrimaryHover} 100%)`,
  gradientPrimaryHover: `linear-gradient(135deg, ${allColors.colorPrimaryBorder} 0%, ${allColors.colorPrimaryHover} 50%, ${allColors.colorPrimaryActive} 100%)`,
  
  // Gradiente dorado metálico (como la corona del logo)
  gradientGold: `linear-gradient(135deg, #fbbf24 0%, ${allColors.colorWarning} 50%, ${allColors.colorWarningHover} 100%)`,
  gradientGoldHover: `linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, ${allColors.colorWarning} 100%)`,
  
  // Gradientes de colores de acento
  gradientAccentRed: `linear-gradient(135deg, ${accentColors.colorAccentRed} 0%, ${accentColors.colorAccentRedHover} 100%)`,
  gradientAccentOrange: `linear-gradient(135deg, ${accentColors.colorAccentOrange} 0%, ${accentColors.colorAccentOrangeHover} 100%)`,
  gradientAccentTeal: `linear-gradient(135deg, ${accentColors.colorAccentTeal} 0%, ${accentColors.colorAccentTealHover} 100%)`,
  gradientAccentLime: `linear-gradient(135deg, ${accentColors.colorAccentLime} 0%, ${accentColors.colorAccentLimeHover} 100%)`,
  gradientAccentPurple: `linear-gradient(135deg, ${accentColors.colorAccentPurple} 0%, ${accentColors.colorAccentPurpleHover} 100%)`,
  
  // Gradientes semánticos
  gradientSuccess: `linear-gradient(135deg, ${allColors.colorSuccessBorder} 0%, ${allColors.colorSuccess} 100%)`,
  gradientInfo: `linear-gradient(135deg, ${allColors.colorInfoBorder} 0%, ${allColors.colorInfo} 100%)`,
  gradientWarning: `linear-gradient(135deg, ${allColors.colorWarningBorder} 0%, ${allColors.colorWarning} 100%)`,
  gradientError: `linear-gradient(135deg, ${allColors.colorErrorBorder} 0%, ${allColors.colorError} 100%)`,
};
