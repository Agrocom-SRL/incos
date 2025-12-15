// src/infrastructure/config/theme/components/buttons.js
/**
 * Button Components - Componentes de botones
 * Button, IconButton
 */

import { allColors } from '../colors';
import { allSpacing } from '../spacing';

/**
 * Button - Botones
 * Propiedades reconocidas por Ant Design v5
 */
export const Button = {
  colorPrimary: allColors.colorPrimary,
  borderRadius: allSpacing.borderRadius,
  controlHeight: allSpacing.controlHeight,
  controlHeightSM: allSpacing.controlHeightSM,
  controlHeightLG: allSpacing.controlHeightLG,
  paddingInline: allSpacing.marginLG,
  paddingBlock: allSpacing.paddingSM,
  // Nota: Ant Design maneja automáticamente hover/active basado en colorPrimary
};

/**
 * IconButton - Botones con solo icono (componente personalizado)
 * Configuración simple: color base y hover
 */
export const IconButton = {
  // Color base: verde oscuro (colorSuccess)
  color: allColors.colorPrimary,
  colorHoverBg: allColors.colorPrimaryHover,
  colorHoverText: allColors.colorPrimaryTextHover,
  colorActiveBg: allColors.colorPrimaryActive,
  colorActiveText: allColors.colorPrimaryText,
  colorDisabledBg: allColors.colorPrimaryBgDisabled,
  colorDisabledText: allColors.colorPrimaryTextDisabled,
};
