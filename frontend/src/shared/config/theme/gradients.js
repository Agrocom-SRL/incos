// src/shared/config/theme/gradients.js
/**
 * Gradientes y efectos metálicos
 * Inspirados en el logo de INCOS
 * Incluye gradientes para todos los colores de acento
 */

import { allColors } from './colors';

export const gradients = {
  // Gradiente verde metálico (como el texto "INCOS" del logo)
  gradientPrimary: `linear-gradient(135deg, ${allColors.colorPrimaryBorder} 0%, ${allColors.colorPrimary} 50%, ${allColors.colorPrimaryHover} 100%)`,
  gradientPrimaryHover: `linear-gradient(135deg, ${allColors.colorPrimaryBorder} 0%, ${allColors.colorPrimaryHover} 50%, ${allColors.colorPrimaryActive} 100%)`,
  
  // Gradiente dorado metálico (como la corona del logo)
  gradientGold: `linear-gradient(135deg, #fbbf24 0%, ${allColors.colorWarning} 50%, ${allColors.colorWarningHover} 100%)`,
  gradientGoldHover: `linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, ${allColors.colorWarning} 100%)`,
  
  // Gradientes de colores de acento (colores del logo INCOS)
  gradientAccentBeige: `linear-gradient(135deg, ${allColors.colorAccentBeige} 0%, ${allColors.colorAccentBeigeHover} 100%)`,
  gradientAccentBlue: `linear-gradient(135deg, ${allColors.colorAccentBlue} 0%, ${allColors.colorAccentBlueHover} 100%)`,
  gradientAccentOlive: `linear-gradient(135deg, ${allColors.colorAccentOlive} 0%, ${allColors.colorAccentOliveHover} 100%)`,
  gradientAccentBrown: `linear-gradient(135deg, ${allColors.colorAccentBrown} 0%, ${allColors.colorAccentBrownHover} 100%)`,
  gradientAccentRed: `linear-gradient(135deg, ${allColors.colorAccentRed} 0%, ${allColors.colorAccentRedHover} 100%)`,
  gradientAccentGreenLight: `linear-gradient(135deg, ${allColors.colorAccentGreenLight} 0%, ${allColors.colorAccentGreenLightHover} 100%)`,
  gradientAccentGreen: `linear-gradient(135deg, ${allColors.colorAccentGreen} 0%, ${allColors.colorAccentGreenHover} 100%)`,
  
  // Gradientes semánticos
  gradientSuccess: `linear-gradient(135deg, ${allColors.colorSuccessBorder} 0%, ${allColors.colorSuccess} 100%)`,
  gradientInfo: `linear-gradient(135deg, ${allColors.colorInfoBorder} 0%, ${allColors.colorInfo} 100%)`,
  gradientWarning: `linear-gradient(135deg, ${allColors.colorWarningBorder} 0%, ${allColors.colorWarning} 100%)`,
  gradientError: `linear-gradient(135deg, ${allColors.colorErrorBorder} 0%, ${allColors.colorError} 100%)`,
};
