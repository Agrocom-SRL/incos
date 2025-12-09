// src/shared/config/theme.config.js
/**
 * Configuración del tema de Ant Design para INCOS Santa Cruz
 * Basado en los colores institucionales del logo y la bandera cruceña
 */

import { theme } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = theme;

export const incosTheme = {
  token: {
    // COLORES PRINCIPALES
    colorPrimary: '#196b45',
    colorPrimaryHover: '#134d32',
    colorPrimaryActive: '#0f3a25',
    colorPrimaryBg: '#e8f5e9',
    colorPrimaryBgHover: '#c8e6c9',
    colorPrimaryBorder: '#22854f',
    colorPrimaryBorderHover: '#196b45',
    colorPrimaryText: '#196b45',
    colorPrimaryTextHover: '#134d32',
    colorPrimaryTextActive: '#0f3a25',

    // Color de éxito - Verde cruceño
    colorSuccess: '#06532b',
    colorSuccessHover: '#043d20',
    colorSuccessActive: '#032b16',
    colorSuccessBg: '#e8f5e9',
    colorSuccessBgHover: '#c8e6c9',
    colorSuccessBorder: '#087d3f',
    colorSuccessBorderHover: '#06532b',
    colorSuccessText: '#06532b',

    // Color de información - Azul cielo
    colorInfo: '#7d9bdc',
    colorInfoHover: '#5a78b8',
    colorInfoActive: '#4a6599',
    colorInfoBg: '#e3f2fd',
    colorInfoBgHover: '#bbdefb',
    colorInfoBorder: '#99b1e8',
    colorInfoBorderHover: '#7d9bdc',
    colorInfoText: '#7d9bdc',

    // Color de advertencia - Dorado
    colorWarning: '#f59e0b',
    colorWarningHover: '#d97706',
    colorWarningActive: '#b45309',
    colorWarningBg: '#fef3c7',
    colorWarningBgHover: '#fde68a',
    colorWarningBorder: '#fbbf24',
    colorWarningBorderHover: '#f59e0b',
    colorWarningText: '#f59e0b',

    // Color de error - Rojo vibrante
    colorError: '#e41c24',
    colorErrorHover: '#b81620',
    colorErrorActive: '#8f111a',
    colorErrorBg: '#fee2e2',
    colorErrorBgHover: '#fecaca',
    colorErrorBorder: '#ed4a50',
    colorErrorBorderHover: '#e41c24',
    colorErrorText: '#e41c24',

    // COLORES DE ENLACE
    colorLink: '#196b45',
    colorLinkHover: '#134d32',
    colorLinkActive: '#0f3a25',

    // COLORES DE FONDO
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#fafafa',
    colorBgSpotlight: '#f5f5f5',
    colorBgMask: 'rgba(0, 0, 0, 0.45)',

    // COLORES DE TEXTO
    colorText: '#333333',
    colorTextSecondary: '#666666',
    colorTextTertiary: '#999999',
    colorTextQuaternary: '#b6b5b5',
    colorTextDisabled: '#cccccc',
    colorTextPlaceholder: '#b6b5b5',
    colorTextDescription: '#666666',
    colorTextHeading: '#196b45',

    // COLORES DE BORDES
    colorBorder: '#e8e8e8',
    colorBorderSecondary: '#f0f0f0',
    colorSplit: '#e8e8e8',

    // TIPOGRAFÍA - SOLO POPPINS
    fontFamily: "'Poppins', sans-serif",
    fontFamilyCode: "'Courier New', monospace",
    fontSize: 16,
    fontSizeHeading1: 48,
    fontSizeHeading2: 36,
    fontSizeHeading3: 30,
    fontSizeHeading4: 24,
    fontSizeHeading5: 20,
    fontSizeSM: 14,
    fontSizeLG: 18,
    fontSizeXL: 20,
    fontWeightStrong: 600,
    lineHeight: 1.5,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.25,
    lineHeightHeading3: 1.3,
    lineHeightHeading4: 1.35,
    lineHeightHeading5: 1.4,
    lineHeightSM: 1.4,
    lineHeightLG: 1.6,

    // ESPACIADO Y SIZING
    marginXS: 4,
    marginSM: 8,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,
    paddingXS: 4,
    paddingSM: 8,
    padding: 16,
    paddingMD: 20,
    paddingLG: 24,
    paddingXL: 32,
    sizeStep: 4,
    sizeUnit: 4,

    // BORDER RADIUS
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // CONTROL HEIGHTS
    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 48,
    controlHeightXS: 24,

    // Z-INDEX
    zIndexBase: 0,
    zIndexPopupBase: 1000,

    // MOTION
    motionDurationFast: '0.15s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',

    // WIREFRAME
    wireframe: false,
  },

  components: {
    Button: {
      colorPrimary: '#196b45',
      colorPrimaryHover: '#134d32',
      colorPrimaryActive: '#0f3a25',
      primaryShadow: '0 4px 12px rgba(25, 107, 69, 0.2)',
      defaultShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
      dangerShadow: '0 4px 12px rgba(228, 28, 36, 0.2)',
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 500,
    },
    Input: {
      colorPrimary: '#196b45',
      colorPrimaryHover: '#134d32',
      activeBorderColor: '#196b45',
      hoverBorderColor: '#22854f',
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 8,
    },
    Menu: {
      itemSelectedBg: '#196b45',
      itemSelectedColor: '#ffffff',
      itemHoverBg: 'rgba(25, 107, 69, 0.1)',
      itemHoverColor: '#196b45',
      itemActiveBg: '#134d32',
      horizontalItemSelectedColor: '#196b45',
      horizontalItemSelectedBg: 'rgba(25, 107, 69, 0.1)',
      itemColor: '#333333',
      itemBorderRadius: 8,
    },
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#196b45',
      bodyBg: '#fafafa',
      triggerBg: '#134d32',
      triggerColor: '#ffffff',
    },
    Card: {
      headerBg: 'transparent',
      colorBorderSecondary: '#e8e8e8',
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
      borderRadius: 12,
    },
  },

  // ✅ CORRECCIÓN: usar defaultAlgorithm en lugar de 'default'
  algorithm: defaultAlgorithm,
};

// Versión dark (opcional)
export const incosDarkTheme = {
  ...incosTheme,
  algorithm: darkAlgorithm, // ✅ CORRECCIÓN
  token: {
    ...incosTheme.token,
    colorBgContainer: '#1a1a1a',
    colorBgLayout: '#0a0a0a',
    colorText: '#e8e8e8',
    colorTextSecondary: '#b6b5b5',
    colorBorder: '#333333',
  },
};

export default incosTheme;