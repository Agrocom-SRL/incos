// src/infrastructure/config/theme/tokens/gradients.js
/**
 * Gradientes y efectos metálicos
 * Inspirados en el logo de INCOS
 * 
 * Incluye gradientes completos para:
 * - Colores semánticos: Primary, Success, Info, Warning, Error
 * - Colores de acento únicos: Beige, Olive, Brown, GreenLight
 */

import { allColors } from './colors';

export const gradients = {
  // ========================================
  // GRADIENTES SEMÁNTICOS (Primary, Success, Info, Warning, Error)
  // ========================================
  
  // Primary - Verde metálico (como el texto "INCOS" del logo)
  gradientPrimary: `linear-gradient(135deg, ${allColors.colorPrimaryBorder} 0%, ${allColors.colorPrimary} 50%, ${allColors.colorPrimaryHover} 100%)`,
  gradientPrimaryHover: `linear-gradient(135deg, ${allColors.colorPrimaryBorder} 0%, ${allColors.colorPrimaryHover} 50%, ${allColors.colorPrimaryActive} 100%)`,
  
  // Success - Verde medio
  gradientSuccess: `linear-gradient(135deg, ${allColors.colorSuccessBorder} 0%, ${allColors.colorSuccess} 50%, ${allColors.colorSuccessHover} 100%)`,
  gradientSuccessHover: `linear-gradient(135deg, ${allColors.colorSuccessBorder} 0%, ${allColors.colorSuccessHover} 50%, ${allColors.colorSuccessActive} 100%)`,
  
  // Info - Azul cielo
  gradientInfo: `linear-gradient(135deg, ${allColors.colorInfoBorder} 0%, ${allColors.colorInfo} 50%, ${allColors.colorInfoHover} 100%)`,
  gradientInfoHover: `linear-gradient(135deg, ${allColors.colorInfoBorder} 0%, ${allColors.colorInfoHover} 50%, ${allColors.colorInfoActive} 100%)`,
  
  // Warning - Dorado metálico (como la corona del logo)
  gradientWarning: `linear-gradient(135deg, ${allColors.colorWarningBorder} 0%, ${allColors.colorWarning} 50%, ${allColors.colorWarningHover} 100%)`,
  gradientWarningHover: `linear-gradient(135deg, ${allColors.colorWarningBorder} 0%, ${allColors.colorWarningHover} 50%, ${allColors.colorWarningActive} 100%)`,
  
  // Error - Rojo vibrante
  gradientError: `linear-gradient(135deg, ${allColors.colorErrorBorder} 0%, ${allColors.colorError} 50%, ${allColors.colorErrorHover} 100%)`,
  gradientErrorHover: `linear-gradient(135deg, ${allColors.colorErrorBorder} 0%, ${allColors.colorErrorHover} 50%, ${allColors.colorErrorActive} 100%)`,
  
  // ========================================
  // GRADIENTES DE ACENTO (colores únicos del logo INCOS)
  // ========================================
  
  // Beige - Amarillo/Beige claro del logo
  gradientAccentBeige: `linear-gradient(135deg, ${allColors.colorAccentBeigeBorder} 0%, ${allColors.colorAccentBeige} 50%, ${allColors.colorAccentBeigeHover} 100%)`,
  gradientAccentBeigeHover: `linear-gradient(135deg, ${allColors.colorAccentBeigeBorder} 0%, ${allColors.colorAccentBeigeHover} 50%, ${allColors.colorAccentBeigeActive} 100%)`,
  
  // Olive - Verde oliva/amarillo verdoso del logo
  gradientAccentOlive: `linear-gradient(135deg, ${allColors.colorAccentOliveBorder} 0%, ${allColors.colorAccentOlive} 50%, ${allColors.colorAccentOliveHover} 100%)`,
  gradientAccentOliveHover: `linear-gradient(135deg, ${allColors.colorAccentOliveBorder} 0%, ${allColors.colorAccentOliveHover} 50%, ${allColors.colorAccentOliveActive} 100%)`,
  
  // Brown - Marrón oscuro/Negro del logo
  gradientAccentBrown: `linear-gradient(135deg, ${allColors.colorAccentBrownBorder} 0%, ${allColors.colorAccentBrown} 50%, ${allColors.colorAccentBrownHover} 100%)`,
  gradientAccentBrownHover: `linear-gradient(135deg, ${allColors.colorAccentBrownBorder} 0%, ${allColors.colorAccentBrownHover} 50%, ${allColors.colorAccentBrownActive} 100%)`,
  
  // GreenLight - Verde claro del logo
  gradientAccentGreenLight: `linear-gradient(135deg, ${allColors.colorAccentGreenLightBorder} 0%, ${allColors.colorAccentGreenLight} 50%, ${allColors.colorAccentGreenLightHover} 100%)`,
  gradientAccentGreenLightHover: `linear-gradient(135deg, ${allColors.colorAccentGreenLightBorder} 0%, ${allColors.colorAccentGreenLightHover} 50%, ${allColors.colorAccentGreenLightActive} 100%)`,
};
