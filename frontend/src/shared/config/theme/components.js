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
    // Borde claro para fondo blanco
    colorBorder: allColors.colorBorder,
    // Sombra (desde shadows.js) - Se usa en CSS personalizado
    boxShadow: shadows.shadowElevation2,
  },

  /**
   * Header - Barra superior
   */
  Header: {
    // Fondo blanco (igual que Sider)
    colorBgContainer: allColors.colorBgContainer,
    // Texto oscuro sobre fondo blanco
    colorText: allColors.colorText,
    colorTextSecondary: allColors.colorTextSecondary,
    // Borde claro para fondo blanco
    colorBorder: allColors.colorBorder,
    height: allSpacing.headerHeight,
    padding: `0 ${allSpacing.marginLG}px`,
    borderRadius: 0,
    // Sombra (desde shadows.js)
    boxShadow: shadows.shadowElevation1,
  },

  /**
   * Content - Área de contenido principal
   * Nota: Ant Design no tiene configuración específica para Content,
   * usa los valores del Layout general (bodyBg)
   * Los estilos personalizados se aplican vía CSS
   */

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
};
