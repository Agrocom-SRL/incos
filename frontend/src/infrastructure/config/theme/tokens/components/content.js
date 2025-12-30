// src/infrastructure/config/theme/components/content.js
/**
 * Content Components - Componentes de contenido y visualización
 * Card, Typography, Avatar
 */

import { allColors } from '../colors';
import { allSpacing } from '../spacing';
import { shadows } from '../shadows';

/**
 * Card - Cards para contenido
 * Propiedades reconocidas por Ant Design v5
 */
export const Card = {
  // Colores (similar a Button que tiene colorPrimary, etc.)
  colorBgContainer: allColors.colorBgContainer,
  colorBorder: allColors.colorBorderSecondary,
  colorBorderSecondary: allColors.colorAccentOliveBg,

  // Espaciado y forma
  borderRadius: allSpacing.borderRadius,
  borderRadiusLG: allSpacing.borderRadiusLG,
  padding: allSpacing.paddingLG,
  paddingLG: allSpacing.paddingXL,

  // Sombras - usando el sistema de sombras del tema
  // Nota: boxShadow no es una propiedad estándar de Ant Design, se aplica via styles
  boxShadow: shadows.shadowElevation2, // Sombra por defecto
  boxShadowHover: shadows.shadowElevation3, // Sombra en hover
  boxShadowPrimary: shadows.shadowPrimary,
  boxShadowSuccess: shadows.shadowSuccess,
  boxShadowInfo: shadows.shadowInfo,
  boxShadowWarning: shadows.shadowWarning,
  boxShadowError: shadows.shadowError,
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

/**
 * Table - Tablas de datos
 * Propiedades reconocidas por Ant Design v5
 * 
 * NOTA: Ant Design Table NO soporta propiedades de padding en el tema.
 * Los padding se manejan directamente en CSS usando variables del tema.
 */
export const Table = {
  // Colores base
  colorBgContainer: allColors.colorBgContainer,
  colorBorderSecondary: allColors.colorBorderSecondary,
  colorFillQuaternary: allColors.colorBgSpotlight, // Para filas alternadas
  colorFillTertiary: allColors.colorAccentOliveBg, // Para hover (usando colorAccentOliveBg)
  
  // Espaciado (solo borderRadius - padding se maneja en CSS)
  borderRadius: allSpacing.borderRadius,
  
  // Header
  headerBg: allColors.colorBgElevated,
  headerColor: allColors.colorPrimary,
  headerBorderRadius: allSpacing.borderRadius,
  
  // Header sorted (columna ordenada) - casos activos
  headerSortedBg: allColors.colorPrimaryBg, // Fondo verde claro cuando está ordenado (active)
  headerSortedColor: allColors.colorPrimary, // Color verde cuando está ordenado
  headerSortedHoverBg: allColors.colorAccentOliveBg, // Hover en header ordenado (usando colorAccentOliveBg)
  
  // Row hover - usando colorAccentOliveBg
  rowHoverBg: allColors.colorAccentOliveBg,
  
  // Border
  borderColor: allColors.colorBorder,
  headerSplitColor: allColors.colorBorder,
};
