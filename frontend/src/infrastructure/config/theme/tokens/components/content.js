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
  colorBgContainer: allColors.colorBgContainer,
  colorBorder: allColors.colorBorder,
  borderRadius: allSpacing.borderRadius,
  borderRadiusLG: allSpacing.borderRadiusLG,
  padding: allSpacing.paddingLG,
  paddingLG: allSpacing.paddingXL,
  // Nota: boxShadow no es una propiedad estándar de Ant Design, se maneja via CSS
};

/**
 * Typography - Tipografía
 * Propiedades reconocidas por Ant Design v5
 */
export const Typography = {
  colorText: allColors.colorText,
  colorTextHeading: allColors.colorPrimary,
  // Nota: fontSize y fontWeightStrong se definen en tokens globales
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
