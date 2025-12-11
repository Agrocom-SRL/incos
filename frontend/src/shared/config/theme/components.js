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
    bodyBg: allColors.colorBgLayout,  // Gris (#f5f5f5)
    
    // Trigger: Color primario para iconos
    triggerBg: allColors.colorPrimaryHover,
    triggerColor: allColors.colorPrimary,  // Verde primario para el icono
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
  },

  /**
   * Content - Área de contenido principal
   * Nota: Ant Design no tiene configuración específica para Content,
   * usa los valores del Layout general (bodyBg)
   * Los estilos personalizados se aplican vía CSS
   */
};
