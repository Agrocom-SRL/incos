// src/shared/config/theme/components.js
/**
 * Configuración específica de componentes de Ant Design - LAYOUT
 * TODOS los valores deben venir del tema (allColors, allSpacing, etc.)
 * 
 * FASE 1: Enfocados solo en Layout y sus componentes (Sider, Header, Content)
 * Los demás componentes se agregarán paso a paso
 */

import { allColors } from './colors';
import { allSpacing } from './spacing';
import { shadows } from './shadows';

export const componentConfig = {
  /**
   * Layout - Configuración general del Layout de Ant Design
   * Aplica a TODO el sistema de Layout (Sider, Header, Content, Footer)
   */
  Layout: {
    // Sider y Header: Blanco para diferenciarse del Content
    siderBg: allColors.colorBgContainer,  // Blanco
    headerBg: allColors.colorBgContainer,  // Blanco

    // Content: Gris más oscuro para diferenciarse del fondo blanco
    bodyBg: allColors.colorBgLayout,  // Gris
  },

  /**
   * Sider - Panel lateral (Sidebar)
   * Nota: En Ant Design v5, el color de fondo del Sider se controla con Layout.siderBg
   */
  Sider: {
    // Texto oscuro sobre fondo blanco
    colorText: allColors.colorText,
    colorTextSecondary: allColors.colorTextSecondary,
    colorBorder: allColors.colorBorder,
    boxShadow: shadows.shadowElevation2,
  },

  /**
   * Header - Barra superior
   */
  Header: {
    // Fondo blanco (igual que Sider)
    colorBgContainer: allColors.colorBgContainer,
    colorText: allColors.colorText,
    colorTextSecondary: allColors.colorTextSecondary,
    colorBorder: allColors.colorBorder,
    height: allSpacing.headerHeight,
    padding: `0 ${allSpacing.marginLG}px`,
    borderRadius: 0,
    boxShadow: shadows.shadowElevation1,
  },

  /**
   * IconButton - Botones con solo icono (componente personalizado)
   * Configuración simple: color base y hover
   */
  IconButton: {
    // Color base: verde oscuro (colorSuccess)
    color: allColors.colorPrimary,
    colorHoverBg: allColors.colorPrimaryHover,
    colorHoverText: allColors.colorPrimaryTextHover,
    colorActiveBg: allColors.colorPrimaryActive,
    colorActiveText: allColors.colorPrimaryText,
    colorDisabledBg: allColors.colorPrimaryBgDisabled,
    colorDisabledText: allColors.colorPrimaryTextDisabled,
  },

  /**
   * Avatar - Avatar de usuario
   * Usa colorInfo (azul) que complementa bien con el verde del logo/icon button
   */
  Avatar: {
    // Color de fondo: azul suave (colorInfo)
    colorBgContainer: allColors.colorAccentBlueBg,
    colorText: allColors.colorAccentBlue,
    colorTextHover: allColors.colorAccentBlueHover,
    colorBorder: allColors.colorAccentBlueBorder,
  },

  /**
   * Menu - Menú de navegación del Sidebar
   * Usa colores del Sider como base y verde primario para estados activos/seleccionados
   */
  Menu: {
    // Color de texto: mismo que Sider
    itemColor: allColors.colorText,
    // Items seleccionados (solo hijos finales)
    itemSelectedBg: allColors.colorPrimary,
    itemSelectedColor: allColors.colorPrimaryTextHover,
    // Items en hover
    itemHoverBg: allColors.colorPrimaryBg,
    itemHoverColor: allColors.colorPrimary,
    // Items activos (padres seleccionados directamente, sin hijos seleccionados)
    itemActiveBg: allColors.colorPrimaryBg,
    itemActiveColor: allColors.colorPrimary,
    itemActiveBorder: allColors.colorPrimaryBorder,
    // Fondo del menú (transparente para usar el del Sider)
    subMenuItemBg: 'transparent',
    // Items padre cuando tienen un hijo seleccionado
    itemParentSelectedBg: allColors.colorPrimaryBg,
    itemParentSelectedBorder: allColors.colorPrimary,
    itemParentSelectedColor: allColors.colorPrimary,
  },

  /**
   * Tooltip - Tooltips del menú cuando el sidebar está colapsado
   */
  Tooltip: {
    colorBgSpotlight: allColors.colorBgTooltip,
    borderRadius: allSpacing.borderRadiusMD,
    paddingBlock: allSpacing.paddingLG,
    paddingInline: allSpacing.paddingLG,
  },

  /**
   * Card - Cards para contenido
   */
  Card: {
    colorBgContainer: allColors.colorBgContainer,
    colorBorder: allColors.colorBorder,
    borderRadius: allSpacing.borderRadius,
    borderRadiusLG: allSpacing.borderRadiusLG,
    boxShadow: shadows.shadowElevation1,
    boxShadowHover: shadows.shadowElevation2,
    padding: allSpacing.paddingLG,
    paddingLG: allSpacing.paddingXL,
  },

  /**
   * Button - Botones
   */
  Button: {
    colorPrimary: allColors.colorPrimary,
    colorPrimaryHover: allColors.colorPrimaryHover,
    colorPrimaryActive: allColors.colorPrimaryActive,
    colorPrimaryBg: allColors.colorPrimaryBg,
    colorPrimaryBorder: allColors.colorPrimaryBorder,
    colorPrimaryText: allColors.colorPrimaryTextHover,
    borderRadius: allSpacing.borderRadius,
    controlHeight: allSpacing.controlHeight,
    controlHeightSM: allSpacing.controlHeightSM,
    controlHeightLG: allSpacing.controlHeightLG,
    paddingInline: allSpacing.marginLG,
    paddingBlock: allSpacing.paddingSM,
  },
};
