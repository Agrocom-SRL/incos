// src/infrastructure/config/theme/tokens/shadows.js
/**
 * Sistema de sombras y profundidad
 * Para efectos 3D como el logo
 * 
 * Incluye sombras completas para:
 * - Colores semánticos: Primary, Success, Info, Warning, Error
 * - Colores de acento únicos: Beige, Olive, Brown, GreenLight
 */

import { allColors } from './colors';

// Función helper para convertir hex a RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Función helper para crear sombra de color
const createColorShadow = (color, opacity = 0.2) => {
  const rgb = hexToRgb(color);
  if (!rgb) return '0 4px 12px rgba(0, 0, 0, 0.2)';
  return `0 4px 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

const createColorShadowHover = (color, opacity = 0.3) => {
  const rgb = hexToRgb(color);
  if (!rgb) return '0 6px 16px rgba(0, 0, 0, 0.3)';
  return `0 6px 16px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

export const shadows = {
  // ========================================
  // SISTEMA DE ELEVACIÓN (sombras neutras)
  // ========================================
  shadowElevation1: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
  shadowElevation2: '0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
  shadowElevation3: '0 4px 8px 0 rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
  shadowElevation4: '0 8px 16px 0 rgba(0, 0, 0, 0.12), 0 16px 32px -8px rgba(0, 0, 0, 0.1)',
  
  // ========================================
  // SOMBRAS SEMÁNTICAS (Primary, Success, Info, Warning, Error)
  // ========================================
  
  // Primary - Verde
  shadowPrimary: createColorShadow(allColors.colorPrimary),
  shadowPrimaryHover: createColorShadowHover(allColors.colorPrimary),
  
  // Success - Verde medio
  shadowSuccess: createColorShadow(allColors.colorSuccess),
  shadowSuccessHover: createColorShadowHover(allColors.colorSuccess),
  
  // Info - Azul cielo
  shadowInfo: createColorShadow(allColors.colorInfo),
  shadowInfoHover: createColorShadowHover(allColors.colorInfo),
  
  // Warning - Dorado
  shadowWarning: createColorShadow(allColors.colorWarning, 0.25),
  shadowWarningHover: createColorShadowHover(allColors.colorWarning, 0.35),
  
  // Error - Rojo
  shadowError: createColorShadow(allColors.colorError),
  shadowErrorHover: createColorShadowHover(allColors.colorError),
  
  // ========================================
  // SOMBRAS DE ACENTO (colores únicos del logo)
  // ========================================
  
  // Beige - Amarillo/Beige claro
  shadowAccentBeige: createColorShadow(allColors.colorAccentBeige, 0.2),
  shadowAccentBeigeHover: createColorShadowHover(allColors.colorAccentBeige, 0.3),
  
  // Olive - Verde oliva
  shadowAccentOlive: createColorShadow(allColors.colorAccentOlive, 0.2),
  shadowAccentOliveHover: createColorShadowHover(allColors.colorAccentOlive, 0.3),
  
  // Brown - Marrón oscuro
  shadowAccentBrown: createColorShadow(allColors.colorAccentBrown, 0.3),
  shadowAccentBrownHover: createColorShadowHover(allColors.colorAccentBrown, 0.4),
  
  // GreenLight - Verde claro
  shadowAccentGreenLight: createColorShadow(allColors.colorAccentGreenLight, 0.2),
  shadowAccentGreenLightHover: createColorShadowHover(allColors.colorAccentGreenLight, 0.3),
};
