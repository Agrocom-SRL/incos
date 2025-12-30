// src/infrastructure/config/theme/components/buttons.js
/**
 * Button Components - Componentes de botones
 * Button, IconButton, SemanticButtons
 */

import { allColors } from '../colors';
import { allSpacing } from '../spacing';

/**
 * Button - Botones
 * Propiedades reconocidas por Ant Design v5
 */
export const Button = {
  colorPrimary: allColors.colorPrimary,
  colorPrimaryHover: allColors.colorPrimaryHover,
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
  // Color base: verde oscuro (colorPrimary)
  color: allColors.colorPrimary,
  colorHoverBg: allColors.colorPrimaryHover,
  colorHoverText: allColors.colorPrimaryTextHover,
  colorActiveBg: allColors.colorPrimaryActive,
  colorActiveText: allColors.colorPrimaryText,
  colorDisabledBg: allColors.colorPrimaryBgDisabled,
  colorDisabledText: allColors.colorPrimaryTextDisabled,
};

/**
 * SemanticButtons - Configuración para botones semánticos (Info, Success, Warning, Error)
 * Se usa tanto para IconButton como para Button (outlined y filled)
 * 
 * Cada variante semántica incluye:
 * - color: Color base del icono/texto
 * - colorHover: Color en hover
 * - colorActive: Color en active
 * - colorBg: Color de fondo (para filled)
 * - colorBgHover: Color de fondo en hover (para filled)
 * - colorBorder: Color del borde (para outlined)
 * - colorTextHover: Color del texto en hover
 */
export const SemanticButtons = {
  info: {
    color: allColors.colorInfo,
    colorHover: allColors.colorInfoHover,
    colorActive: allColors.colorInfoActive,
    colorBg: allColors.colorInfoBg,
    colorBgHover: allColors.colorInfoBgHover,
    colorBorder: allColors.colorInfoBorder,
    colorBorderHover: allColors.colorInfoBorderHover,
    colorText: allColors.colorInfoText,
    colorTextHover: allColors.colorInfoTextHover,
    colorTextDisabled: allColors.colorInfoTextDisabled,
    colorBgDisabled: allColors.colorInfoBgDisabled,
  },
  success: {
    color: allColors.colorSuccess,
    colorHover: allColors.colorSuccessHover,
    colorActive: allColors.colorSuccessActive,
    colorBg: allColors.colorSuccessBg,
    colorBgHover: allColors.colorSuccessBgHover,
    colorBorder: allColors.colorSuccessBorder,
    colorBorderHover: allColors.colorSuccessBorderHover,
    colorText: allColors.colorSuccessText,
    colorTextHover: allColors.colorSuccessTextHover,
    colorTextDisabled: allColors.colorSuccessTextDisabled,
    colorBgDisabled: allColors.colorSuccessBgDisabled,
  },
  warning: {
    color: allColors.colorWarning,
    colorHover: allColors.colorWarningHover,
    colorActive: allColors.colorWarningActive,
    colorBg: allColors.colorWarningBg,
    colorBgHover: allColors.colorWarningBgHover,
    colorBorder: allColors.colorWarningBorder,
    colorBorderHover: allColors.colorWarningBorderHover,
    colorText: allColors.colorWarningText,
    colorTextHover: allColors.colorWarningTextHover,
    colorTextDisabled: allColors.colorWarningTextDisabled,
    colorBgDisabled: allColors.colorWarningBgDisabled,
  },
  error: {
    color: allColors.colorError,
    colorHover: allColors.colorErrorHover,
    colorActive: allColors.colorErrorActive,
    colorBg: allColors.colorErrorBg,
    colorBgHover: allColors.colorErrorBgHover,
    colorBorder: allColors.colorErrorBorder,
    colorBorderHover: allColors.colorErrorBorderHover,
    colorText: allColors.colorErrorText,
    colorTextHover: allColors.colorErrorTextHover,
    colorTextDisabled: allColors.colorErrorTextDisabled,
    colorBgDisabled: allColors.colorErrorBgDisabled,
  },
};
