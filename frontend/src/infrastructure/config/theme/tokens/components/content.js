// src/infrastructure/config/theme/components/content.js
/**
 * Content Components - Componentes de contenido y visualización
 * Card, Typography, Avatar
 */

import { allColors } from '../colors';
import { allSpacing } from '../spacing';

/**
 * Card - Cards para contenido
 * Propiedades reconocidas por Ant Design v5
 */
export const Card = {
  // Colores (similar a Button que tiene colorPrimary, etc.)
  colorBgContainer: allColors.colorBgContainer,
  colorBorder: allColors.colorBorder,
  colorBorderSecondary: allColors.colorBorderSecondary,
  
  // Espaciado y forma
  borderRadius: allSpacing.borderRadius,
  borderRadiusLG: allSpacing.borderRadiusLG,
  padding: allSpacing.paddingLG,
  paddingLG: allSpacing.paddingXL,
  
  // Nota: boxShadow no es una propiedad estándar de Ant Design, se maneja via CSS
};

/**
 * Typography - Tipografía
 * Propiedades reconocidas por Ant Design v5
 * 
 * NOTA: fontFamily se define en tokens globales (allThemeTokens.fontFamily)
 * y se aplica automáticamente a todos los componentes de Ant Design
 */
export const Typography = {
  colorText: allColors.colorText,
  colorTextHeading: allColors.colorPrimary,
  // fontFamily, fontSize, fontWeightStrong se definen en tokens globales
  // y se aplican automáticamente a través de ConfigProvider
};

/**
 * Avatar - Avatar de usuario
 * Usa colorInfo (azul) que complementa bien con el verde del logo/icon button
 */
export const Avatar = {
  // Color de fondo: azul suave (colorInfo - reemplaza colorAccentBlue que era duplicado)
  colorBgContainer: allColors.colorInfoBg,
  colorText: allColors.colorInfo,
  colorTextHover: allColors.colorInfoHover,
  colorBorder: allColors.colorInfoBorder,
};

/**
 * Alert - Alertas y mensajes
 * Propiedades reconocidas por Ant Design v5
 */
export const Alert = {
  colorError: allColors.colorError,
  colorSuccess: allColors.colorSuccess,
  colorWarning: allColors.colorWarning,
  colorInfo: allColors.colorInfo,
  borderRadius: allSpacing.borderRadius,
  padding: allSpacing.padding,
  paddingContentHorizontal: allSpacing.paddingLG,
};
